import { Response } from "express";

export const success = (
  res: Response,
  statusCode: number,
  message: string | null = "",
  data: object | null = {}
) => {
  return res
    .status(statusCode)
    .json({ success: true, message: message, data: data });
};
