import express from "express";
import { verifyToken } from "../middlewares/verifyToken";
import { validateInputs } from "../middlewares/validateInputs";
import { addTaskValidation, updateTaskValidation } from "./task.validator";
import {
  addTask,
  getTasks,
  getTask,
  modifyTask,
  removeTask,
} from "./task.controller";

const router = express.Router();

router.use(verifyToken);

router
  .route("/project/:project_id")
  .post(addTaskValidation, validateInputs, addTask)
  .get(getTasks);

router
  .route("/:id")
  .get(getTask)
  .patch(updateTaskValidation, validateInputs, modifyTask)
  .delete(removeTask);

export const taskRoutes = router;
