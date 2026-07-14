import { Router } from "express";

import { authenticateUser } from "../../middlewares/auth.middleware";

import {
    getProjectMembers,
    updateProjectMemberRole,
    removeProjectMember,
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
    updateProjectMemberRole
);

router.delete(
    "/projects/:projectId/members/:memberId",
    authenticateUser,
    removeProjectMember
);

router.post(
    "/projects/:projectId/leave",
    authenticateUser,
    leaveProject
);

export default router;