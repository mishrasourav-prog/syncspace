import dotenv from "dotenv";

dotenv.config();

import http from "node:http";

import mongoose from "mongoose";

import app from "./app";

import {
    registerDomainEventSubscribers,
} from "./events/registersSubscribers";

import {
    markServerAsShuttingDown,
} from "./runtime/serverState";

import {
    closeSocketServer,
    initializeSocketServer,
    isSocketServerInitialized,
} from "./sockets/socket.server";

const PORT =
    Number(
        process.env.PORT
    ) || 5000;

/*
|--------------------------------------------------------------------------
| Shared HTTP Server
|--------------------------------------------------------------------------
|
| Express and Socket.IO both use this HTTP server.
|
*/

const server =
    http.createServer(
        app
    );

let shutdownStarted =
    false;

/*
|--------------------------------------------------------------------------
| Close Plain HTTP Server
|--------------------------------------------------------------------------
|
| This is mainly a fallback when Socket.IO was never initialized,
| such as when startup failed before reaching Socket.IO setup.
|
*/

const closeHttpServer =
    async (): Promise<void> => {
        if (
            !server.listening
        ) {
            return;
        }

        await new Promise<void>(
            (
                resolve,
                reject
            ) => {
                server.close(
                    (error) => {
                        if (error) {
                            reject(
                                error
                            );

                            return;
                        }

                        resolve();
                    }
                );
            }
        );
    };

/*
|--------------------------------------------------------------------------
| Graceful Shutdown
|--------------------------------------------------------------------------
*/

const shutdown =
    async (
        reason: string,
        exitCode: number
    ): Promise<void> => {
        /*
        SIGINT and SIGTERM could arrive close together.

        The guard prevents shutdown logic from running twice.
        */

        if (
            shutdownStarted
        ) {
            return;
        }

        shutdownStarted =
            true;

        markServerAsShuttingDown();

        console.log(
            `Shutdown started: ${reason}`
        );

        /*
        This is an emergency fallback.

        Graceful shutdown should finish before this timer,
        but the process must not remain stuck forever.
        */

        const forcedShutdownTimer =
            setTimeout(
                () => {
                    console.error(
                        "Graceful shutdown timed out. Forcing process exit."
                    );

                    process.exit(
                        1
                    );
                },
                15_000
            );

        /*
        unref() means this timer alone will not keep
        the Node process running.
        */

        forcedShutdownTimer
            .unref();

        try {
            /*
            |--------------------------------------------------------------------------
            | Stop HTTP and Socket.IO
            |--------------------------------------------------------------------------
            |
            | Socket.IO close disconnects clients and closes
            | the underlying HTTP server.
            |
            */

            if (
                isSocketServerInitialized()
            ) {
                await closeSocketServer();

                console.log(
                    "Socket.IO and HTTP server closed."
                );
            } else {
                await closeHttpServer();

                console.log(
                    "HTTP server closed."
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Close MongoDB
            |--------------------------------------------------------------------------
            */

            if (
                mongoose.connection
                    .readyState !==
                0
            ) {
                await mongoose.disconnect();

                console.log(
                    "MongoDB disconnected."
                );
            }

            clearTimeout(
                forcedShutdownTimer
            );

            console.log(
                "Graceful shutdown completed."
            );

            /*
            Setting exitCode lets Node finish flushing
            pending output before exiting naturally.
            */

            process.exitCode =
                exitCode;
        } catch (error) {
            clearTimeout(
                forcedShutdownTimer
            );

            console.error(
                "Graceful shutdown failed:",
                error
            );

            process.exitCode =
                1;
        }
    };

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const startServer =
    async (): Promise<void> => {
        const mongoUri =
            process.env.MONGODB_URI;

        const clientUrl =
            process.env.CLIENT_URL;

        if (!mongoUri) {
            throw new Error(
                "MONGODB_URI is not configured."
            );
        }

        if (!clientUrl) {
            throw new Error(
                "CLIENT_URL is not configured."
            );
        }

        console.log(
            "Attempting MongoDB connection..."
        );

        await mongoose.connect(
            mongoUri,
            {
                serverSelectionTimeoutMS:
                    10_000,
            }
        );

        console.log(
            "MongoDB connected."
        );

        initializeSocketServer(
            server
        );

        console.log(
            "Socket.IO initialized."
        );

        registerDomainEventSubscribers();

        console.log(
            "Domain event subscribers registered."
        );

        /*
        Wrap server.listen() in a Promise so startup errors,
        such as an occupied port, reach the outer catch.
        */

        await new Promise<void>(
            (
                resolve,
                reject
            ) => {
                const handleStartupError =
                    (
                        error:
                            Error
                    ): void => {
                        reject(
                            error
                        );
                    };

                server.once(
                    "error",
                    handleStartupError
                );

                server.listen(
                    PORT,
                    () => {
                        server.off(
                            "error",
                            handleStartupError
                        );

                        resolve();
                    }
                );
            }
        );

        console.log(
            `Server running on port ${PORT}.`
        );
    };

/*
|--------------------------------------------------------------------------
| Operating-System Signals
|--------------------------------------------------------------------------
|
| SIGINT:
| Usually generated by Ctrl+C during local development.
|
| SIGTERM:
| Commonly sent by Docker, Kubernetes and hosting platforms
| when stopping or replacing a process.
|
*/

process.once(
    "SIGINT",
    () => {
        void shutdown(
            "SIGINT",
            0
        );
    }
);

process.once(
    "SIGTERM",
    () => {
        void shutdown(
            "SIGTERM",
            0
        );
    }
);

/*
|--------------------------------------------------------------------------
| Fatal Runtime Errors
|--------------------------------------------------------------------------
*/

process.once(
    "uncaughtException",
    (
        error
    ) => {
        console.error(
            "Uncaught exception:",
            error
        );

        void shutdown(
            "uncaughtException",
            1
        );
    }
);

process.once(
    "unhandledRejection",
    (
        reason
    ) => {
        console.error(
            "Unhandled promise rejection:",
            reason
        );

        void shutdown(
            "unhandledRejection",
            1
        );
    }
);

/*
|--------------------------------------------------------------------------
| Bootstrap
|--------------------------------------------------------------------------
*/

startServer()
    .catch(
        (
            error
        ) => {
            console.error(
                "Failed to start server:",
                error
            );

            void shutdown(
                "startupFailure",
                1
            );
        }
    );