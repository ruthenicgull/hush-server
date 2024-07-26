import { Router } from "express";
import {
  createPost,
  deletePost,
  getPost,
  getPostsByUser,
  getUserFeed,
  updatePost,
} from "../controllers/post.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, createPost);
router.route("/paginated-feed").get(getUserFeed);
router.route("/user/:user_id").get(getPostsByUser);
router.route("/:id").get(getPost);
router.route("/:id").put(verifyJWT, updatePost);
router.route("/:id").delete(verifyJWT, deletePost);

export default router;
