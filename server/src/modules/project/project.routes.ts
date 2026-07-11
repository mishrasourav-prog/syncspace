import { Router } from "express";

import { authenticateUser  } from "../../middlewares/auth.middleware";

import {
    createProject,
    getWorkspaceProjects,
    getProject,
    updateProject,
    archiveProject,
    restoreProject
} from "./project.controller";

const router = Router();

router.post(
    "/:workspaceId/projects",
    authenticateUser,
    createProject
);

router.get(
    "/:workspaceId/projects",
    authenticateUser,
    getWorkspaceProjects
);

router.get(
    "/:projectId",
    authenticateUser,
    getProject
);

router.patch(
    "/:projectId",
    authenticateUser,
    updateProject
);

router.patch(
    "/:projectId/archive",
    authenticateUser,
    archiveProject
);

router.patch(
    "/:projectId/restore",
    authenticateUser,
    restoreProject
);

export default router;