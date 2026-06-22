import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { success } from "../utils/response";
import {
  createProject,
  findProjectsByUserId,
  findProjectById,
  updateProject,
  deleteProject,
} from "./project.repository";

export const addProject = async (req: Request, res: Response) => {
  const { title, description, status } = req.body;
  const user_id = req.userId as string;

  const project = await createProject({
    title,
    description,
    status: status || "pending",
    user_id,
  });

  return success(res, 201, "Project created successfully", project);
};

export const getProjects = async (req: Request, res: Response) => {
  const user_id = req.userId as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const projects = await findProjectsByUserId(user_id, limit, offset);

  return success(res, 200, "Projects retrieved successfully", {
    data: projects.rows,
    meta: {
      page,
      totalCount: projects.count,
      totalPages: Math.ceil(projects.count / limit),
    },
  });
};

export const getProject = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user_id = req.userId as string;
  const userRole = req.userRole as string;

  const project = await findProjectById(id);

  if (!project) {
    throw new ApiError("Project not found", 404);
  }

  if (project.user_id !== user_id && userRole !== "admin") {
    throw new ApiError("Unauthorized to view this project", 403);
  }

  return success(res, 200, "Project retrieved successfully", project);
};

export const modifyProject = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user_id = req.userId as string;
  const userRole = req.userRole as string;
  const { title, description, status } = req.body;

  const project = await findProjectById(id);

  if (!project) {
    throw new ApiError("Project not found", 404);
  }

  if (project.user_id !== user_id && userRole !== "admin") {
    throw new ApiError("Unauthorized to update this project", 403);
  }

  const updatedProject = await updateProject(project, {
    title,
    description,
    status,
  });

  return success(res, 200, "Project updated successfully", updatedProject);
};

export const removeProject = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user_id = req.userId as string;
  const userRole = req.userRole as string;

  const project = await findProjectById(id);

  if (!project) {
    throw new ApiError("Project not found", 404);
  }

  if (project.user_id !== user_id && userRole !== "admin") {
    throw new ApiError("Unauthorized to delete this project", 403);
  }

  await deleteProject(project);

  return success(res, 200, "Project deleted successfully", null);
};
