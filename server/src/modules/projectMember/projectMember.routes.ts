import { Router } from "express";

import { authenticateUser } from "../../middlewares/auth.middleware";

import {
    getProjectMembers,
    updateMemberRole,
    removeMember,
    leaveProject,
} from "./projectMember.controller";

const router = Router();

/*
|--------------------------------------------------------------------------
| Project Members
|--------------------------------------------------------------------------
*/

router.get(
    "/projects/:projectId/members",
    authenticateUser,
    getProjectMembers
);

router.patch(
    "/projects/:projectId/members/:memberId/role",
    authenticateUser,
    updateMemberRole
);

router.delete(
    "/projects/:projectId/members/:memberId",
    authenticateUser,
    removeMember
);

router.post(
    "/projects/:projectId/leave",
    authenticateUser,
    leaveProject
);

export default router;