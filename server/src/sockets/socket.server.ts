import type { Server as HTTPServer } from "node:http";

import { Server } from "socket.io";

import Project from "../modules/project/project.model";

import ProjectMember from "../modules/projectMember/projectMember.model";

import { WorkspaceMember } from "../modules/workspace-member/workspace-member.model";

import { objectIdSchema } from "../validators/common.validation";

import { authenticateSocket } from "./socket.auth";

import { getProjectRoom, getUserRoom, getWorkspaceRoom } from "./socket.rooms";

import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../interfaces/socket.interface";

export type SocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

let socketServer: SocketServer | null = null;

export const initializeSocketServer = (
  httpServer: HTTPServer,
): SocketServer => {
  if (socketServer) {
    return socketServer;
  }

  const clientUrl = process.env.CLIENT_URL;

  if (!clientUrl) {
    throw new Error("CLIENT_URL is not configured.");
  }

  socketServer = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: clientUrl,

      credentials: true,
    },
  });

  socketServer.use(authenticateSocket);

  socketServer.on("connection", async (socket) => {
    const userId = socket.data.userId;

    await socket.join(getUserRoom(userId));

    console.log(`Socket connected: ${socket.id} for user ${userId}`);

    socket.emit("socket:ready", {
      userId,

      socketId: socket.id,
    });

    socket.on("workspace:join", async (workspaceId, acknowledge) => {
      try {
        const parsedId = objectIdSchema.safeParse(workspaceId);

        if (!parsedId.success) {
          return acknowledge({
            success: false,

            message: "Invalid workspace ID.",
          });
        }

        const membership = await WorkspaceMember.exists({
          workspace: parsedId.data,

          user: userId,
        });

        if (!membership) {
          return acknowledge({
            success: false,

            message: "You are not a member of this workspace.",
          });
        }

        await socket.join(getWorkspaceRoom(parsedId.data));

        return acknowledge({
          success: true,

          message: "Workspace room joined.",
        });
      } catch {
        return acknowledge({
          success: false,

          message: "Unable to join workspace room.",
        });
      }
    });

    socket.on("workspace:leave", async (workspaceId, acknowledge) => {
      const parsedId = objectIdSchema.safeParse(workspaceId);

      if (!parsedId.success) {
        return acknowledge({
          success: false,

          message: "Invalid workspace ID.",
        });
      }

      await socket.leave(getWorkspaceRoom(parsedId.data));

      return acknowledge({
        success: true,

        message: "Workspace room left.",
      });
    });

    socket.on("project:join", async (projectId, acknowledge) => {
      try {
        const parsedId = objectIdSchema.safeParse(projectId);

        if (!parsedId.success) {
          return acknowledge({
            success: false,

            message: "Invalid project ID.",
          });
        }

        const project = await Project.findById(parsedId.data)
          .select("_id workspace")
          .lean();

        if (!project) {
          return acknowledge({
            success: false,

            message: "Project not found.",
          });
        }

        const [projectMembership, workspaceMembership] = await Promise.all([
          ProjectMember.exists({
            project: project._id,

            user: userId,
          }),

          WorkspaceMember.exists({
            workspace: project.workspace,

            user: userId,
          }),
        ]);

        if (!projectMembership || !workspaceMembership) {
          return acknowledge({
            success: false,

            message: "You do not have access to this project.",
          });
        }

        await socket.join(getProjectRoom(parsedId.data));

        return acknowledge({
          success: true,

          message: "Project room joined.",
        });
      } catch {
        return acknowledge({
          success: false,

          message: "Unable to join project room.",
        });
      }
    });

    socket.on("project:leave", async (projectId, acknowledge) => {
      const parsedId = objectIdSchema.safeParse(projectId);

      if (!parsedId.success) {
        return acknowledge({
          success: false,

          message: "Invalid project ID.",
        });
      }

      await socket.leave(getProjectRoom(parsedId.data));

      return acknowledge({
        success: true,

        message: "Project room left.",
      });
    });

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id}. Reason: ${reason}`);
    });
  });

  return socketServer;
};

export const getSocketServer = (): SocketServer => {
  if (!socketServer) {
    throw new Error("Socket.IO server has not been initialized.");
  }

  return socketServer;
};

export const isSocketServerInitialized = (): boolean => {
  return socketServer !== null;
};

export const closeSocketServer = async (): Promise<void> => {
  if (!socketServer) {
    return;
  }

  const currentSocketServer = socketServer;

  socketServer = null;

  await new Promise<void>((resolve) => {
    currentSocketServer.close(() => {
      resolve();
    });
  });
};
