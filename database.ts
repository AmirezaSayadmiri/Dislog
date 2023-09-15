import { Sequelize } from "sequelize";

const sequelize = new Sequelize("dislog", "root", "as84", {
  dialect: "mysql",
  host: "localhost",
  logging: false,
});

export default sequelize;
