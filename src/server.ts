import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/dbConnect.js";
import config from "./config/default.js";
import errorHandler from "./middleware/error.js";
import authRouter from "./routes/authRoute.js";

// Initialize environment variables
dotenv.config();

// Create Express application
const app = express();

// middleware setup
app.use(express.json());

//Route setup
app.use("/api/v1/auth", authRouter);

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
