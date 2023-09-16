import {
  DataTypes,
  Sequelize,
  Model,
  Optional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import sequelize from "../database";
import { v4 } from "uuid";


class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: number | null;
  declare email: string | null;
  declare username: string | null;
  declare password: string | null;
  declare activation_code: string | null;
  declare reset_password_token: string | null;
  declare role: string | null;
  declare is_active: boolean | null;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      defaultValue: `user${v4()}`,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    activation_code: {
      type: DataTypes.STRING,
      defaultValue: new Date().getTime().toString().slice(8),
      allowNull: true,
    },
    reset_password_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "ordinary",
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { sequelize, modelName: "User", timestamps: true }
);

export default User;
