import {
    DataTypes,
    HasManyAddAssociationMixin,
    HasManyGetAssociationsMixin,
    HasManyHasAssociationMixin,
    HasManyRemoveAssociationMixin,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";
import sequelize from "../database";
import Question from "./Question";
import User from "./User";

class Answer extends Model<InferAttributes<Answer>, InferCreationAttributes<Answer>> {
    declare id: number | null;
    declare body: string | null;
    declare image: string | null;
    declare likes: number | null;
    declare dislikes: number | null;
    declare UserId?: number | null;
    declare QuestionId?: number | null;
    declare is_selected: boolean | null;

    // associations
    declare getQuestion: HasManyGetAssociationsMixin<Question>;
    declare addQuestion: HasManyAddAssociationMixin<Question, number>;
    declare hasQuestion: HasManyHasAssociationMixin<Question, number>;
    declare removeQuestion: HasManyRemoveAssociationMixin<Question, number>;

    declare getUser: HasManyGetAssociationsMixin<User>;
    declare addUser: HasManyAddAssociationMixin<User, number>;
    declare hasUser: HasManyHasAssociationMixin<User, number>;
    declare removeUser: HasManyRemoveAssociationMixin<User, number>;

    declare getUlike: HasManyGetAssociationsMixin<User>;
    declare addUlike: HasManyAddAssociationMixin<User, number>;
    declare hasUlike: HasManyHasAssociationMixin<User, number>;
    declare removeUlike: HasManyRemoveAssociationMixin<User, number>;

    declare getUDlike: HasManyGetAssociationsMixin<User>;
    declare addUDlike: HasManyAddAssociationMixin<User, number>;
    declare hasUDlike: HasManyHasAssociationMixin<User, number>;
    declare removeUDlike: HasManyRemoveAssociationMixin<User, number>;
}

Answer.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        body: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        is_selected: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        likes: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        dislikes: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    { sequelize, timestamps: true }
);

export default Answer;
