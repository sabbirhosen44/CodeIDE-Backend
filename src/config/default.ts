import type { Config } from "../types/index.js";
import dotenv from "dotenv";
dotenv.config();

const config: Config = {
  port: Number.parseInt(process.env.PORT || "8080", 10),
  mongoURI: process.env.MONGO_URI || "mongodb://localhost:27017/codeide",
  jwtSecret: process.env.JWT_SECRET || "my-jwt-secret",
  jwtExpire: process.env.JWT_EXPIRE || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  smtpSettings: {
    host: process.env.SMTP_HOST || "smtp.mailtrap.com",
    port: Number.parseInt(process.env.SMTP_PORT || "2525", 10),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASSWORD || "",
  },
  cloudinarySettings: {
    cloudName: process.env.CLOUDINARY_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
};

export default config;
