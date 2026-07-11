import { Router } from "express";



import { authenticateUser } from "../../middlewares/auth.middleware";

import { inviteProjectMember , acceptProjectInvitation , rejectProjectInvitation, cancelProjectInvitation, getPendingProjectInvitations } from "./projectInvitation.controller";


const router = Router();



router.post(
    "/projects/:projectId/invitations",
    authenticateUser,
    inviteProjectMember
);

router.post(
    "/project-invitations/:invitationId/accept",
    authenticateUser,
    acceptProjectInvitation
);

router.post(
    "/project-invitations/:invitationId/reject",
    authenticateUser,
    rejectProjectInvitation
);

router.delete(
    "/project-invitations/:invitationId",
    authenticateUser,
    cancelProjectInvitation
);

router.get(
    "/projects/:projectId/invitations",
    authenticateUser,
    getPendingProjectInvitations
);

export default router;