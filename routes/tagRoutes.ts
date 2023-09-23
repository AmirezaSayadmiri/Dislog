import express from "express";
import { wrappedDeleteTag, wrappedGetTag, wrappedGetTagQuestions, wrappedGetTags, wrappedPostTag, wrappedPutTag } from "../controllers/tagControllers";
import isAuthMiddleWare from "../middlewares/isAuthMiddleWare";
import isAdminMiddleWare from "../middlewares/isAdminMiddleWare";
import Tag from "../models/Tag";
import { body } from "express-validator";

const router = express.Router();

router.get("/tags", wrappedGetTags);

router.post(
    "/tags",
    isAuthMiddleWare,
    isAdminMiddleWare,
    body("name")
        .trim()
        .notEmpty()
        .withMessage("لطفا نام تگ را وارد کنید")
        .custom(async (value) => {
            const tag = await Tag.findOne({ where: { name: value } });
            if (tag) {
                throw new Error("تگ از قبل وجود دارد");
            }
        }),
    wrappedPostTag
);

router.get("/tags/:id", wrappedGetTag);

router.put(
    "/tags/:id",
    isAuthMiddleWare,
    isAdminMiddleWare,
    body("name")
        .trim()
        .notEmpty()
        .withMessage("لطفا نام تگ را وارد کنید")
        .custom(async (value) => {
            const tag = await Tag.findOne({ where: { name: value } });
            if (tag) {
                throw new Error("تگ از قبل وجود دارد");
            }
        }),
    wrappedPutTag
);
router.delete("/tags/:id", isAuthMiddleWare, isAdminMiddleWare, wrappedDeleteTag);

router.get("/tags/:id/questions", wrappedGetTagQuestions);

export default router;
