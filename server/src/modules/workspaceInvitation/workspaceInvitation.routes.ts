import { Router } from "express";

import {
    authenticateUser,
} from "../../middlewares/auth.middleware";

import {
    inviteUser,
    getMyInvitations,
    acceptInvitation,
    rejectInvitation,
} from "./workspaceInvitation.controller";

const router = Router();

/*
|--------------------------------------------------------------------------
| Workspace-scoped Invitation Route
|--------------------------------------------------------------------------
*/

router.post(
    "/workspaces/:workspaceId/invitations",
    authenticateUser,
    inviteUser
);

/*
|--------------------------------------------------------------------------
| Current User Invitations
|--------------------------------------------------------------------------
*/

router.get(
    "/workspace-invitations",
    authenticateUser,
    getMyInvitations
);

/*
|--------------------------------------------------------------------------
| Individual Invitation Actions
|--------------------------------------------------------------------------
*/

router.post(
    "/workspace-invitations/:invitationId/accept",
    authenticateUser,
    acceptInvitation
);

router.post(
    "/workspace-invitations/:invitationId/reject",
    authenticateUser,
    rejectInvitation
);

export default router;