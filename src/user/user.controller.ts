import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { success } from "../utils/response";
import { findUserByIdAndUpdate } from "./user.repository";

export const updateUser = async (req: Request, res: Response) => {
  const { name, phone } = req.body;
  const id = req.params.id as string;

  const user = await findUserByIdAndUpdate(id, {
    name,
    phone,
  });

  if (!user) throw new ApiError("User not found", 404);

  return success(res, 200, null, user);
};
