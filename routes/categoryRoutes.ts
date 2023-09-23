import express from "express";
import {
    wrappedDeleteCategory,
    wrappedGetCategories,
    wrappedGetCategory,
    wrappedGetCategoryQuestions,
    wrappedPostCategory,
    wrappedPutCategory,
} from "../controllers/categoryControllers";
import isAuthMiddleWare from "../middlewares/isAuthMiddleWare";
import isAdminMiddleWare from "../middlewares/isAdminMiddleWare";
import { body } from "express-validator";
import Category from "../models/Category";

const router = express.Router();

router.get("/categories", wrappedGetCategories);

router.post(
    "/categories",
    isAuthMiddleWare,
    isAdminMiddleWare,
    body("name")
        .trim()
        .notEmpty()
        .withMessage("لطفا نام دسته بندی را وارد کنید")
        .custom(async (value) => {
            const category = await Category.findOne({ where: { name: value } });
            if (category) {
                throw new Error("دسته بندی از قبل وجود دارد");
            }
        }),
    wrappedPostCategory
);
router.get("/categories/:id", wrappedGetCategory);
router.put(
    "/categories/:id",
    isAuthMiddleWare,
    isAdminMiddleWare,
    body("name")
        .trim()
        .notEmpty()
        .withMessage("لطفا نام دسته بندی را وارد کنید")
        .custom(async (value) => {
            const category = await Category.findOne({ where: { name: value } });
            if (category) {
                throw new Error("دسته بندی از قبل وجود دارد");
            }
        }),
    wrappedPutCategory
);
router.delete("/categories/:id", isAuthMiddleWare, isAdminMiddleWare, wrappedDeleteCategory);

router.get("/categories/:id/questions", wrappedGetCategoryQuestions)


export default router;
