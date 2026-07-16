import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";
import morgan from "morgan";

import routes from "./routes";
import { notFoundHandler } from "./middlewares/notFound.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import systemRouter from "./modules/system/system.routes";

const app = express();

/**
 * Security
 */
app.use(helmet());

/**
 * CORS
 */
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

/**
 * Body Parsers
 */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/**
 * Cookies
 */
app.use(cookieParser());

/**
 * Compression
 */
app.use(compression());

/**
 * Logging
 */
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/**
 * Health Check
 */

app.use(
    systemRouter
);
/**
 * API Routes
 */
app.use("/api/v1", routes);

/**
 * 404
 */
app.use(notFoundHandler);

/**
 * Global Error Handler
 */
app.use(errorHandler);

export default app;