import app from "./app";
import dotenv from "dotenv";
import { logger } from "./config/logger";
import { connectDB } from "./config/db";
dotenv.config();

const startServer = async () => {
  try {
    await connectDB();
    app.listen(8080, "0.0.0.0", () => {
      logger.info(`🚀 Server running on PORT:8080`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
  }
};

startServer();

process.on("unhandledRejection", (err: Error) => {
  logger.error(`Unhandled Rejection Errors : ${err.name} | ${err.message}`);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error(`Unhandled Caught Errors : ${err.name} | ${err.message}`);
  process.exit(1);
});
