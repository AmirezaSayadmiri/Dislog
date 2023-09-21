import { validationResult } from "express-validator";
import Category from "../models/Category";
import { CustomRequestHandler, wrapperRequestHandler } from "../types/types";

const getCategories: CustomRequestHandler = async (req, res, next) => {
    const categories = await Category.findAll();
    return res.status(200).json({ categories });
};

const getCategory: CustomRequestHandler = async (req, res, next) => {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
        return next();
    }

    return res.status(200).json({ category });
};

const postCategory: CustomRequestHandler = async (req, res, next) => {
    const { name } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    const category = (await Category.create({ name })) as Category;
    category.slug = category.name!.replaceAll(" ", "-").replaceAll("?", "").replaceAll("؟", "");
    await category.save();

    return res.status(200).json({ message: "دسته بندی ساخته شد" });
};

const putCategory: CustomRequestHandler = async (req, res, next) => {
    const { name } = req.body;
    const { id } = req.params;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    const category = await Category.findByPk(id);

    if (!category) {
        return next();
    }

    category.name = name;
    category.slug = name.replaceAll(" ", "-").replaceAll("?", "").replaceAll("؟", "");
    await category.save();

    return res.status(200).json({ message: "دسته بندی ویرایش شد" });
};

const deleteCategory: CustomRequestHandler = async (req, res, next) => {
    const id = req.params.id;

    const category = await Category.findByPk(id);

    if (!category) {
        return next();
    }

    await category.destroy();

    return res.status(200).json({ message: "دسته بندی حذف شد" });
};

export const wrappedGetCategories = wrapperRequestHandler(getCategories);
export const wrappedGetCategory = wrapperRequestHandler(getCategory);
export const wrappedPostCategory = wrapperRequestHandler(postCategory);
export const wrappedPutCategory = wrapperRequestHandler(putCategory);
export const wrappedDeleteCategory = wrapperRequestHandler(deleteCategory);
