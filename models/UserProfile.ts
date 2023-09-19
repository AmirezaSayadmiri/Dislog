import {
    DataTypes,
    HasManyAddAssociationMixin,
    HasManyGetAssociationsMixin,
    HasManyHasAssociationMixin,
    HasManyRemoveAssociationMixin,
    InferAttributes,
    InferCreationAttributes,
    Model,
    Sequelize,
} from "sequelize";
import sequelize from "../database";

class UserProfile extends Model<InferAttributes<UserProfile>, InferCreationAttributes<UserProfile>> {
    declare id: number | null;
    declare bio: string | null;
    declare skills: string | null;
    declare experiences: string | null;
    declare gender: string | null;
    declare image: string | null;
    declare age: number | null;
    declare score: number | null;
    declare UserId?: number | null;

    // associations
    declare getFollower: HasManyGetAssociationsMixin<UserProfile>;
    declare addFollower: HasManyAddAssociationMixin<UserProfile, number>;
    declare hasFollower: HasManyHasAssociationMixin<UserProfile, number>;
    declare removeFollower: HasManyRemoveAssociationMixin<UserProfile, number>;

    declare getFollowing: HasManyGetAssociationsMixin<UserProfile>;
    declare addFollowing: HasManyAddAssociationMixin<UserProfile, number>;
    declare hasFollowing: HasManyHasAssociationMixin<UserProfile, number>;
    declare removeFollowing: HasManyRemoveAssociationMixin<UserProfile, number>;
}

UserProfile.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        bio: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        gender: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        skills: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        experiences: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        score: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
    },
    { sequelize, modelName: "UserProfile", timestamps: true }
);

export default UserProfile;
