import {
    Router,
} from "express";

import systemController from "./system.controller";

const systemRouter =
    Router();

/*
These routes intentionally do not require authentication.

Deployment platforms, load balancers and monitoring systems
must be able to call them without an application account.
*/

systemRouter.get(
    "/health",
    systemController
        .health
        .bind(
            systemController
        )
);

systemRouter.get(
    "/ready",
    systemController
        .readiness
        .bind(
            systemController
        )
);

export default systemRouter;