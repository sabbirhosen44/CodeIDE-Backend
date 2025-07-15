import express from "express";
import {
  getUserProjects,
  getUserProject,
  createProjectFromTemplate,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getUserProjects);
router.post("/", createProjectFromTemplate);
router.get("/:id", getUserProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;
