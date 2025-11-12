import express, { Router } from "express";
import {
  loginUser,
  userRegistration,
  verifyUser,
  resendOTP,
  resetUserPassword,
  userForgotPassword,
  verifyUserForgotPassword,
  refreshToken,
  getUser,
} from "../controllers/auth.controller";

const router: Router = express.Router();

/**
 * @swagger
 * /user-registration:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUser);
router.post("/resend-otp", resendOTP);
router.post("/user-login", loginUser);
router.post("/refresh-token", refreshToken);
router.post("/user-forgot-password", userForgotPassword);
router.post("/verify-user-forgot-password", verifyUserForgotPassword);
router.post("/user-reset-password", resetUserPassword);

router.get("/user-info", getUser);

export default router;
