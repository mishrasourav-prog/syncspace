import { Router } from "express";

import { authenticateUser } from "../../middlewares/auth.middleware";

import {
    createProject,
    getWorkspaceProjects,
    getProject,
    updateProject,
    archiveProject,
    restoreProject,
} from "./project.controller";

const router = Router();

/*
|--------------------------------------------------------------------------
| Workspace-scoped Project Routes
|--------------------------------------------------------------------------
*/

router.post(
    "/workspaces/:workspaceId/projects",
    authenticateUser,
    createProject
);

router.get(
    "/workspaces/:workspaceId/projects",
    authenticateUser,
    getWorkspaceProjects
);

/*
|--------------------------------------------------------------------------
| Individual Project Routes
|--------------------------------------------------------------------------
*/

router.get(
    "/projects/:projectId",
    authenticateUser,
    getProject
);

router.patch(
    "/projects/:projectId",
    authenticateUser,
    updateProject
);

router.patch(
    "/projects/:projectId/archive",
    authenticateUser,
    archiveProject
);

router.patch(
    "/projects/:projectId/restore",
    authenticateUser,
    restoreProject
);

export default router;