import {
  Task,
  TaskCreationAttributes,
  TaskAttributes,
  TaskInstance,
} from "./entities/task.entity";
import { User } from "../user/entities/user.entity";
import { Project } from "../project/entities/project.entity";

export const createTask = async (taskData: TaskCreationAttributes) => {
  return Task.create(taskData);
};

export const findTasks = async (
  project_id: string,
  user_id: string,
  limit: number = 10,
  offset: number = 0,
  filters: Partial<Pick<TaskAttributes, "status" | "priority">> = {},
) => {
  const query: any = { project_id, user_id };
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.priority) {
    query.priority = filters.priority;
  }

  return Task.findAndCountAll({
    where: query,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        attributes: ["user_id", "name", "email", "role"],
      },
      {
        model: Project,
        attributes: ["project_id", "title", "status"],
      },
    ],
  });
};

export const findTaskById = async (task_id: string) => {
  return Task.findByPk(task_id, {
    include: [
      {
        model: User,
        attributes: ["user_id", "name", "email", "role"],
      },
      {
        model: Project,
        attributes: ["project_id", "title", "status"],
      },
    ],
  });
};

export const updateTask = async (
  task: TaskInstance,
  updateData: Partial<TaskAttributes>,
) => {
  return task.update(updateData);
};

export const deleteTask = async (task: TaskInstance) => {
  await task.destroy();
  return task;
};
