import express from "express";
import { body, param } from "express-validator";
import bcrypt from "bcryptjs";
import User from "../models/User";
import multer from "multer";
import { userProfileStorage, userProfileFileFilter } from "../multer/userProfile";
import isAuthMiddleWare from "../middlewares/isAuthMiddleWare";
import isGuestMiddleWare from "../middlewares/isGuestMiddleWare";
import {
    wrappedDeleteProfileImage,
    wrappedDeleteUser,
    wrappedGetBestUsers,
    wrappedGetDislikedQuestions,
    wrappedGetLikedQuestions,
    wrappedGetProfile,
    wrappedGetUser,
    wrappedGetUserAnswers,
    wrappedGetUserQuestions,
    wrappedGetUsers,
    wrappedGetViewedQuestions,
    wrappedPostActiveUser,
    wrappedPostFollowUser,
    wrappedPostGiveAccessUser,
    wrappedPostLogin,
    wrappedPostProfile,
    wrappedPostProfileChangeUsername,
    wrappedPostProfileImage,
    wrappedPostProfileNewPassword,
    wrappedPostRefresh,
    wrappedPostRegister,
    wrappedPostRegisterActivation,
    wrappedPostResendEmailActivationCode,
    wrappedPostResetPassword,
    wrappedPostResetPasswordNew,
    wrappedPostUnFollowUser,
} from "../controllers/userController";
import isAdminMiddleWare from "../middlewares/isAdminMiddleWare";

const router = express.Router();

router.post("/", isAuthMiddleWare, (req, res, next) => {
    return res.status(200).json({ message: "success" });
});

router.post(
    "/register",
    isGuestMiddleWare,
    body("email")
        .trim()
        .notEmpty()
        .withMessage("لطفا ایمیل خود را وارد کنید")
        .isEmail()
        .withMessage("ایمیل وارد شده معتبر نیست")
        .custom(async (value) => {
            const user = await User.findOne({ where: { email: value } });
            if (user && user.is_active) {
                throw new Error("ایمیل وارد شده از قبل وجود دارد");
            }
        }),
    body("password").trim().notEmpty().withMessage("لطفا رمز عبور خود را وارد کنید"),
    body("confirm_password")
        .trim()
        .notEmpty()
        .withMessage("لطفا تاییدیه رمز عبور خود را وارد کنید")
        .custom(async (value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("رمز عبور ها مطابقت ندارند");
            }
        })
        .trim(),
    wrappedPostRegister
);

router.post(
    "/register/activation",
    isGuestMiddleWare,
    body("activation_code").trim().notEmpty().withMessage("لطفا کد تایید شده را وارد کنید"),
    wrappedPostRegisterActivation
);

router.post(
    "/login",
    isGuestMiddleWare,
    body("email_username").trim().notEmpty().withMessage("لطفا نام کاربری یا ایمیل خود را وارد کنید"),
    body("password").trim().notEmpty().withMessage("لطفا رمز عبور خود را وارد کنید"),
    wrappedPostLogin
);

router.post("/refresh", wrappedPostRefresh);

router.post(
    "/reset-password",
    isGuestMiddleWare,
    body("email")
        .trim()
        .notEmpty()
        .withMessage("لطفا ایمیل خود را وارد کنید")
        .isEmail()
        .withMessage("ایمیل نامعتبر است")
        .custom(async (value) => {
            const user = await User.findOne({ where: { email: value } });
            if (!user) {
                throw new Error("ایمیل وارد شده اشتباه است");
            }
        }),
    wrappedPostResetPassword
);

router.post(
    "/reset-password/new",
    isGuestMiddleWare,
    body("password").trim().notEmpty().withMessage("لطفا رمز عبور جدید را وارد کنید"),
    body("reset_password_token")
        .trim()
        .notEmpty()
        .withMessage("لطفا توکن را وارد کنید")
        .custom(async (value) => {
            const user = await User.findOne({
                where: { reset_password_token: value },
            });
            if (!user) {
                throw new Error("توکن وارد شده اشتباه است");
            }
        }),
    wrappedPostResetPasswordNew
);

router.post(
    "/resend-email-activation-code",
    isGuestMiddleWare,
    body("email")
        .trim()
        .notEmpty()
        .withMessage("لطفا ایمیل خود را وارد کنید")
        .isEmail()
        .withMessage("ایمیل نامعتبر است"),
    wrappedPostResendEmailActivationCode
);

router.get("/profile", isAuthMiddleWare, wrappedGetProfile);

router.post(
    "/profile/set-user-image",
    isAuthMiddleWare,
    multer({
        storage: userProfileStorage,
        fileFilter: userProfileFileFilter,
    }).single("image"),
    wrappedPostProfileImage
);

router.delete("/profile/delete-user-image/", isAuthMiddleWare, wrappedDeleteProfileImage);

router.post("/profile", isAuthMiddleWare, wrappedPostProfile);

router.post(
    "/profile/new-password",
    isAuthMiddleWare,
    body("password")
        .trim()
        .notEmpty()
        .withMessage("لطفا رمز عبور فعلی خود را وارد کنید")
        .custom(async (value, { req }) => {
            const userId = req.userId;
            const user = (await User.findOne({ where: { id: userId } })) as User;
            const result = bcrypt.compareSync(value, user.password!);
            if (!result) {
                throw new Error("رمز عبور فعلی شما اشتباه است");
            }
        }),
    body("new_password").trim().notEmpty().withMessage("لطفا رمز عبور جدید خود را وارد کنید"),
    body("confirm_password")
        .trim()
        .notEmpty()
        .withMessage("لطفا تاییدیه رمز عبور جدید خود را وارد کنید")
        .custom(async (value, { req }) => {
            if (value !== req.body.new_password) {
                throw new Error("رمز عبور های جدید با هم مطابقت ندارند");
            }
        }),
    wrappedPostProfileNewPassword
);

router.get("/users", isAuthMiddleWare, isAdminMiddleWare, wrappedGetUsers);
router.post("/users/:id/active", isAuthMiddleWare, isAdminMiddleWare, wrappedPostActiveUser);
router.post("/users/:id/access", isAuthMiddleWare, isAdminMiddleWare, wrappedPostGiveAccessUser);
router.delete("/users/:id", isAuthMiddleWare, isAdminMiddleWare, wrappedDeleteUser);

router.get("/users/:username", wrappedGetUser);
router.post("/users/:username/follow", isAuthMiddleWare, wrappedPostFollowUser);
router.post("/users/:username/unfollow", isAuthMiddleWare, wrappedPostUnFollowUser);

router.post(
    "/profile/change-username",
    isAuthMiddleWare,
    body("username")
        .trim()
        .notEmpty()
        .withMessage("لطفا نام کاربری جدید خود را وارد کنید")
        .custom(async (value, { req }) => {
            const user = await User.findOne({ where: { username: value } });

            if (user) {
                if (user.id == req.userId) {
                    throw new Error("نام کاربری همان قبلی است");
                }
                throw new Error("نام کاربری از قبل وجود دارد");
            }
        }),
    wrappedPostProfileChangeUsername
);

router.get("/users/best", wrappedGetBestUsers);

router.get("/profile/liked-questions", isAuthMiddleWare, wrappedGetLikedQuestions);
router.get("/profile/disliked-questions", isAuthMiddleWare, wrappedGetDislikedQuestions);
router.get("/profile/viewed-questions", isAuthMiddleWare, wrappedGetViewedQuestions);
router.get("/profile/questions", isAuthMiddleWare, wrappedGetUserQuestions);
router.get("/profile/answers", isAuthMiddleWare, wrappedGetUserAnswers);

export default router;
