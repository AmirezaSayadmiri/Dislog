import express from "express";
import isAuthMiddleWare from "../middlewares/isAuthMiddleWare";
import {
    wrappedDeleteQuestion,
    wrappedGetQuestions,
    wrappedGetLatestQuestions,
    wrappedGetQuestion,
    wrappedPostQuestion,
    wrappedPostQuestionClose,
    wrappedPostQuestionDislike,
    wrappedPostQuestionImage,
    wrappedPostQuestionLike,
    wrappedPostQuestionView,
    wrappedPutQuestions,
    wrappedDeleteQuestionImage,
    wrappedPostActiveQuestion,
    wrappedGetAllQuestions,
} from "../controllers/questionControllers";
import { body, param } from "express-validator";
import Question from "../models/Question";
import Category from "../models/Category";
import multer from "multer";
import { questionImageFilter, questionImageStorage } from "../multer/questionImage";
import Tag from "../models/Tag";
import isAdminMiddleWare from "../middlewares/isAdminMiddleWare";

const router = express.Router();

router.get(
    "/questions/:slug/:id",
    param("id").notEmpty().withMessage("لطفا آیدی پرسش را تعیین کنید"),
    wrappedGetQuestion
);

router.post("/questions/:id/view", isAuthMiddleWare, wrappedPostQuestionView);
router.post("/questions/:id/like", isAuthMiddleWare, wrappedPostQuestionLike);
router.post("/questions/:id/dislike", isAuthMiddleWare, wrappedPostQuestionDislike);
router.post("/questions/:id/close", isAuthMiddleWare, wrappedPostQuestionClose);

router.post(
    "/questions",
    isAuthMiddleWare,
    body("title")
        .trim()
        .notEmpty()
        .withMessage("لطفا عنوان سوال خود را وارد کنید")
        .custom(async (value) => {
            const question = await Question.findOne({ where: { title: value } });
            if (question) {
                throw new Error("عنوان سوال از قبل موجود میباشد");
            }
        }),
    body("body").trim().notEmpty().withMessage("لطفا متن سوال خود را وارد کنید"),
    body("CategoryId")
        .trim()
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
        .custom(async (tags: number[]) => {
            if (tags.length < 2) {
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
    multer({ storage: questionImageStorage, fileFilter: questionImageFilter }).single("image"),
    wrappedPostQuestionImage
);

router.delete(
    "/questions/:questionId/image",
    isAuthMiddleWare,
    wrappedDeleteQuestionImage
);

router.get("/questions/latest", wrappedGetLatestQuestions);
router.get("/questions", wrappedGetQuestions);
router.put(
    "/questions/:id",
    isAuthMiddleWare,
    body("title")
        .trim()
        .notEmpty()
        .withMessage("لطفا عنوان سوال خود را وارد کنید")
        .custom(async (value, { req }) => {
            const question = await Question.findOne({ where: { title: value } });
            if (question && question.id != req.params!.id) {
                throw new Error("عنوان سوال از قبل موجود میباشد");
            }
        }),
    body("body").trim().notEmpty().withMessage("لطفا متن سوال خود را وارد کنید"),
    body("CategoryId")
        .trim()
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
        .custom(async (tags: number[]) => {
            if (tags.length < 2) {
                throw new Error("لطفا حداقل دو تگ وارد کنید");
            }
            tags.map(async (id: number) => {
                const tag = await Tag.findByPk(id);
                if (!tag) {
                    throw new Error("تگ های وارد شده اشتباه هستند");
                }
            });
        }),
    wrappedPutQuestions
);
router.delete("/questions/:id", isAuthMiddleWare, wrappedDeleteQuestion);

router.post("/questions/:id/active", isAuthMiddleWare, isAdminMiddleWare, wrappedPostActiveQuestion);

router.get("/questions/all", isAuthMiddleWare, isAdminMiddleWare, wrappedGetAllQuestions);

export default router;
