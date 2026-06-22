import { body } from "express-validator";

export const addTaskValidation = [
  body("title").notEmpty().withMessage("Title is required").isString(),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isString(),
  body("status")
    .optional()
    .isIn(["pending", "in-progress", "done"])
    .withMessage("Status must be pending, in-progress, or done"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),
  body("due_date")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date"),
];

export const updateTaskValidation = [
  body("title").optional().isString(),
  body("description").optional().isString(),
  body("status")
    .optional()
    .isIn(["pending", "in-progress", "done"])
    .withMessage("Status must be pending, in-progress, or done"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),
  body("due_date")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date"),
];
