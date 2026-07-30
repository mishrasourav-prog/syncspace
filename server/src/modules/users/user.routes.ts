import { Router } from "express";

import { authenticateUser } from "../../middlewares/auth.middleware";

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

import { uploadAvatar } from "./user.upload";

const router = Router();

router.use(authenticateUser);

router.get("/me/profile", getSelfProfile);

router.patch("/me/profile", updateSelfProfile);

router.post("/me/avatar", uploadAvatar, replaceAvatar);

router.delete("/me/avatar", removeAvatar);

router.patch("/me/password", changePassword);

router.get("/me/deletion-readiness", getDeletionReadiness);

router.delete("/me", deleteAccount);

router.get("/:userId/profile", getMemberProfile);

export default router;
