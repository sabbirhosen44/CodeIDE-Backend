import express from "express";
import {
  changePassword,
  deleteAccount,
  forgotPassword,
  getMe,
  login,
  logout,
  register,
  resetPassword,
  updateProfile,
  verifyEmail,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.get("/verify-email/:verificationToken", verifyEmail);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword/:resettoken", resetPassword);

router.use(protect);

router.get("/me", getMe);
router.put("/profile", updateProfile);
router.put("/change-password", changePassword);
router.delete("/delete-account", deleteAccount);

export default router;
