import app from "./app";
import dotenv from "dotenv";
import { logger } from "./config/logger";
import sequelize from "./config/db";
dotenv.config();

app.listen(8080, "0.0.0.0", () => {
  sequelize.authenticate();
  logger.info(`🚀 Server running on PORT:${process.env.PORT}`);
});

process.on("unhandledRejection", (err: Error) => {
  logger.error(`Unhandled Rejection Errors : ${err.name} | ${err.message}`);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error(`Unhandled Caught Errors : ${err.name} | ${err.message}`);
  process.exit(1);
});
