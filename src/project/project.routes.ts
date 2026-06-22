import express from "express";
import { verifyToken } from "../middlewares/verifyToken";
import { validateInputs } from "../middlewares/validateInputs";
import {
  addProjectValidation,
  updateProjectValidation,
} from "./project.validator";
import {
  addProject,
  getProjects,
  getProject,
  modifyProject,
  removeProject,
} from "./project.controller";

const router = express.Router();

router.use(verifyToken);

router
  .route("/")
  .post(addProjectValidation, validateInputs, addProject)
  .get(getProjects);

router
  .route("/:id")
  .get(getProject)
  .patch(updateProjectValidation, validateInputs, modifyProject)
  .delete(removeProject);

export const projectRoutes = router;
