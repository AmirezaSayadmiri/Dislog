import Category from "../models/Category";
import { CustomRequestHandler, wrapperRequestHandler } from "../types/types";

const getCategories: CustomRequestHandler = async (req, res, next) => {
    const categories = await Category.findAll();
    return res.status(200).json({ categories });
};
const wrappedGetCategories = wrapperRequestHandler(getCategories);

export { wrappedGetCategories };
