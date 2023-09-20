import express from "express";
import isAuthMiddleWare from "../middlewares/isAuthMiddleWare";
import {
    wrappedGetFilteredQuestions,
    wrappedGetLatestQuestions,
    wrappedGetQuestion,
    wrappedPostQuestion,
    wrappedPostQuestionClose,
    wrappedPostQuestionDislike,
    wrappedPostQuestionImage,
    wrappedPostQuestionLike,
    wrappedPostQuestionView,
} from "../controllers/questionControllers";
import { body, param } from "express-validator";
import Question from "../models/Question";
import Category from "../models/Category";
import multer from "multer";
import { questionImageFilter, questionImageStorage } from "../multer/questionImage";
import Tag from "../models/Tag";

const router = express.Router();

router.post(
    "/questions/:questionId/image",
    isAuthMiddleWare,
    param("questionId").custom(async (value, { req }) => {
        const question = await Question.findOne({ where: { id: value, UserId: req.userId } });
        if (!question) {
            throw new Error("لطفا آیدی سوال خود را تعیین کنید");
        }
    }),
    multer({ storage: questionImageStorage, fileFilter: questionImageFilter }).single("image"),
    wrappedPostQuestionImage
);

router.get("/questions/:slug/:id", wrappedGetQuestion);

router.post("/questions/:id/view", isAuthMiddleWare, wrappedPostQuestionView);
router.post("/questions/:id/like", isAuthMiddleWare, wrappedPostQuestionLike);
router.post("/questions/:id/dislike", isAuthMiddleWare, wrappedPostQuestionDislike);
router.post("/questions/:id/close", isAuthMiddleWare, wrappedPostQuestionClose);

router.post(
    "/questions",
    isAuthMiddleWare,
    body("title")
        .notEmpty()
        .withMessage("لطفا عنوان سوال خود را وارد کنید")
        .custom(async (value) => {
            const question = await Question.findOne({ where: { title: value } });
            if (question) {
                throw new Error("عنوان سوال از قبل موجود میباشد");
            }
        }),
    body("body").notEmpty().withMessage("لطفا متن سوال خود را وارد کنید"),
    body("CategoryId")
        .notEmpty()
        .withMessage("لطفا دسته بندی سوال خود را وارد کنید")
        .custom(async (value) => {
            const category = await Category.findOne({ where: { id: value } });
            if (!category) {
                throw new Error("دسته بندی سوال اشتباه میباشد");
            }
        }),
    body("tags")
        .notEmpty()
        .withMessage("لطفا حداقل دو تگ وارد کنید")
        .isArray()
        .withMessage("لطفا حداقل دو تگ وارد کنید")
        .custom(async (tags:number[]) => {
            if(tags.length < 2){
                throw new Error("لطفا حداقل دو تگ وارد کنید");
            }
            tags.map(async (id: number) => {
                const tag = await Tag.findByPk(id);
                if (!tag) {
                    throw new Error("تگ های وارد شده اشتباه هستند");
                }
            });
        }),
    wrappedPostQuestion
);

router.post(
    "/questions/:questionId/image",
    isAuthMiddleWare,
    param("questionId").custom(async (value, { req }) => {
        const question = await Question.findOne({ where: { id: value, UserId: req.userId } });
        if (!question) {
            throw new Error("لطفا آیدی سوال خود را تعیین کنید");
        }
    }),
    multer({ storage: questionImageStorage, fileFilter: questionImageFilter }).single("image"),
    wrappedPostQuestionImage
);

router.get("/questions/latest", wrappedGetLatestQuestions)
router.get("/questions", wrappedGetFilteredQuestions)

export default router;
