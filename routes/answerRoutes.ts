import express from "express";
import { body, param } from "express-validator";
import isAuthMiddleWare from "../middlewares/isAuthMiddleWare";
import multer from "multer";
import { answerImageFileFilter, answerImageStorage } from "../multer/answerImage";
import {
    wrappedDeleteAnswer,
    wrappedDeleteAnswerImage,
    wrappedGetAnswers,
    wrappedPostActiveAnswer,
    wrappedPostAnswer,
    wrappedPostAnswerDislike,
    wrappedPostAnswerImage,
    wrappedPostAnswerLike,
    wrappedPostAnswerSelect,
    wrappedPutAnswer,
} from "../controllers/answerControllers";
import Question from "../models/Question";
import Answer from "../models/Answer";
import isAdminMiddleWare from "../middlewares/isAdminMiddleWare";

const router = express.Router();
router.post(
    "/answers",
    isAuthMiddleWare,
    body("body").trim().notEmpty().withMessage("لطفا متن جواب خود را وارد کنید"),

    body("QuestionId")
        .trim()
        .notEmpty()
        .withMessage("لطفا دسته بندی سوال خود را وارد کنید")
        .custom(async (value) => {
            const question = await Question.findOne({ where: { id: value, is_closed: false, is_active: true } });
            if (!question) {
                throw new Error("سوال مورد نظر برای پاسخ اشتباه میباشد");
            }
        }),
    wrappedPostAnswer
);

router.post(
    "/answers/:answerId/image",
    isAuthMiddleWare,
    multer({ storage: answerImageStorage, fileFilter: answerImageFileFilter }).single("image"),
    wrappedPostAnswerImage
);

router.delete(
    "/answers/:answerId/image",
    isAuthMiddleWare,
    wrappedDeleteAnswerImage
);

router.post("/answers/:id/like", isAuthMiddleWare, wrappedPostAnswerLike);
router.post("/answers/:id/dislike", isAuthMiddleWare, wrappedPostAnswerDislike);
router.post("/answers/:id/select", isAuthMiddleWare, wrappedPostAnswerSelect);

router.get("/answers", isAuthMiddleWare, isAdminMiddleWare, wrappedGetAnswers);
router.put("/answers/:id", isAuthMiddleWare, body("body").notEmpty().withMessage("لطفا متن پاسخ را وارد کنید"), wrappedPutAnswer);
router.delete("/answers/:id", isAuthMiddleWare,  wrappedDeleteAnswer);
router.post("/answers/:id/active", isAuthMiddleWare,  wrappedPostActiveAnswer);

export default router;
