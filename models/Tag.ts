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

class Tag extends Model<InferAttributes<Tag>, InferCreationAttributes<Tag>> {
    declare id: number | null;
    declare name: string | null;
    declare slug: string | null;

    declare getQuestion: HasManyGetAssociationsMixin<Question>;
    declare addQuestion: HasManyAddAssociationMixin<Question, number>;
    declare hasQuestion: HasManyHasAssociationMixin<Question, number>;
    declare removeQuestion: HasManyRemoveAssociationMixin<Question, number>;
}

Tag.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    { sequelize, timestamps: true, modelName: "Tag" }
);

export default Tag;
