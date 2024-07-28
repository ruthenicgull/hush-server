import express from "express";
import {
  followCollege,
  unfollowCollege,
  getUserFollows,
  getCollegeFollowers,
} from "../controllers/followController";
import verifyJWT from "../middleware/verifyJWT";

const router = express.Router();

router.post("/follow", verifyJWT, followCollege);
router.post("/unfollow", verifyJWT, unfollowCollege);
router.get("/user", verifyJWT, getUserFollows);
router.get("/college/:collegeId", verifyJWT, getCollegeFollowers);

export default router;
