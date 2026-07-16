import { Router } from "express";

const router = Router();

import { authenticateUser } from "../../middlewares/auth.middleware";
import { createTask , getProjectTasks , getTask , archiveTask , restoreTask , updateTask , updateTaskStatus , reorderProjectTasks} from "./task.controller";




router.post(
    "/projects/:projectId/tasks",
    authenticateUser,
    createTask
);

router.get(
    "/tasks/:taskId",
    authenticateUser,
    getTask
);

router.get(
    "/projects/:projectId/tasks",
    authenticateUser,
    getProjectTasks
);
router.patch(
    "/projects/:projectId/tasks/reorder",
    authenticateUser,
    reorderProjectTasks
);

router.patch(
    "/tasks/:taskId",
    authenticateUser,
    updateTask
);

router.patch(
    "/tasks/:taskId/archive",
    authenticateUser,
    archiveTask
);

router.patch(
    "/tasks/:taskId/restore",
    authenticateUser,
    restoreTask
);

router.patch(
    "/tasks/:taskId/status",
    authenticateUser,
    updateTaskStatus
);



export default router;