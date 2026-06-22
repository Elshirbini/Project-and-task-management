import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { success } from "../utils/response";
import {
  createTask,
  findTasks,
  findTaskById,
  updateTask,
  deleteTask,
} from "./task.repository";
import { findProjectById } from "../project/project.repository";

export const addTask = async (req: Request, res: Response) => {
  const project_id = req.params.project_id as string;
  const user_id = req.userId as string;
  const { title, description, status, priority, due_date } = req.body;

  const project = await findProjectById(project_id);
  if (!project || project.user_id !== user_id) {
    throw new ApiError("Project not found", 404);
  }

  if (due_date && new Date(due_date) < new Date()) {
    throw new ApiError("Due date cannot be in the past", 400);
  }

  const task = await createTask({
    title,
    description,
    status: status || "pending",
    priority: priority || "medium",
    due_date: due_date || null,
    project_id,
    user_id,
  });

  return success(res, 201, "Task created successfully", task);
};

export const getTasks = async (req: Request, res: Response) => {
  const project_id = req.params.project_id as string;
  const user_id = req.userId as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const filters: any = {};
  if (req.query.status) filters.status = req.query.status as string;
  if (req.query.priority) filters.priority = req.query.priority as string;

  const project = await findProjectById(project_id);
  if (!project || project.user_id !== user_id) {
    throw new ApiError("Project not found", 404);
  }

  const tasks = await findTasks(project_id, user_id, limit, offset, filters);

  return success(res, 200, "Tasks retrieved successfully", {
    data: tasks.rows,
    meta: {
      page,
      totalCount: tasks.count,
      totalPages: Math.ceil(tasks.count / limit),
    },
  });
};

export const getTask = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user_id = req.userId as string;

  const task = await findTaskById(id);

  if (!task || task.user_id !== user_id) {
    throw new ApiError("Task not found", 404);
  }

  return success(res, 200, "Task retrieved successfully", task);
};

export const modifyTask = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user_id = req.userId as string;
  const { title, description, status, priority, due_date } = req.body;

  const task = await findTaskById(id);

  if (!task || task.user_id !== user_id) {
    throw new ApiError("Task not found", 404);
  }

  const updatedTask = await updateTask(task, {
    title,
    description,
    status,
    priority,
    due_date,
  });

  return success(res, 200, "Task updated successfully", updatedTask);
};

export const removeTask = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user_id = req.userId as string;

  const task = await findTaskById(id);

  if (!task || task.user_id !== user_id) {
    throw new ApiError("Task not found", 404);
  }

  await deleteTask(task);

  return success(res, 200, "Task deleted successfully", null);
};
