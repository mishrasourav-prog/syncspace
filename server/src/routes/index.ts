import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes";

import workspaceRoutes from "../modules/workspace/workspace.routes";

const router = Router();

router.use("/auth", authRoutes);

router.use("/workspaces", workspaceRoutes);

export default router;