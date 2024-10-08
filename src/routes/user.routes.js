import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserById,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  verifyEmail,
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

// Get User
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/:id").get(getUserById);

export default router;

// Email Verification
router.route("/verify-email").get(verifyEmail); // New route for email verification
