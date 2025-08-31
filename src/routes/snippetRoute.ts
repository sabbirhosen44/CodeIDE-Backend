import express from "express";
import {
  addComment,
  createSnippet,
  deleteComment,
  deleteSnippet,
  getSnippet,
  getSnippets,
  getUserSnippets,
  toggleLikeSnippet,
  updateSnippet,
} from "../controllers/snippetController.js";
import { optionalAuth, protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getSnippets);
router.get("/:id", optionalAuth, getSnippet);

router.use(protect);

router.post("/", createSnippet);
router.get("/user/:id", getUserSnippets);
router.put("/:id", updateSnippet);
router.delete("/:id", deleteSnippet);
router.post("/:id/like", toggleLikeSnippet);
router.post("/:id/comments", addComment);
router.delete("/comments/:id", deleteComment);

export default router;
