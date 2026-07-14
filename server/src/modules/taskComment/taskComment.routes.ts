import { Router } from "express";

import {
    createTaskComment,
    deleteTaskComment,
    getTaskComments,
    updateTaskComment,
} from "./taskComment.controller";

import { authenticateUser } from "../../middlewares/auth.middleware";

const router = Router();

/*
|--------------------------------------------------------------------------
| Task-scoped comment routes
|--------------------------------------------------------------------------
*/

router.post(
    "/tasks/:taskId/comments",
    authenticateUser,
    createTaskComment
);

router.get(
    "/tasks/:taskId/comments",
    authenticateUser,
    getTaskComments
);

/*
|--------------------------------------------------------------------------
| Individual comment routes
|--------------------------------------------------------------------------
*/

router.patch(
    "/comments/:commentId",
    authenticateUser,
    updateTaskComment
);

router.delete(
    "/comments/:commentId",
    authenticateUser,
    deleteTaskComment
);

export default router;