import { RequestHandler } from "express";
import { CustomRequestHandler, wrapperRequestHandler } from "../types/types";
import { validationResult } from "express-validator";
import Question from "../models/Question";
import Category from "../models/Category";
import slugify from "slugify";
import User from "../models/User";
import UserProfile from "../models/UserProfile";
import Answer from "../models/Answer";
import Tag from "../models/Tag";
import { Op } from "sequelize";
import deleteFile from "../helpers/deleteFile";
import AppError from "../AppError";

const postQuestion: CustomRequestHandler = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError("error", 400, errors.array()));
    }

    const { title, body, CategoryId, tags } = req.body;

    const question = await Question.create({ title, body, UserId: +req.userId!, CategoryId });
    question.slug = question.title!.replace(/\s/g, "-");
    question.slug = question.slug!.replace(/[؟|?]/g, "");
    tags.map(async (tag: number) => {
        await question.addTag(tag);
    });
    await question.save();

    return res.status(201).json({ message: "سوال شما با موفقیت ثبت شد", questionId: question.id });
};

const postQuestionImage: CustomRequestHandler = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError("error", 400, errors.array()));
    }

    const image = req.file;
    if (!image) {
        return next(new AppError("لطفا عکس سوال خود را تعیین کنید", 400));
    }

    const questionId = req.params.questionId;

    const question = await Question.findOne({ where: { id: questionId, UserId: +req.userId! } });

    if (!question) {
        return next();
    }

    if (question.image) {
        deleteFile(question.image);
    }

    question.image = image.path;
    await question.save();

    return res.status(200).json({ message: "عکس سوال با موفقیت ذخیره شد" });
};

const deleteQuestionImage: CustomRequestHandler = async (req, res, next) => {
    const questionId = req.params.questionId;
    let options: any = {
        where: { id: questionId },
    };
    if (!req.isAdmin) {
        options = {
            where: {
                ...options.where,
                is_active: true,
                UserId: +req.userId!,
            },
        };
    }
    const question = (await Question.findOne(options)) as Question;

    if (!question) {
        return next();
    }

    if (question.image) {
        deleteFile(question.image);
        question.image = null;
        await question.save();
    }

    return res.status(200).json({ message: "عکس سوال با موفقیت حذف شد" });
};

const getQuestion: CustomRequestHandler = async (req, res, next) => {
    const id = req.params.id;
    const question = await Question.findOne({
        where: { id, is_active: true },
        include: [
            { model: User, as: "User", include: [{ model: UserProfile, as: "UserProfile" }] },
            {
                model: Answer,
                as: "Answers",
                include: [{ model: User, as: "User", include: [{ model: UserProfile, as: "UserProfile" }] }],
            },
            { model: Category, as: "Category" },
            { model: Tag, as: "Tag" },
        ],
    });

    if (!question) {
        return next();
    }

    return res.status(200).json({ question });
};

const postQuestionView: CustomRequestHandler = async (req, res, next) => {
    const id = req.params.id;

    const question = (await Question.findOne({ where: { id, is_active: true } })) as Question;

    if (!question) {
        next();
    }

    const hasViewed = await question.hasUview(+req.userId!);
    if (!hasViewed) {
        await question.addUview(+req.userId!);
        question.views = question.views! + 1;
        await question.save();
    }
    return res.status(200).json({ message: "سوال مورد نظر دیده شد" });
};

const postQuestionLike: CustomRequestHandler = async (req, res, next) => {
    const id = req.params.id;

    const question = (await Question.findOne({ where: { id, is_active: true } })) as Question;

    if (!question) {
        return next();
    }

    const hasLiked = await question.hasUlike(+req.userId!);
    if (!hasLiked) {
        await question.addUlike(+req.userId!);
        question.likes = question.likes! + 1;

        const hasDisliked = await question.hasUDlike(+req.userId!);
        if (hasDisliked) {
            await question.removeUDlike(+req.userId!);
            question.dislikes = question.dislikes! - 1;
        }
        await question.save();
    } else {
        question.likes = question.likes! - 1;
        await question.save();
        await question.removeUlike(+req.userId!);
    }

    return res.status(200).json({ message: "سوال مورد نظر لایک شد" });
};

