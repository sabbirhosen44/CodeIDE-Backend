import express from "express";
import { executeCodeController } from "../controllers/codeController.js";

const router = express.Router();

router.post("/execute", executeCodeController);

export default router;
