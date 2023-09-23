import { validationResult } from "express-validator";
import Tag from "../models/Tag";
import { CustomRequestHandler, wrapperRequestHandler } from "../types/types";
import User from "../models/User";
import UserProfile from "../models/UserProfile";
import Category from "../models/Category";

const getTags: CustomRequestHandler = async (req, res, next) => {
    const tags = await Tag.findAll();
    return res.status(200).json({ tags });
};

const getTag: CustomRequestHandler = async (req, res, next) => {
    const { id } = req.params;

    const tag = await Tag.findByPk(id);

    if (!tag) {
        return next();
    }

    return res.status(200).json({ tag });
};

const postTag: CustomRequestHandler = async (req, res, next) => {
    const { name } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    const tag = (await Tag.create({ name })) as Tag;
    tag.slug = tag.name!.replace(/\s/g, "-");
    tag.slug = tag.slug!.replace(/[؟|?]/g, "-");
    await tag.save();

    return res.status(200).json({ message: "تگ ساخته شد" });
};

const putTag: CustomRequestHandler = async (req, res, next) => {
    const { name } = req.body;
    const { id } = req.params;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    const tag = await Tag.findByPk(id);

    if (!tag) {
        return next();
    }

    tag.name = name;
    tag.slug = tag.name!.replace(/\s/g, "-");
    tag.slug = tag.slug!.replace(/[؟|?]/g, "-");    await tag.save();

    await tag.save();

    return res.status(200).json({ message: "تگ ویرایش شد" });
};

const deleteTag: CustomRequestHandler = async (req, res, next) => {
    const id = req.params.id;

    const tag = await Tag.findByPk(id);

    if (!tag) {
        return next();
    }

    await tag.destroy();

    return res.status(200).json({ message: "تگ حذف شد" });
};

const getTagQuestions: CustomRequestHandler = async (req, res, next) => {
    const { id } = req.params;

    const tag = await Tag.findByPk(+id);

    if (!tag) {
        return next();
    }

    const questions = await tag.getQuestion({
        where: { is_active: true },
        include: [
            { model: User, as: "User", include: [{ model: UserProfile, as: "UserProfile" }] },
            {
                model: Category,
                as: "Category",
            },
        ],
    });

    return res.status(200).json({ questions });
};

export const wrappedGetTags = wrapperRequestHandler(getTags);
export const wrappedGetTag = wrapperRequestHandler(getTag);
export const wrappedPostTag = wrapperRequestHandler(postTag);
export const wrappedPutTag = wrapperRequestHandler(putTag);
export const wrappedDeleteTag = wrapperRequestHandler(deleteTag);
export const wrappedGetTagQuestions = wrapperRequestHandler(getTagQuestions);
