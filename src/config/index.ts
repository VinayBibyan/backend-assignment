import dotenv from "dotenv";

dotenv.config();

const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/session-booking",
  nodeEnv: process.env.NODE_ENV || "development",
} as const;

export default config;
