import dotenv from "dotenv";

dotenv.config();

import http from "http";
import mongoose from "mongoose";
import mailService from "./modules/mail/mail.service";
import { connectDb } from "./config/db";
import app from "./app";

const PORT = Number(process.env.PORT) || 5000;

const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDb();  
    await mailService.verifyConnection();
    console.log("MongoDB Connected");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
    console.error("Failed to start server");

    process.exit(1);
  }
};

startServer();