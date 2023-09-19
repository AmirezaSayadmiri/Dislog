import { validationResult } from "express-validator";
import { CustomRequestHandler, wrapperRequestHandler } from "../types/types";
import Answer from "../models/Answer";
import Question from "../models/Question";
import User from "../models/User";
import UserProfile from "../models/UserProfile";

const postAnswer: CustomRequestHandler = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    const { body, QuestionId } = req.body;

    const answer = await Answer.create({ body, UserId: +req.userId!, QuestionId });

    return res.status(201).json({ message: "سوال شما با موفقیت ثبت شد", answerId: answer.id });
};

const postAnswerImage: CustomRequestHandler = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    const image = req.file;
    if (!image) {
        return res.status(400).json({ message: "لطفا عکس پاسخ خود را تعیین کنید" });
    }

    const answerId = req.params.answerId;
    const answer = (await Answer.findOne({ where: { id: answerId } })) as Answer;

    answer.image = image.path;
    await answer.save();

    return res.status(200).json({ message: "عکس جواب با موفقیت ذخیره شد" });
};

const postAnswerLike: CustomRequestHandler = async (req, res, next) => {
    const id = req.params.id;

    const answer = (await Answer.findByPk(id)) as Answer;

    if (!answer) {
        return res.status(404).json({ message: "notfound" });
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
    }

    return res.status(200).json({ message: "پاسخ مورد نظر لایک شد" });
};

const postAnswerDislike: CustomRequestHandler = async (req, res, next) => {
    const id = req.params.id;

    const answer = (await Answer.findByPk(id)) as Answer;

    if (!answer) {
        return res.status(404).json({ message: "notfound" });
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
    }

    return res.status(200).json({ message: "پاسخ مورد نظر دیسلایک شد" });
};

const postAnswerSelect: CustomRequestHandler = async (req, res, next) => {
    const id = req.params.id;

    const answer = (await Answer.findByPk(id, { include: { model: Question, as: "Question" } })) as Answer;

    if (!answer || answer.Question!.UserId !== req.userId) {
        return res.status(404).json({ message: "notfound" });
    }
    if (!answer.is_selected) {
        const lastSelectedAnswer = (await Answer.findOne({
            where: { QuestionId: answer.QuestionId, is_selected: true },
        })) as Answer;

        if (lastSelectedAnswer) {
            lastSelectedAnswer.is_selected = false;
            await lastSelectedAnswer.save()
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
    }

    return res.status(200).json({ message: "پاسخ مورد نظر برگزیده شد" });
};

const wrappedPostAnswer = wrapperRequestHandler(postAnswer);
const wrappedPostAnswerImage = wrapperRequestHandler(postAnswerImage);
const wrappedPostAnswerLike = wrapperRequestHandler(postAnswerLike);
const wrappedPostAnswerDislike = wrapperRequestHandler(postAnswerDislike);
const wrappedPostAnswerSelect = wrapperRequestHandler(postAnswerSelect);

export {
    wrappedPostAnswer,
    wrappedPostAnswerImage,
    wrappedPostAnswerLike,
    wrappedPostAnswerDislike,
    wrappedPostAnswerSelect,
};
