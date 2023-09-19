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
import User from "./User";
import Tag from "./Tag";

class Question extends Model<InferAttributes<Question>, InferCreationAttributes<Question>> {
    declare id: number | null;
    declare title: string | null;
    declare body: string | null;
    declare image: string | null;
    declare likes: number | null;
    declare dislikes: number | null;
    declare views: number | null;
    declare slug: string | null;
    declare is_closed: boolean | null;
    declare UserId?: number | null;
    declare CategoryId?: number | null;

    // associations
    declare getUlike: HasManyGetAssociationsMixin<User>;
    declare addUlike: HasManyAddAssociationMixin<User, number>;
    declare hasUlike: HasManyHasAssociationMixin<User, number>;
    declare removeUlike: HasManyRemoveAssociationMixin<User, number>;

    declare getUDlike: HasManyGetAssociationsMixin<User>;
    declare addUDlike: HasManyAddAssociationMixin<User, number>;
    declare hasUDlike: HasManyHasAssociationMixin<User, number>;
    declare removeUDlike: HasManyRemoveAssociationMixin<User, number>;

    declare getUview: HasManyGetAssociationsMixin<User>;
    declare addUview: HasManyAddAssociationMixin<User, number>;
    declare hasUview: HasManyHasAssociationMixin<User, number>;
    declare removeUview: HasManyRemoveAssociationMixin<User, number>;

    declare getUser: HasManyGetAssociationsMixin<User>;
    declare addUser: HasManyAddAssociationMixin<User, number>;
    declare hasUser: HasManyHasAssociationMixin<User, number>;
    declare removeUser: HasManyRemoveAssociationMixin<User, number>;

    declare getTag: HasManyGetAssociationsMixin<Tag>;
    declare addTag: HasManyAddAssociationMixin<Tag, number>;
    declare hasTag: HasManyHasAssociationMixin<Tag, number>;
    declare removeTag: HasManyRemoveAssociationMixin<Tag, number>;
}

Question.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        body: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
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
        views: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        is_closed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    { sequelize, modelName: "Question", timestamps: true }
);

export default Question;