const postQuestionDislike: CustomRequestHandler = async (req, res, next) => {
    const id = req.params.id;

    const question = (await Question.findOne({ where: { id, is_active: true } })) as Question;

    if (!question) {
        return next();
    }

    const hasDisliked = await question.hasUDlike(+req.userId!);
    if (!hasDisliked) {
        await question.addUDlike(+req.userId!);
        question.dislikes = question.dislikes! + 1;

        const hasLiked = await question.hasUlike(+req.userId!);
        if (hasLiked) {
            await question.removeUlike(+req.userId!);
            question.likes = question.likes! - 1;
        }
        await question.save();
    } else {
        question.dislikes = question.dislikes! - 1;
        await question.save();
        await question.removeUDlike(+req.userId!);
    }

    return res.status(200).json({ message: "سوال مورد نظر دیسلایک شد" });
};

const postQuestionClose: CustomRequestHandler = async (req, res, next) => {
    const id = req.params.id;

    const question = (await Question.findOne({ where: { id, UserId: req.userId, is_active: true } })) as Question;

    if (!question) {
        return next();
    }

    question.is_closed = true;
    await question.save();

    return res.status(200).json({ message: "سوال مورد نظر بسته شد" });
};

const getLatestQuestions: CustomRequestHandler = async (req, res, next) => {
    const questions = await Question.findAll({
        limit: 8,
        order: [["createdAt", "DESC"]],
        include: { model: User, as: "User", include: [{ model: UserProfile, as: "UserProfile" }] },
        where: { is_active: true },
    });

    return res.status(200).json({ questions });
};

const getQuestions: CustomRequestHandler = async (req, res, next) => {
    const { q, categories, page, order } = req.query;

    let options: any = {
        offset: 0,
        limit: 5,
        include: [
            { model: User, as: "User", include: [{ model: UserProfile, as: "UserProfile" }] },
            { model: Tag, as: "Tag" },
        ],
        order: [["createdAt", "DESC"]],
        where: { is_active: true },
    };

    if (q) {
        options = {
            ...options,
            where: {
                ...options.where,
                [Op.or]: [
                    {
                        title: {
                            [Op.like]: `%${q}%`,
                        },
                    },
                    {
                        body: {
                            [Op.like]: `%${q}%`,
                        },
                    },
                ],
            },
        };
    }

    if (Array.isArray(categories)) {
        let isValidCategories = true;

        const validateCategories = async () => {
            categories.map(async (category) => {
                const cat = await Category.findByPk(+category);
                if (!cat) {
                    isValidCategories = false;
                }
            });
        };

        await validateCategories();

        if (!isValidCategories) {
            return next();
        }

        options = {
            ...options,
            where: {
                ...options.where,
                CategoryId: {
                    [Op.in]: categories,
                },
            },
        };
    } else if (categories) {
        const category = await Category.findByPk(+categories);

        if (!category) {
            return next();
        }

        options = {
            ...options,
            where: {
                ...options.where,
                CategoryId: categories,
            },
        };
    }

    if (order && order === "dateD") {
        options = {
            ...options,
            order: [["createdAt", "DESC"]],
        };
    } else if (order && order === "date") {
        options = {
            ...options,
            order: [["createdAt", "ASC"]],
        };
    } else if (order && order === "close") {
        options = {
            ...options,
            order: [["createdAt", "DESC"]],
            where: {
                ...options.where,
                is_closed: true,
            },
        };
    } else if (order && order === "open") {
        options = {
            ...options,
            order: [["createdAt", "DESC"]],
            where: {
                ...options.where,
                is_closed: false,
            },
        };
    }

    const count = await Question.count({ where: options.where });
    if (page && Number.isInteger(+page) && +page > 0) {
        if (+page !== 1) {
            const hasEnoughData = (+page - 1) * 5 + 1 <= count;

            if (!hasEnoughData) {
                return next();
            }

            options = {
                ...options,
                limit: 5,
                offset: (+page - 1) * 5,
            };
        }
    }

    const questions = await Question.findAll(options);
    return res.status(200).json({ questions, count });
};

