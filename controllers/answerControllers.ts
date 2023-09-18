import { validationResult } from "express-validator";
import { CustomRequestHandler, wrapperRequestHandler } from "../types/types";
import Answer from "../models/Answer";

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

const wrappedPostAnswer = wrapperRequestHandler(postAnswer);
const wrappedPostAnswerImage = wrapperRequestHandler(postAnswerImage);

export { wrappedPostAnswer, wrappedPostAnswerImage };
