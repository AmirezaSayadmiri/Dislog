const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database");

const UserProfile = sequelize.define(
  "userprofile",
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
      defaultValue:0
    },
  },
  { timestamps: true }
);

module.exports = UserProfile;
