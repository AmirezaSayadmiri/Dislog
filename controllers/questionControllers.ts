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

const postQuestion: CustomRequestHandler = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    const { title, body, CategoryId, tags } = req.body;

    const question = await Question.create({ title, body, UserId: +req.userId!, CategoryId });
    question.slug = question.title!.replaceAll(" ", "-").replaceAll("?", "").replaceAll("؟", "");
    tags.map(async (tag: number) => {
        await question.addTag(tag);
    });
    await question.save();

    return res.status(201).json({ message: "سوال شما با موفقیت ثبت شد", questionId: question.id });
};

const postQuestionImage: CustomRequestHandler = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    const image = req.file;
    if (!image) {
        return res.status(400).json({ message: "لطفا عکس سوال خود را تعیین کنید" });
    }

    const questionId = req.params.questionId;
    const question = (await Question.findOne({ where: { id: questionId } })) as Question;

    question.image = image.path;
    await question.save();

    return res.status(200).json({ message: "عکس سوال با موفقیت ذخیره شد" });
};

const getQuestion: CustomRequestHandler = async (req, res, next) => {
    const id = req.params.id;
    const question = await Question.findOne({
        where: { id },
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
        return res.status(404).json({ message: "notfound" });
    }

    return res.status(200).json({ question });
};

const postQuestionView: CustomRequestHandler = async (req, res, next) => {
    const id = req.params.id;

    const question = (await Question.findByPk(id)) as Question;

    if (!question) {
        return res.status(404).json({ message: "notfound" });
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

    const question = (await Question.findByPk(id)) as Question;

    if (!question) {
        return res.status(404).json({ message: "notfound" });
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
    }

    return res.status(200).json({ message: "سوال مورد نظر لایک شد" });
};

const postQuestionDislike: CustomRequestHandler = async (req, res, next) => {
    const id = req.params.id;

    const question = (await Question.findByPk(id)) as Question;

    if (!question) {
        return res.status(404).json({ message: "notfound" });
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
    }

    return res.status(200).json({ message: "سوال مورد نظر دیسلایک شد" });
};

const postQuestionClose: CustomRequestHandler = async (req, res, next) => {
    const id = req.params.id;

    const question = (await Question.findByPk(id)) as Question;

    if (!question) {
        return res.status(404).json({ message: "notfound" });
    }

    question.is_closed = true;
    await question.save();

    return res.status(200).json({ message: "سوال مورد نظر بسته شد" });
};

const getFilteredQuestion:CustomRequestHandler = (req, res, next) => {};

const wrappedPostQuestion = wrapperRequestHandler(postQuestion);
const wrappedPostQuestionImage = wrapperRequestHandler(postQuestionImage);
const wrappedGetQuestion = wrapperRequestHandler(getQuestion);
const wrappedPostQuestionView = wrapperRequestHandler(postQuestionView);
const wrappedPostQuestionLike = wrapperRequestHandler(postQuestionLike);
const wrappedPostQuestionDislike = wrapperRequestHandler(postQuestionDislike);
const wrappedPostQuestionClose = wrapperRequestHandler(postQuestionClose);
const wrappedGetFilteredQuestion = wrapperRequestHandler(getFilteredQuestion);

export {
    wrappedPostQuestion,
    wrappedPostQuestionImage,
    wrappedGetQuestion,
    wrappedPostQuestionDislike,
    wrappedPostQuestionView,
    wrappedPostQuestionLike,
    wrappedPostQuestionClose,
    wrappedGetFilteredQuestion
};
