import { Router } from "express";
import { createComment } from "../controllers/comment.controllers.js";

const router = Router();

router.post("/:post_id", verifyJWT, createComment); // Create a comment for a specific post
router.get("/:post_id", getCommentsByPost); // Get all comments for a specific post
router.get("/comment/:id", getCommentById); // Get a specific comment by its ID
router.put("/comment/:id", verifyJWT, updateComment); // Update a specific comment by its ID
router.delete("/comment/:id", verifyJWT, deleteComment); // Delete a specific comment by its ID

export default router;
