import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/dbConnect.js";
import config from "./config/default.js";
import authRouter from "./routes/authRoute.js";

const app = express();
dotenv.config();

// middlewares
app.use(express.json());

app.use("/api/v1/auth", authRouter);

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
