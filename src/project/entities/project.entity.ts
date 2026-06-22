import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/db";
import { User } from "../../user/entities/user.entity";

export interface ProjectAttributes {
  project_id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "done";
  user_id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectCreationAttributes extends Optional<
  ProjectAttributes,
  "project_id" | "status"
> {}

export interface ProjectInstance
  extends
    Model<ProjectAttributes, ProjectCreationAttributes>,
    ProjectAttributes {}

export const Project = sequelize.define<ProjectInstance>("projects", {
  project_id: {
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
User.hasMany(Project, { foreignKey: "user_id" });
Project.belongsTo(User, { foreignKey: "user_id" });
