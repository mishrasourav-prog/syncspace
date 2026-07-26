import {
  Router,
} from "express";

import {
  authenticateUser,
} from "../../middlewares/auth.middleware";

import {
  changePassword,
  deleteAccount,
  getDeletionReadiness,
  getMemberProfile,
  getSelfProfile,
  removeAvatar,
  replaceAvatar,
  updateSelfProfile,
} from "./user.controller";

import {
  uploadAvatar,
} from "./user.upload";

const router =
  Router();

/*
|--------------------------------------------------------------------------
| All User/Profile Routes Require Authentication
|--------------------------------------------------------------------------
|
| The member-profile endpoint is also protected. Its service performs an
| additional workspace/project membership check before returning the target
| user's safe public profile.
|
*/

router.use(
  authenticateUser
);

/*
|--------------------------------------------------------------------------
| Authenticated User Profile
|--------------------------------------------------------------------------
*/

router.get(
  "/me/profile",
  getSelfProfile
);

router.patch(
  "/me/profile",
  updateSelfProfile
);

/*
|--------------------------------------------------------------------------
| Avatar Management
|--------------------------------------------------------------------------
|
| Multipart field name:
|
| avatar
|
*/

router.post(
  "/me/avatar",
  uploadAvatar,
  replaceAvatar
);

router.delete(
  "/me/avatar",
  removeAvatar
);

/*
|--------------------------------------------------------------------------
| Password and Account Security
|--------------------------------------------------------------------------
*/

router.patch(
  "/me/password",
  changePassword
);

router.get(
  "/me/deletion-readiness",
  getDeletionReadiness
);

router.delete(
  "/me",
  deleteAccount
);

/*
|--------------------------------------------------------------------------
| Context-Authorized Read-Only Member Profile
|--------------------------------------------------------------------------
|
| At least one authorization context must be supplied:
|
| GET /users/:userId/profile?workspaceId=<workspaceId>
| GET /users/:userId/profile?projectId=<projectId>
| GET /users/:userId/profile?workspaceId=<workspaceId>&projectId=<projectId>
|
| Static /me routes are intentionally declared before this parameter route.
|
*/

router.get(
  "/:userId/profile",
  getMemberProfile
);

export default router;