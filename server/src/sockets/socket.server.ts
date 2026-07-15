import type {
    Server as HTTPServer,
} from "node:http";

import {
    Server,
} from "socket.io";

import Project from "../modules/project/project.model";

import ProjectMember from "../modules/projectMember/projectMember.model";

import {
    WorkspaceMember,
} from "../modules/workspace-member/workspace-member.model";

import {
    objectIdSchema,
} from "../validators/common.validation";

import {
    authenticateSocket,
} from "./socket.auth";

import {
    getProjectRoom,
    getUserRoom,
    getWorkspaceRoom,
} from "./socket.rooms";

import type {
    ClientToServerEvents,
    InterServerEvents,
    ServerToClientEvents,
    SocketData,
} from "../interfaces/socket.interface";

/*
|--------------------------------------------------------------------------
| Typed Socket.IO Server
|--------------------------------------------------------------------------
*/

export type SocketServer =
    Server<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >;

let socketServer:
    SocketServer |
    null =
        null;

/*
|--------------------------------------------------------------------------
| Initialize Socket.IO
|--------------------------------------------------------------------------
*/

export const initializeSocketServer = (
    httpServer: HTTPServer
): SocketServer => {
    /*
    Prevent accidental initialization more than once.
    */

    if (socketServer) {
        return socketServer;
    }

    const clientUrl =
        process.env.CLIENT_URL;

    if (!clientUrl) {
        throw new Error(
            "CLIENT_URL is not configured."
        );
    }

    socketServer =
        new Server<
            ClientToServerEvents,
            ServerToClientEvents,
            InterServerEvents,
            SocketData
        >(
            httpServer,
            {
                cors: {
                    origin:
                        clientUrl,

                    credentials:
                        true,
                },
            }
        );

    /*
    |--------------------------------------------------------------------------
    | Authentication Middleware
    |--------------------------------------------------------------------------
    */

    socketServer.use(
        authenticateSocket
    );

    /*
    |--------------------------------------------------------------------------
    | Connection Handler
    |--------------------------------------------------------------------------
    */

    socketServer.on(
        "connection",
        async (socket) => {
            /*
            Every browser tab or device creates its own socket ID.
            */

            const userId =
                socket.data.userId;

            /*
            Automatically join the authenticated user's room.

            All tabs and devices belonging to this user will join
            the same user room.
            */

            await socket.join(
                getUserRoom(
                    userId
                )
            );

            console.log(
                `Socket connected: ${socket.id} for user ${userId}`
            );

            /*
            Tell the client that authentication and room setup
            completed successfully.
            */

            socket.emit(
                "socket:ready",
                {
                    userId,

                    socketId:
                        socket.id,
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Join Workspace Room
            |--------------------------------------------------------------------------
            */

            socket.on(
                "workspace:join",
                async (
                    workspaceId,
                    acknowledge
                ) => {
                    try {
                        const parsedId =
                            objectIdSchema
                                .safeParse(
                                    workspaceId
                                );

                        if (
                            !parsedId.success
                        ) {
                            return acknowledge({
                                success:
                                    false,

                                message:
                                    "Invalid workspace ID.",
                            });
                        }

                        /*
                        Never trust the client merely because it knows
                        a workspace ID.

                        Verify membership before joining the room.
                        */

                        const membership =
                            await WorkspaceMember
                                .exists({
                                    workspace:
                                        parsedId.data,

                                    user:
                                        userId,
                                });

                        if (!membership) {
                            return acknowledge({
                                success:
                                    false,

                                message:
                                    "You are not a member of this workspace.",
                            });
                        }

                        await socket.join(
                            getWorkspaceRoom(
                                parsedId.data
                            )
                        );

                        return acknowledge({
                            success:
                                true,

                            message:
                                "Workspace room joined.",
                        });
                    } catch {
                        return acknowledge({
                            success:
                                false,

                            message:
                                "Unable to join workspace room.",
                        });
                    }
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Leave Workspace Room
            |--------------------------------------------------------------------------
            */

            socket.on(
                "workspace:leave",
                async (
                    workspaceId,
                    acknowledge
                ) => {
                    const parsedId =
                        objectIdSchema
                            .safeParse(
                                workspaceId
                            );

                    if (
                        !parsedId.success
                    ) {
                        return acknowledge({
                            success:
                                false,

                            message:
                                "Invalid workspace ID.",
                        });
                    }

                    await socket.leave(
                        getWorkspaceRoom(
                            parsedId.data
                        )
                    );

                    return acknowledge({
                        success:
                            true,

                        message:
                            "Workspace room left.",
                    });
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Join Project Room
            |--------------------------------------------------------------------------
            */

            socket.on(
                "project:join",
                async (
                    projectId,
                    acknowledge
                ) => {
                    try {
                        const parsedId =
                            objectIdSchema
                                .safeParse(
                                    projectId
                                );

                        if (
                            !parsedId.success
                        ) {
                            return acknowledge({
                                success:
                                    false,

                                message:
                                    "Invalid project ID.",
                            });
                        }

                        const project =
                            await Project.findById(
                                parsedId.data
                            )
                                .select(
                                    "_id workspace"
                                )
                                .lean();

                        if (!project) {
                            return acknowledge({
                                success:
                                    false,

                                message:
                                    "Project not found.",
                            });
                        }

                        /*
                        Check project membership and workspace membership.

                        Project membership alone is not enough if the
                        user has been removed from the workspace.
                        */

                        const [
                            projectMembership,
                            workspaceMembership,
                        ] =
                            await Promise.all([
                                ProjectMember
                                    .exists({
                                        project:
                                            project._id,

                                        user:
                                            userId,
                                    }),

                                WorkspaceMember
                                    .exists({
                                        workspace:
                                            project.workspace,

                                        user:
                                            userId,
                                    }),
                            ]);

                        if (
                            !projectMembership ||
                            !workspaceMembership
                        ) {
                            return acknowledge({
                                success:
                                    false,

                                message:
                                    "You do not have access to this project.",
                            });
                        }

                        await socket.join(
                            getProjectRoom(
                                parsedId.data
                            )
                        );

                        return acknowledge({
                            success:
                                true,

                            message:
                                "Project room joined.",
                        });
                    } catch {
                        return acknowledge({
                            success:
                                false,

                            message:
                                "Unable to join project room.",
                        });
                    }
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Leave Project Room
            |--------------------------------------------------------------------------
            */

            socket.on(
                "project:leave",
                async (
                    projectId,
                    acknowledge
                ) => {
                    const parsedId =
                        objectIdSchema
                            .safeParse(
                                projectId
                            );

                    if (
                        !parsedId.success
                    ) {
                        return acknowledge({
                            success:
                                false,

                            message:
                                "Invalid project ID.",
                        });
                    }

                    await socket.leave(
                        getProjectRoom(
                            parsedId.data
                        )
                    );

                    return acknowledge({
                        success:
                            true,

                        message:
                            "Project room left.",
                    });
                }
            );

            /*
            |--------------------------------------------------------------------------
            | Disconnect
            |--------------------------------------------------------------------------
            */

            socket.on(
                "disconnect",
                (reason) => {
                    console.log(
                        `Socket disconnected: ${socket.id}. Reason: ${reason}`
                    );
                }
            );
        }
    );

    return socketServer;
};

/*
|--------------------------------------------------------------------------
| Retrieve Socket.IO Server
|--------------------------------------------------------------------------
|
| Domain-event subscribers will use this function to emit
| real-time updates.
|
*/

export const getSocketServer =
    (): SocketServer => {
        if (!socketServer) {
            throw new Error(
                "Socket.IO server has not been initialized."
            );
        }

        return socketServer;
    };