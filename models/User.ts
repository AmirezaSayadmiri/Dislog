import {
    DataTypes,
    Sequelize,
    Model,
    Optional,
    InferAttributes,
    InferCreationAttributes,
    HasManyGetAssociationsMixin,
    HasManyAddAssociationMixin,
    HasManyHasAssociationMixin,
    HasManyRemoveAssociationMixin,
} from "sequelize";
import sequelize from "../database";
import { v4 } from "uuid";
import Question from "./Question";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id: number | null;
    declare email: string | null;
    declare username: string | null;
    declare password: string | null;
    declare activation_code: string | null;
    declare reset_password_token: string | null;
    declare role: string | null;
    declare is_active: boolean | null;

    // associations
    declare getQlike: HasManyGetAssociationsMixin<Question>;
    declare addQlike: HasManyAddAssociationMixin<Question, number>;
    declare hasQlike: HasManyHasAssociationMixin<Question, number>;
    declare removeQlike: HasManyRemoveAssociationMixin<Question, number>;

    declare getQDlike: HasManyGetAssociationsMixin<Question>;
    declare addQDlike: HasManyAddAssociationMixin<Question, number>;
    declare hasQDlike: HasManyHasAssociationMixin<Question, number>;
    declare removeQDlike: HasManyRemoveAssociationMixin<Question, number>;

    declare getQview: HasManyGetAssociationsMixin<Question>;
    declare addQview: HasManyAddAssociationMixin<Question, number>;
    declare hasQview: HasManyHasAssociationMixin<Question, number>;
    declare removeQview: HasManyRemoveAssociationMixin<Question, number>;
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
            unique: true,
            allowNull: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        activation_code: {
            type: DataTypes.STRING,
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
