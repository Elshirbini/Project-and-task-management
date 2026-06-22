import { ApiError } from "../utils/apiError";
import { redisClient } from "../config/redis";
import { generateOTP } from "../utils/generateOTP";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokens.util";
import { NextFunction, Request, Response } from "express";
import { success } from "../utils/response";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../user/user.repository";
import { emailService } from "../email/email.service";

export const getProfile = async (req: Request, res: Response) => {
  const userId = req.userId as string;

  const user = await findUserById(userId);
  if (!user) throw new ApiError("User not found", 404);

  return success(res, 200, null, user);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);

  if (!user) throw new ApiError("User not found", 404);

  const isPassEq = await compare(password, user.password!);
  if (!isPassEq) throw new ApiError("Password Wrong", 401);

  const accessToken = await generateAccessToken(
    user.user_id.toString(),
    user.role,
  );
  const refreshToken = await generateRefreshToken(user.user_id.toString());

  return success(res, 200, "Login successfully", {
    _id: user.user_id,
    name: user.name,
    email: user.email,
    role: user.role,
    accessToken,
    refreshToken,
  });
};

export const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const isExist = await findUserByEmail(email);
  if (isExist) throw new ApiError("This email is already exist", 403);

  const otp = generateOTP();

  const userData = { name, email, password };

  redisClient.setEx(`${otp}`, 300, JSON.stringify(userData));

  await emailService.sendOTPConfirmationEmail(email, otp);

  return success(res, 200, "OTP sent", null);
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { otp } = req.body;

  const userData = await redisClient.get(`${otp}`);
  if (!userData) {
    throw new ApiError("Invalid or expired verification code", 403);
  }

  const parsedData = JSON.parse(userData);

  const { email, name, password } = parsedData;

  const hashedPassword = await hash(password, 12);

  const createData = {
    name,
    email,
    password: hashedPassword,
  };

  await createUser(createData);

  await redisClient.del(`${otp}`);

  await emailService.sendWelcomeEmail(email);

  return success(res, 201, "Account created successfully");
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const refreshToken = req.cookies["refreshToken"];
  if (!refreshToken) return next(new ApiError("Invalid refresh token", 401));

  const payload = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET!,
  ) as {
    id: string;
  };

  if (!payload) return next(new ApiError("Token is not valid", 401));

  const user = await findUserById(payload.id);
  if (!user) return next(new ApiError("User not found", 404));

  const newAccessToken = await generateAccessToken(
    user.user_id.toString(),
    user.role,
  );

  return success(res, 200, "Access token updated", {
    accessToken: newAccessToken,
  });
};
