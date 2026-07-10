import { Router } from "express";

import { getWorkspaceMembers , updateMemberRole , removeMember , leaveWorkspace} from "./workspace-member.controller";

import { authenticateUser } from "../../middlewares/auth.middleware";


const router = Router();


router.get(
    "/:workspaceId/members",
    authenticateUser,
    getWorkspaceMembers
);

router.patch(
    "/:workspaceId/members/:memberId",
    authenticateUser,
    updateMemberRole
);

router.delete(
    "/:workspaceId/members/:memberId",
    authenticateUser,
    removeMember
);

router.post(
    "/:workspaceId/leave",
    authenticateUser,
    leaveWorkspace
);

export default router;