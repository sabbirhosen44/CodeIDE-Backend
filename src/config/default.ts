import type { Config } from "../types/index.js";

const config: Config = {
  port: Number.parseInt(process.env.PORT || "8080", 10),
  mongoURI: process.env.MONGO_URI || "mongodb://localhost:27017/cloud-ide",
  jwtSecret: process.env.JWT_SECRET || "my-jwt-secret",
  jwtExpire: process.env.JWT_EXPIRE || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
};

export default config;
