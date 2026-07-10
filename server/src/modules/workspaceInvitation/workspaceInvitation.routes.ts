import { Router } from "express";

import { authenticateUser } from "../../middlewares/auth.middleware";

import {
    inviteUser,
    getMyInvitations,
    acceptInvitation,
    rejectInvitation
} from "./workspaceInvitation.controller";

const router = Router();

router.post(
    "/:workspaceId/invitations",
    authenticateUser,
    inviteUser
);

router.get(
    "/invitations",
    authenticateUser,
    getMyInvitations
);

router.post(
    "/invitations/:invitationId/accept",
    authenticateUser,
    acceptInvitation
);

router.post(
    "/invitations/:invitationId/reject",
    authenticateUser,
    rejectInvitation
);

export default router;