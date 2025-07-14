import expres from "express";
import { protect, authorize } from "../middleware/auth.js";
import { getAdminStats } from "../controllers/adminController.js";

const router = expres.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/stats", getAdminStats);
