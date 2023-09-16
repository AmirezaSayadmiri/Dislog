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

class UserProfile extends Model<
  InferAttributes<UserProfile>,
  InferCreationAttributes<UserProfile>
> {
  declare id: number | null;
  declare bio: string | null;
  declare skills: string | null;
  declare experiences: string | null;
  declare gender: string | null;
  declare image: string | null;
  declare age: number | null;
  declare score: number | null;
  declare userId?: number | null;

  // associations
  declare getFollower: HasManyGetAssociationsMixin<UserProfile>; // Note the null assertions!
  declare addFollower: HasManyAddAssociationMixin<UserProfile, number>;
  declare hasFollower: HasManyHasAssociationMixin<UserProfile, number>;
  declare removeFollower: HasManyRemoveAssociationMixin<UserProfile, number>;
  
  declare getFollowing: HasManyGetAssociationsMixin<UserProfile>; // Note the null assertions!
  declare addFollowing: HasManyAddAssociationMixin<UserProfile, number>;
  declare hasFollowing: HasManyHasAssociationMixin<UserProfile, number>;
  declare removeFollowing: HasManyRemoveAssociationMixin<UserProfile, number>;
  // declare addProjects: HasManyAddAssociationsMixin<Project, number>;
  // declare setProjects: HasManySetAssociationsMixin<Project, number>;
  // declare removeProjects: HasManyRemoveAssociationsMixin<Project, number>;
  // declare hasProjects: HasManyHasAssociationsMixin<Project, number>;
  // declare countProjects: HasManyCountAssociationsMixin;
  // declare createProject: HasManyCreateAssociationMixin<Project, 'ownerId'>;
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
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 0,
    },
  },
  { sequelize, modelName: "UserProfile", timestamps: true }
);

export default UserProfile;
