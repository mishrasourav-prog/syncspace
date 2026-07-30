import { Router } from "express";
import { authenticateUser } from "../../middlewares/auth.middleware";
import {
  acceptTaskAssignmentRequest,
  createTaskAssignmentRequest,
  getTaskAssignmentRequests,
} from "./taskAssignmentRequest.controller";

const router = Router();

router.get(
  "/tasks/:taskId/assignment-requests",
  authenticateUser,
  getTaskAssignmentRequests,
);

router.post(
  "/tasks/:taskId/assignment-requests",
  authenticateUser,
  createTaskAssignmentRequest,
);

router.post(
  "/tasks/:taskId/assignment-requests/:requestId/accept",
  authenticateUser,
  acceptTaskAssignmentRequest,
);

export default router;
