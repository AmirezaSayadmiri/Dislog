import { RequestHandler } from "express";
import { CustomRequestHandler, wrapperRequestHandler } from "../types/types";
import { validationResult } from "express-validator";
import Question from "../models/Question";
import Category from "../models/Category";
import slugify from "slugify";

const getCategories: CustomRequestHandler = async (req, res, next) => {
    const categories = await Category.findAll();
    return res.status(200).json({ categories });
};

const postQuestion: CustomRequestHandler = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    const { title, body, categoryId } = req.body;

    const question = await Question.create({ title, body, userId: +req.userId!, categoryId });
    question.slug = question.title!.replace(" ", "-").replace("?", "").replace("؟", "");
    await question.save();

    return res.status(201).json({ message: "سوال شما با موفقیت ثبت شد",questionId:question.id });
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

const wrappedPostQuestion = wrapperRequestHandler(postQuestion);
const wrappedGetCategories = wrapperRequestHandler(getCategories);
const wrappedPostQuestionImage = wrapperRequestHandler(postQuestionImage);

export { wrappedPostQuestion, wrappedGetCategories, wrappedPostQuestionImage };
