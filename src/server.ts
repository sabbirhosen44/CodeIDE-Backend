import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/dbConnect.js";
import config from "./config/default.js";
import errorHandler from "./middleware/error.js";
import authRouter from "./routes/authRoute.js";
import projectRouter from "./routes/projectRoute.js";
import templateRouter from "./routes/templateRoute.js";
import snippetRouter from "./routes/snippetRoute.js";
import adminRouter from "./routes/adminRoute.js";
import userRouter from "./routes/userRoute.js";
import { v2 as cloudinary } from "cloudinary";
import fileUpload from "express-fileupload";

// Initialize environment variables
dotenv.config();

// Create Express application
const app = express();

// middleware setup
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));

// enable cors
app.use(cors({ origin: config.clientUrl, credentials: true }));

// cloudinary configuration
cloudinary.config({
  cloud_name: config.cloudinarySettings.cloudName,
  api_key: config.cloudinarySettings.apiKey,
  api_secret: config.cloudinarySettings.apiSecret,
});

//Route setup
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/templates", templateRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/snippets", snippetRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/users", userRouter);

//Error handling middleware
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB();

    app.listen(config.port, () => {
      console.log(`Server is listening on port : ${config.port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
