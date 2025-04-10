import express from "express";
import authRouter from "./routes/authRoute.js";
import { connectDB } from "./config/dbConnect.js";
import dotenv from "dotenv";

const app = express();
dotenv.config();

app.use(express.json());

app.use("/api/v1/auth", authRouter);

app.listen(8080, () => {
  console.log("Server is working ");
});

connectDB();
