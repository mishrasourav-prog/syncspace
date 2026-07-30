import { Router } from "express";

import { authenticateUser } from "../../middlewares/auth.middleware";

import {
  archiveWorkspace,
  authorizeWorkspaceAvatarManagement,
  createWorkspace,
  getUserWorkspaces,
  getWorkspace,
  removeWorkspaceAvatar,
  replaceWorkspaceAvatar,
  restoreWorkspace,
  updateWorkspace,
} from "./workspace.controller";

import { uploadWorkspaceAvatar } from "./workspace.upload";

const router = Router();

router.use(authenticateUser);

router.post("/", createWorkspace);

router.get("/", getUserWorkspaces);

router.post(
  "/:workspaceId/avatar",
  authorizeWorkspaceAvatarManagement,
  uploadWorkspaceAvatar,
  replaceWorkspaceAvatar,
);

router.delete(
  "/:workspaceId/avatar",
  authorizeWorkspaceAvatarManagement,
  removeWorkspaceAvatar,
);

router.get("/:workspaceId", getWorkspace);

router.patch("/:workspaceId", updateWorkspace);

router.patch("/:workspaceId/archive", archiveWorkspace);

router.patch("/:workspaceId/restore", restoreWorkspace);

export default router;
