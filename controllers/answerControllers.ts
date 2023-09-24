import { validationResult } from "express-validator";
import { CustomRequestHandler, wrapperRequestHandler } from "../types/types";
import Answer from "../models/Answer";
import Question from "../models/Question";
import User from "../models/User";
import UserProfile from "../models/UserProfile";
import deleteFile from "../helpers/deleteFile";
import AppError from "../AppError";

const postAnswer: CustomRequestHandler = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError("error", 400, errors.array()));
    }

    const { body, QuestionId } = req.body;

    const answer = await Answer.create({ body, UserId: +req.userId!, QuestionId });

    return res.status(201).json({ message: "سوال شما با موفقیت ثبت شد", answerId: answer.id });
};

const postAnswerImage: CustomRequestHandler = async (req, res, next) => {
    const answerId = req.params.answerId;

    let options: any = {
        where: { id: answerId },
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

    const answer = (await Answer.findOne(options)) as Answer;

    if (!answer) {
        return next();
    }

    const image = req.file;
    if (!image) {
        return next(new AppError("لطفا عکس پاسخ خود را تعیین کنید", 400));
    }

    if (answer.image) {
        deleteFile(answer.image);
    }

    answer.image = image.path;
    await answer.save();

    return res.status(200).json({ message: "عکس جواب با موفقیت ذخیره شد" });
};

const postAnswerLike: CustomRequestHandler = async (req, res, next) => {
    const id = req.params.id;

    const answer = (await Answer.findOne({ where: { id, is_active: true } })) as Answer;

    if (!answer) {
        return next();
    }

    const hasLiked = await answer.hasUlike(+req.userId!);
    if (!hasLiked) {
        await answer.addUlike(+req.userId!);
        answer.likes = answer.likes! + 1;

        const hasDisliked = await answer.hasUDlike(+req.userId!);
        if (hasDisliked) {
            await answer.removeUDlike(+req.userId!);
            answer.dislikes = answer.dislikes! - 1;
        }
        await answer.save();
    } else {
        answer.likes = answer.likes! - 1;
        await answer.save();
        await answer.removeUlike(+req.userId!);
    }

    return res.status(200).json({ message: "پاسخ مورد نظر لایک شد" });
};

const postAnswerDislike: CustomRequestHandler = async (req, res, next) => {
    const id = req.params.id;

    const answer = (await Answer.findOne({ where: { id, is_active: true } })) as Answer;

    if (!answer) {
        return next();
    }

    const hasDisliked = await answer.hasUDlike(+req.userId!);
    if (!hasDisliked) {
        await answer.addUDlike(+req.userId!);
        answer.dislikes = answer.dislikes! + 1;

        const hasLiked = await answer.hasUlike(+req.userId!);
        if (hasLiked) {
            await answer.removeUlike(+req.userId!);
            answer.likes = answer.likes! - 1;
        }
        await answer.save();
    } else {
        answer.dislikes = answer.dislikes! - 1;
        await answer.save();
        await answer.removeUDlike(+req.userId!);
    }

    return res.status(200).json({ message: "پاسخ مورد نظر دیسلایک شد" });
};

const postAnswerSelect: CustomRequestHandler = async (req, res, next) => {
    const id = req.params.id;

    const answer = (await Answer.findOne({
        where: { id, is_active: true },
        include: { model: Question, as: "Question" },
    })) as Answer;

    if (!answer || answer.Question!.UserId !== req.userId || answer.UserId == req.userId) {
        return next();
    }

    if (!answer.is_selected) {
        const lastSelectedAnswer = (await Answer.findOne({
            where: { QuestionId: answer.QuestionId, is_selected: true, is_active: true },
        })) as Answer;

        if (lastSelectedAnswer) {
            lastSelectedAnswer.is_selected = false;
            await lastSelectedAnswer.save();
            const userProfile = (await UserProfile.findOne({
                where: { UserId: lastSelectedAnswer.UserId! },
            })) as UserProfile;
            userProfile.score = userProfile.score! - 10;
            await userProfile.save();
        }
        answer.is_selected = true;
        await answer.save();
        const userProfile = (await UserProfile.findOne({ where: { UserId: answer.UserId! } })) as UserProfile;
        userProfile.score = userProfile.score! + 10;
        await userProfile.save();
    } else {
        answer.is_selected = false;
        const userProfile = (await UserProfile.findOne({ where: { UserId: answer.UserId } })) as UserProfile;
        userProfile.score = +userProfile.score! - 10;
        await answer.save();
        await userProfile.save();
    }

    return res.status(200).json({ message: "پاسخ مورد نظر برگزیده شد" });
};

const getAnswers: CustomRequestHandler = async (req, res, next) => {
    const answers = await Answer.findAll({
        include: [
            { model: User, as: "User", include: [{ model: UserProfile, as: "UserProfile" }] },
            { model: Question, as: "Question" },
        ],
    });
    
    return res.status(200).json({ answers });
};

const putAnswer: CustomRequestHandler = async (req, res, next) => {
    const { body } = req.body;
    const { id } = req.params;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError("error", 400, errors.array()));
    }

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
    const answer = (await Answer.findOne(options)) as Answer;

    if (!answer) {
        return next();
    }

    answer.body = body;
    await answer.save();

    return res.status(200).json({ message: "پاسخ ویرایش شد", answerId: answer.id });
};

const deleteAnswer: CustomRequestHandler = async (req, res, next) => {
    const { id } = req.params;

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

    const answer = (await Answer.findOne(options)) as Answer;

    if (!answer) {
        return next();
    }

    if (answer.image) {
        deleteFile(answer.image);
    }

    await answer.destroy();

    return res.status(200).json({ message: "پاسخ حذف شد" });
};

const postActiveAnswer: CustomRequestHandler = async (req, res, next) => {
    const id = req.params.id;

    const answer = (await Answer.findOne({ where: { id } })) as Answer;

    if (!answer) {
        return next();
    }

    answer.is_active = !answer.is_active;
    await answer.save();

    return res.status(200).json({ message: ` پاسخ ${answer.is_active ? "فعال" : "غیر فعال"} شد` });
};

const deleteAnswerImage: CustomRequestHandler = async (req, res, next) => {
    const answerId = req.params.answerId;

    let options: any = {
        where: { id: answerId },
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
    const answer = (await Answer.findOne(options)) as Answer;

    if (!answer) {
        return next();
    }

    if (answer.image) {
        deleteFile(answer.image);
        answer.image = null;
        await answer.save();
    }

    return res.status(200).json({ message: "عکس پاسخ با موفقیت حذف شد" });
};

export const wrappedPostAnswer = wrapperRequestHandler(postAnswer);
export const wrappedPostAnswerImage = wrapperRequestHandler(postAnswerImage);
export const wrappedPostAnswerLike = wrapperRequestHandler(postAnswerLike);
export const wrappedPostAnswerDislike = wrapperRequestHandler(postAnswerDislike);
export const wrappedPostAnswerSelect = wrapperRequestHandler(postAnswerSelect);
export const wrappedGetAnswers = wrapperRequestHandler(getAnswers);
export const wrappedPutAnswer = wrapperRequestHandler(putAnswer);
export const wrappedDeleteAnswer = wrapperRequestHandler(deleteAnswer);
export const wrappedPostActiveAnswer = wrapperRequestHandler(postActiveAnswer);
export const wrappedDeleteAnswerImage = wrapperRequestHandler(deleteAnswerImage);
