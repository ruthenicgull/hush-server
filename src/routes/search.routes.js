import express from "express";
import {
  searchColleges,
  searchPosts,
} from "../controllers/search.controllers.js";

const router = express.Router();

router.get("/colleges", searchColleges);
router.get("/posts", searchPosts);

export default router;
