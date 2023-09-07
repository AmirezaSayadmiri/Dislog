const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database");

const User = sequelize.define("user", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  email:{
    type:DataTypes.STRING,
    unique:true,
    allowNull:false,
  },
  username: {
    type: DataTypes.STRING,
    defaultValue: `user${new Date().getTime().toString().slice(7)}`,
    unique:true,
    allowNull:false,
  },
  activation_code:{
    type:DataTypes.STRING,
    defaultValue:new Date().getTime().toString().slice(8),
    allowNull:false,
  }
  
  
});

module.exports = User;
