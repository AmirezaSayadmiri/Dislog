import express from "express";
import isAuthMiddleWare from "../middlewares/isAuthMiddleWare";
import {
    wrappedGetCategories,
    wrappedGetQuestion,
    wrappedPostQuestion,
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

const router = express.Router();

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
    body("categoryId")
        .notEmpty()
        .withMessage("لطفا دسته بندی سوال خود را وارد کنید")
        .custom(async (value) => {
            const category = await Category.findOne({ where: { id: value } });
            if (!category) {
                throw new Error("دسته بندی سوال اشتباه میباشد");
            }
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

router.get("/categories", wrappedGetCategories);

router.get("/questions/:slug", wrappedGetQuestion);

router.post("/questions/:id/view", isAuthMiddleWare, wrappedPostQuestionView);
router.post("/questions/:id/like", isAuthMiddleWare, wrappedPostQuestionLike);
router.post("/questions/:id/dislike", isAuthMiddleWare, wrappedPostQuestionDislike);

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
    body("categoryId")
        .notEmpty()
        .withMessage("لطفا دسته بندی سوال خود را وارد کنید")
        .custom(async (value) => {
            const category = await Category.findOne({ where: { id: value } });
            if (!category) {
                throw new Error("دسته بندی سوال اشتباه میباشد");
            }
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

export default router;
