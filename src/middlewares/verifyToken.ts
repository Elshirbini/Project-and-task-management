import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import { ApiError } from "../utils/apiError";
import { NextFunction, Request, Response } from "express";
import { findUserById } from "../user/user.repository";
import { logger } from "../config/logger";

configDotenv();

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return next(new ApiError("Unauthorized", 401));

  const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
    id: string;
    role: string;
  };

  if (!user) return next(new ApiError("Token is not valid", 401));

  req.userId = user.id;
  req.userRole = user.role;

  const userDoc = await findUserById(user.id);
  if (!userDoc) return next(new ApiError("User not found", 404));
  next();
};
