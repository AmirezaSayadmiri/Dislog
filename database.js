const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("dislog", "root", "as84", {
  dialect: "mysql",
  host: "localhost",
  logging: false,
});

module.exports = sequelize;
