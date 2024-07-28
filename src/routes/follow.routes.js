import express from "express";
import {
  followCollege,
  unfollowCollege,
  getUserFollows,
  getCollegeFollowers,
} from "../controllers/follow.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/follow", verifyJWT, followCollege);
router.post("/unfollow", verifyJWT, unfollowCollege);
router.get("/user", verifyJWT, getUserFollows);
router.get("/college/:collegeId", verifyJWT, getCollegeFollowers);

export default router;
