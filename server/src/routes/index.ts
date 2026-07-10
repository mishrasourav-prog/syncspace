import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes";

import workspaceRoutes from "../modules/workspace/workspace.routes";

import workspaceInvitationRoutes from "../modules/workspaceInvitation/workspaceInvitation.routes";

const router = Router();

router.use("/auth", authRoutes);

router.use("/workspaces", workspaceRoutes);

router.use(
    "/workspace-invitations",
    workspaceInvitationRoutes
);

export default router;