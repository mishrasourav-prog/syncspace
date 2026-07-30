import { Router } from "express";

import systemController from "./system.controller";

const systemRouter = Router();

systemRouter.get("/health", systemController.health.bind(systemController));

systemRouter.get("/ready", systemController.readiness.bind(systemController));

export default systemRouter;
