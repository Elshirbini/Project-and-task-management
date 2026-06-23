import { Sequelize } from "sequelize";
import { configDotenv } from "dotenv";
import { logger } from "./logger";
configDotenv();

const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "postgres",
    logging: false,
  },
);
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Connected to PostgreSQL successfully.");
  } catch (error) {
    logger.error("Unable to connect to the database:", error);
  }
};

export default sequelize;
