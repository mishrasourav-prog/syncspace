import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes";

import workspaceRoutes from "../modules/workspace/workspace.routes";

import workspaceInvitationRoutes from "../modules/workspaceInvitation/workspaceInvitation.routes";

import projectRoutes from "../modules/project/project.routes"
import projectInvitationRoutes from "../modules/projectInvitation/projectInvitation.routes";

import projectMemberRoutes from "../modules/projectMember/projectMember.routes";

const router = Router();

router.use("/auth", authRoutes);

router.use("/workspaces", workspaceRoutes);

router.use(
    "/workspace-invitations",
    workspaceInvitationRoutes
);

router.use(
    "/workspaces",
    projectRoutes
);

router.use(
    projectInvitationRoutes
);

router.use(
    "/",
    projectMemberRoutes
);

export default router;