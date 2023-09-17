import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import sequelize from "../database";

class Category extends Model<InferAttributes<Category>, InferCreationAttributes<Category>> {
    declare id: number | null;
    declare name: string | null;
    declare slug: string | null;
}

Category.init(
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
        },
        slug:{
            type:DataTypes.STRING,
            allowNull:true
        }
    },
    { sequelize, modelName: "Category", timestamps: true }
);

export default Category;
