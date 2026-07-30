import dotenv from "dotenv";

dotenv.config();

import http from "node:http";

import mongoose from "mongoose";

import app from "./app";

import { registerDomainEventSubscribers } from "./events/registersSubscribers";

import { markServerAsShuttingDown } from "./runtime/serverState";

import {
  closeSocketServer,
  initializeSocketServer,
  isSocketServerInitialized,
} from "./sockets/socket.server";

const PORT = Number(process.env.PORT) || 5000;

const server = http.createServer(app);

let shutdownStarted = false;

const closeHttpServer = async (): Promise<void> => {
  if (!server.listening) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);

        return;
      }

      resolve();
    });
  });
};

const shutdown = async (reason: string, exitCode: number): Promise<void> => {
  if (shutdownStarted) {
    return;
  }

  shutdownStarted = true;

  markServerAsShuttingDown();

  console.log(`Shutdown started: ${reason}`);

  const forcedShutdownTimer = setTimeout(() => {
    console.error("Graceful shutdown timed out. Forcing process exit.");

    process.exit(1);
  }, 15_000);

  forcedShutdownTimer.unref();

  try {
    if (isSocketServerInitialized()) {
      await closeSocketServer();

      console.log("Socket.IO and HTTP server closed.");
    } else {
      await closeHttpServer();

      console.log("HTTP server closed.");
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();

      console.log("MongoDB disconnected.");
    }

    clearTimeout(forcedShutdownTimer);

    console.log("Graceful shutdown completed.");

    process.exitCode = exitCode;
  } catch (error) {
    clearTimeout(forcedShutdownTimer);

    console.error("Graceful shutdown failed:", error);

    process.exitCode = 1;
  }
};

const startServer = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;

  const clientUrl = process.env.CLIENT_URL;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (!clientUrl) {
    throw new Error("CLIENT_URL is not configured.");
  }

  console.log("Attempting MongoDB connection...");

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10_000,
  });

  console.log("MongoDB connected.");

  initializeSocketServer(server);

  console.log("Socket.IO initialized.");

  registerDomainEventSubscribers();

  console.log("Domain event subscribers registered.");

  await new Promise<void>((resolve, reject) => {
    const handleStartupError = (error: Error): void => {
      reject(error);
    };

    server.once("error", handleStartupError);

    server.listen(PORT, () => {
      server.off("error", handleStartupError);

      resolve();
    });
  });

  console.log(`Server running on port ${PORT}.`);
};

process.once("SIGINT", () => {
  void shutdown("SIGINT", 0);
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM", 0);
});

process.once("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);

  void shutdown("uncaughtException", 1);
});

process.once("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);

  void shutdown("unhandledRejection", 1);
});

startServer().catch((error) => {
  console.error("Failed to start server:", error);

  void shutdown("startupFailure", 1);
});
