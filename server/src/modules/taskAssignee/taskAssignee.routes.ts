import { Router } from "express";

import { authenticateUser } from "../../middlewares/auth.middleware";

import {
    assignMember,
    getTaskAssignees,
    removeAssignee,
} from "./taskAssignee.controller";

const router = Router();

/*
|--------------------------------------------------------------------------
| Task Assignees
|--------------------------------------------------------------------------
*/

router.post(
    "/tasks/:taskId/assignees",
    authenticateUser,
    assignMember
);

router.get(
    "/tasks/:taskId/assignees",
    authenticateUser,
    getTaskAssignees
);

router.delete(
    "/tasks/:taskId/assignees/:userId",
    authenticateUser,
    removeAssignee
);

export default router;