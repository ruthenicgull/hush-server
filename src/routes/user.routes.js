import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyCollegeEmail } from "../middlewares/domain.middleware.js";

const router = Router();

// Registration and Login
router.route("/register").post(verifyCollegeEmail, registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);

// Account Operations
router.route("/refresh-access-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

// Profile Management
router.route("/profile").get(verifyJWT, getCurrentUser);

export default router;
