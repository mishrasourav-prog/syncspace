import type { Request, Response } from "express";

import mongoose from "mongoose";

import { isServerShuttingDown } from "../../runtime/serverState";

import { isSocketServerInitialized } from "../../sockets/socket.server";

const databaseStateNames: Record<number, string> = {
  0: "disconnected",

  1: "connected",

  2: "connecting",

  3: "disconnecting",
};

class SystemController {
  health(_req: Request, res: Response): Response {
    return res.status(200).json({
      status: "ok",

      timestamp: new Date().toISOString(),

      uptimeSeconds: Math.floor(process.uptime()),

      environment: process.env.NODE_ENV ?? "development",
    });
  }

  readiness(_req: Request, res: Response): Response {
    const mongooseState = mongoose.connection.readyState;

    const databaseState = databaseStateNames[mongooseState] ?? "unknown";

    const databaseConnected = mongooseState === 1;

    const socketInitialized = isSocketServerInitialized();

    const shuttingDown = isServerShuttingDown();

    const ready = databaseConnected && socketInitialized && !shuttingDown;

    return res.status(ready ? 200 : 503).json({
      status: ready ? "ready" : "not_ready",

      timestamp: new Date().toISOString(),

      checks: {
        database: {
          ready: databaseConnected,

          state: databaseState,
        },

        socketServer: {
          ready: socketInitialized,
        },

        shutdown: {
          active: shuttingDown,
        },
      },
    });
  }
}

const systemController = new SystemController();

export default systemController;
