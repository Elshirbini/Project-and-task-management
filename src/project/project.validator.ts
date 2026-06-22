import { body } from "express-validator";

export const addProjectValidation = [
  body("title").notEmpty().withMessage("Title is required").isString(),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isString(),
  body("status")
    .optional()
    .isIn(["pending", "in-progress", "done"])
    .withMessage("Status must be pending, in-progress, or done"),
];

export const updateProjectValidation = [
  body("title").optional().isString(),
  body("description").optional().isString(),
  body("status")
    .optional()
    .isIn(["pending", "in-progress", "done"])
    .withMessage("Status must be pending, in-progress, or done"),
];
