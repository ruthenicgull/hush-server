import { Router } from "express";
import {
  castVoteOnPost,
  castVoteOnComment,
  deleteVote,
  getVotesForComment,
  getVotesForPost,
} from "../controllers/vote.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Route for handling votes on posts
router.post("/post/:post_id", verifyJWT, castVoteOnPost);
router.get("/post/:post_id", getVotesForPost);

// Route for handling votes on comments
router.post("/comment/:comment_id", verifyJWT, castVoteOnComment);
router.get("/comment/:comment_id", getVotesForComment);

// General route for deleting votes
router.delete("/:id", verifyJWT, deleteVote);

export default router;
