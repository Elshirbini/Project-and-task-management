import {
  Project,
  ProjectCreationAttributes,
  ProjectAttributes,
  ProjectInstance,
} from "./entities/project.entity";
import { User } from "../user/entities/user.entity";

export const createProject = async (projectData: ProjectCreationAttributes) => {
  return Project.create(projectData);
};

export const findProjectsByUserId = async (
  user_id: string,
  limit: number = 10,
  offset: number = 0,
) => {
  return Project.findAndCountAll({
    where: { user_id },
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: User,
        attributes: ["user_id", "name", "email", "role"],
      },
    ],
  });
};

export const findProjectById = async (project_id: string) => {
  return Project.findByPk(project_id, {
    include: [
      {
        model: User,
        attributes: ["user_id", "name", "email", "role"],
      },
    ],
  });
};

export const updateProject = async (
  project: ProjectInstance,
  updateData: Partial<ProjectAttributes>,
) => {
  return project.update(updateData);
};

export const deleteProject = async (project: ProjectInstance) => {
  await project.destroy();
  return project;
};
