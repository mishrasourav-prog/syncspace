import { Router } from "express";



import { authenticateUser } from "../../middlewares/auth.middleware";

import { createWorkspace ,  getUserWorkspaces, getWorkspace , updateWorkspace, archiveWorkspace, restoreWorkspace , getArchivedWorkspaces} from "./workspace.controller";


const router = Router();

/**
 * Protected Routes
 */
router.post("/", authenticateUser, createWorkspace);
router.get(
    "/archived",
    authenticateUser,
    getArchivedWorkspaces
);
router.get(
    "/",
    authenticateUser,
    getUserWorkspaces
);
router.get(
    "/:workspaceId",
    authenticateUser,
    getWorkspace
);
router.patch(
    "/:workspaceId",
    authenticateUser,
    updateWorkspace
);
router.patch(
    "/:workspaceId/archive",
    authenticateUser,
    archiveWorkspace
);
router.patch(
    "/:workspaceId/restore",
    authenticateUser,
    restoreWorkspace
);

export default router;