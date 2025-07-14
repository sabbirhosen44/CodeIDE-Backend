import express from "express";
import {
  createTemplate,
  deleteTemplate,
  getTemplates,
  incrementDownloads,
} from "../controllers/templateController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getTemplates);
router.put("/:id", incrementDownloads);

router.use(protect);
router.post("/", createTemplate);

router.delete("/:id", deleteTemplate);

export default router;
