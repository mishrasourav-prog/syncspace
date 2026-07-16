import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes";

import workspaceRoutes from "../modules/workspace/workspace.routes";

import workspaceInvitationRoutes from "../modules/workspaceInvitation/workspaceInvitation.routes";

import workspaceMemberRoutes from "../modules/workspace-member/workspace-member.routes"

import projectRoutes from "../modules/project/project.routes"
import projectInvitationRoutes from "../modules/projectInvitation/projectInvitation.routes";

import projectMemberRoutes from "../modules/projectMember/projectMember.routes";

import taskRoutes from "../modules/tasks/task.routes";

import taskAssigneeRoutes from "../modules/taskAssignee/taskAssignee.routes";

import taskCommentRoutes from "../modules/taskComment/taskComment.routes";

import activityRouter from "../modules/activity/activity.routes";

import notificationRouter from "../modules/notifications/notification.routes";

import documentRouter from "../modules/documents/document.routes";

import discussionRouter from "../modules/discussions/discussions.routes";

const router = Router();

router.use("/auth", authRoutes);

router.use("/workspaces", workspaceRoutes);

router.use(
    "/",
    workspaceInvitationRoutes
);

router.use(
    "/workspaces",
    workspaceMemberRoutes
);

router.use("/", projectRoutes);
router.use(
    projectInvitationRoutes
);

router.use(
    "/",
    projectMemberRoutes
);

router.use(
    "/",
    taskRoutes
)

router.use("/", taskAssigneeRoutes);

router.use("/", taskCommentRoutes);

router.use(
    "/",
    activityRouter
);


router.use(
    "/",
    notificationRouter
);

router.use(
    documentRouter
);

router.use(
    discussionRouter
);


export default router;