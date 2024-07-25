import { Router } from "express";

const router = Router();

router.route("/register").post();
router.route("/login").post();
router.route("/update-user").post();
router.route("/refresh-token").post();

export default router;
