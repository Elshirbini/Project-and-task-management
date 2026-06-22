import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
import { User } from "../../user/entities/user.entity";
import { Project } from "../../project/entities/project.entity";

export interface TaskAttributes {
  task_id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  due_date?: Date | null;
  project_id: string;
  user_id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskCreationAttributes extends Optional<
  TaskAttributes,
  "task_id" | "status" | "priority"
> {}

export interface TaskInstance
  extends Model<TaskAttributes, TaskCreationAttributes>, TaskAttributes {}

export const Task = sequelize.define<TaskInstance>("tasks", {
  task_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "in-progress", "done"),
    defaultValue: "pending",
  },
  priority: {
    type: DataTypes.ENUM("low", "medium", "high"),
    defaultValue: "medium",
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  project_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Project,
      key: "project_id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: "user_id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
});

// Associations
User.hasMany(Task, { foreignKey: "user_id" });
Task.belongsTo(User, { foreignKey: "user_id" });

Project.hasMany(Task, { foreignKey: "project_id" });
Task.belongsTo(Project, { foreignKey: "project_id" });
