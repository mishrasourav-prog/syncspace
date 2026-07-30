import { Router } from "express";

import { authenticateUser } from "../../middlewares/auth.middleware";

import {
  inviteUser,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
} from "./workspaceInvitation.controller";

const router = Router();

router.post(
  "/workspaces/:workspaceId/invitations",
  authenticateUser,
  inviteUser,
);

router.get("/workspace-invitations", authenticateUser, getMyInvitations);

router.post(
  "/workspace-invitations/:invitationId/accept",
  authenticateUser,
  acceptInvitation,
);

router.post(
  "/workspace-invitations/:invitationId/reject",
  authenticateUser,
  rejectInvitation,
);

export default router;
