import {
    Router,
} from "express";

import {
    authenticateUser,
} from "../../middlewares/auth.middleware";

import {
    getProjectActivities,
    getWorkspaceActivities,
} from "./activity.controller";

const router =
    Router();

router.get(
    "/projects/:projectId/activities",
    authenticateUser,
    getProjectActivities
);

router.get(
    "/workspaces/:workspaceId/activities",
    authenticateUser,
    getWorkspaceActivities
);

export default router;