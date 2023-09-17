import { Sequelize } from "sequelize";

import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASSWORD!, {
    dialect: "mysql",
    host: process.env.DB_HOST!,
    logging: false,
});

export default sequelize;
