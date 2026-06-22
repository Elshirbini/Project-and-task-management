import express from "express";
import {
  getProfile,
  login,
  refreshAccessToken,
  signup,
} from "../auth/auth.controller";
import {
  loginValidator,
  otpValidator,
  registrationValidation,
} from "./auth.validator";
import { validateInputs } from "../middlewares/validateInputs";
import {
  loginLimiter,
  signupLimiter,
  verifyEmailLimiter,
} from "../middlewares/rateLimiter";
import { verifyToken } from "../middlewares/verifyToken";

const router = express.Router();

router.get("/profile", verifyToken, getProfile);

router.post("/login", loginLimiter, loginValidator, validateInputs, login);
router.post(
  "/signup",
  signupLimiter,
  registrationValidation,
  validateInputs,
  signup,
);

// for email verification flow, that's for future use
// router.post(
//   "/verify-email",
//   verifyEmailLimiter,
//   otpValidator,
//   validateInputs,
//   verifyEmail,
// );

router.post("/refresh-token", refreshAccessToken);

export const authRoutes = router;
