import { Router } from "express";

import {
  createTaskComment,
  deleteTaskComment,
  getTaskComments,
  updateTaskComment,
} from "./taskComment.controller";

import { authenticateUser } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/tasks/:taskId/comments", authenticateUser, createTaskComment);

router.get("/tasks/:taskId/comments", authenticateUser, getTaskComments);

router.patch("/comments/:commentId", authenticateUser, updateTaskComment);

router.delete("/comments/:commentId", authenticateUser, deleteTaskComment);

export default router;
