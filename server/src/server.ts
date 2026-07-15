import dotenv from "dotenv";

dotenv.config();

import http from "node:http";
import mongoose from "mongoose";

import app from "./app";

import { registerDomainEventSubscribers } from "./events/registersSubscribers";

import { initializeSocketServer } from "./sockets/socket.server";

const PORT =
    Number(
        process.env.PORT
    ) || 5000;

const server =
    http.createServer(
        app
    );

const startServer =
    async (): Promise<void> => {
        try {
            const mongoUri =
                process.env.MONGODB_URI;

            if (!mongoUri) {
                throw new Error(
                    "MONGODB_URI is not configured."
                );
            }

            const clientUrl =
                process.env.CLIENT_URL;

            if (!clientUrl) {
                throw new Error(
                    "CLIENT_URL is not configured."
                );
            }

            await mongoose.connect(
                mongoUri
            );

            console.log(
                "MongoDB connected."
            );

            /*
            |--------------------------------------------------------------------------
            | Initialize Socket.IO
            |--------------------------------------------------------------------------
            |
            | Socket.IO must be attached before the HTTP server
            | begins accepting connections.
            |
            */

            initializeSocketServer(
                server
            );

            console.log(
                "Socket.IO initialized."
            );

            /*
            |--------------------------------------------------------------------------
            | Register Domain Event Subscribers
            |--------------------------------------------------------------------------
            */

            registerDomainEventSubscribers();

            console.log(
                "Domain event subscribers registered."
            );

            /*
            |--------------------------------------------------------------------------
            | Start HTTP Server
            |--------------------------------------------------------------------------
            */

            server.listen(
                PORT,
                () => {
                    console.log(
                        `Server running on port ${PORT}.`
                    );
                }
            );
        } catch (error) {
            console.error(
                "Failed to start server:",
                error
            );

            process.exit(
                1
            );
        }
    };

startServer();