const putQuestion: CustomRequestHandler = async (req, res, next) => {
    const { title, body, tags } = req.body;
    const id = req.params.id;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError("error", 400, errors.array()));
    }

    let options: any = { where: { id } };
    if (!req.isAdmin) {
        options = {
            where: {
                ...options.where,
                is_active: true,
                UserId: +req.userId!,
            },
        };
    }

    const question = await Question.findOne(options);

    if (!question) {
        return next();
    }

    question.title = title;
    question.slug = question.title!.replace(/\s/g, "-");
    question.slug = question.slug!.replace(/[؟|?]/g, "");
    question.body = body;
    tags.map(async (tag: string) => {
        const hasTag = await question.hasTag(+tag);
        if (!hasTag) {
            await question.addTag(+tag);
        }
    });
    await question.save();

    return res.status(200).json({ message: "پرسش آپدیت شد", questionId: question.id });
};

const deleteQuestion: CustomRequestHandler = async (req, res, next) => {
    const id = req.params.id;

    let options: any = {
        where: { id },
    };

    if (!req.isAdmin) {
        options = {
            where: {
                ...options.where,
                is_active: true,
                UserId: +req.userId!,
            },
        };
    }

    const question = (await Question.findOne(options)) as Question;

    if (!question) {
        return next();
    }

    if (question.image) {
        deleteFile(question.image);
    }

    await question.destroy();

    return res.status(200).json({ message: "پرسش حذف شد" });
};

const postActiveQuestion: CustomRequestHandler = async (req, res, next) => {
    const id = req.params.id;

    const question = (await Question.findOne({ where: { id } })) as Question;

    if (!question) {
        return next();
    }

    question.is_active = !question.is_active;
    await question.save();

    return res.status(200).json({ message: ` پرسش ${question.is_active ? "فعال" : "غیر فعال"} شد` });
};

const getAllQuestions: CustomRequestHandler = async (req, res, next) => {
    const questions = await Question.findAll({
        include: [
            { model: User, as: "User", include: [{ model: UserProfile, as: "UserProfile" }] },
            { model: Tag, as: "Tag" },
            { model: Category, as: "Category" },
        ],
    });
    return res.status(200).json({ questions });
};

export const wrappedPostQuestion = wrapperRequestHandler(postQuestion);
export const wrappedPostQuestionImage = wrapperRequestHandler(postQuestionImage);
export const wrappedDeleteQuestionImage = wrapperRequestHandler(deleteQuestionImage);
export const wrappedGetQuestion = wrapperRequestHandler(getQuestion);
export const wrappedPostQuestionView = wrapperRequestHandler(postQuestionView);
export const wrappedPostQuestionLike = wrapperRequestHandler(postQuestionLike);
export const wrappedPostQuestionDislike = wrapperRequestHandler(postQuestionDislike);
export const wrappedPostQuestionClose = wrapperRequestHandler(postQuestionClose);
export const wrappedGetLatestQuestions = wrapperRequestHandler(getLatestQuestions);
export const wrappedGetQuestions = wrapperRequestHandler(getQuestions);
export const wrappedPutQuestions = wrapperRequestHandler(putQuestion);
export const wrappedDeleteQuestion = wrapperRequestHandler(deleteQuestion);
export const wrappedPostActiveQuestion = wrapperRequestHandler(postActiveQuestion);
export const wrappedGetAllQuestions = wrapperRequestHandler(getAllQuestions);
