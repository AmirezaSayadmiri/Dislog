import express from "express";
import { body, param } from "express-validator";
import isAuthMiddleWare from "../middlewares/isAuthMiddleWare";
import multer from "multer";
import { answerImageFileFilter, answerImageStorage } from "../multer/answerImage";
import {
    wrappedPostAnswer,
    wrappedPostAnswerDislike,
    wrappedPostAnswerImage,
    wrappedPostAnswerLike,
    wrappedPostAnswerSelect,
} from "../controllers/answerControllers";
import Question from "../models/Question";
import Answer from "../models/Answer";

const router = express.Router();
router.post(
    "/answers",
    isAuthMiddleWare,
    body("body").notEmpty().withMessage("لطفا متن جواب خود را وارد کنید"),

    body("QuestionId")
        .notEmpty()
        .withMessage("لطفا دسته بندی سوال خود را وارد کنید")
        .custom(async (value) => {
            const question = await Question.findOne({ where: { id: value, is_closed: false } });
            if (!question) {
                throw new Error("سوال مورد نظر برای پاسخ اشتباه میباشد");
            }
        }),
    wrappedPostAnswer
);

router.post(
    "/answers/:answerId/image",
    isAuthMiddleWare,
    param("answerId").custom(async (value, { req }) => {
        const answer = await Answer.findOne({ where: { id: value, UserId: req.userId } });
        if (!answer) {
            throw new Error("لطفا آیدی جواب خود را تعیین کنید");
        }
    }),
    multer({ storage: answerImageStorage, fileFilter: answerImageFileFilter }).single("image"),
    wrappedPostAnswerImage
);

router.post("/answers/:id/like", isAuthMiddleWare, wrappedPostAnswerLike);
router.post("/answers/:id/dislike", isAuthMiddleWare, wrappedPostAnswerDislike);
router.post("/answers/:id/select", isAuthMiddleWare, wrappedPostAnswerSelect);

export default router;
