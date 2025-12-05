import express from "express";
import { protect } from "../middleware/auth.js";
import {
  deleteUser,
  getUser,
  getUserDetails,
  getUsers,
  updateUserPlan,
} from "../controllers/userController.js";

const router = express.Router();

router.use(protect);

router.get("/", getUsers);
router.get("/:id", getUser);
router.delete("/:id", deleteUser);
router.get("/:id/details", getUserDetails);
router.put("/:id/plan", updateUserPlan);

export default router;
