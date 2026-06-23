import { Op } from "sequelize";
import {
  User,
  UserAttributes,
  UserCreationAttributes,
} from "./entities/user.entity";

export const findUserByIdAndUpdate = async (
  id: string,
  userData: Partial<UserAttributes>,
) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  return user.update(userData);
};

export const findUserById = async (id: string) => {
  return User.findByPk(id);
};

export const findUserByEmail = async (email: string) => {
  return User.findOne({ where: { email } });
};

export const getUsers = async (id: string) => {
  return User.findAll({
    where: {
      user_id: { [Op.ne]: id },
    },
    order: [["createdAt", "DESC"]],
  });
};

export const createUser = async (userData: UserCreationAttributes) => {
  return User.create(userData);
};

export const saveUser = async (user: any) => {
  return user.save();
};

export const findUserByEmailAndUpdate = async (
  email: string,
  userData: Partial<UserAttributes>,
) => {
  const user = await User.findOne({ where: { email } });
  if (!user) return null;
  return user.update(userData);
};

export const findUserAndDeleteById = async (id: string) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  await user.destroy();
  return user;
};
