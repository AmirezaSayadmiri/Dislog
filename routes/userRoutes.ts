import express from "express";
import { body } from "express-validator";
import bcrypt from "bcryptjs";
import User from "../models/User";

import { v4 } from "uuid";
import sendEmail from "../helpers/sendEmail";
import multer from "multer";
import {
  userProfileStorage,
  userProfileFileFilter,
} from "../multer/userProfile";
import isAuthMiddleWare from "../middlewares/isAuthMiddleWare";
import isGuestMiddleWare from "../middlewares/isGuestMiddleWare";
import {
  wrappedDeleteProfileImage,
  wrappedGetProfile,
  wrappedPostLogin,
  wrappedPostProfile,
  wrappedPostProfileImage,
  wrappedPostProfileNewPassword,
  wrappedPostRefresh,
  wrappedPostRegister,
  wrappedPostRegisterActivation,
  wrappedPostResendEmailActivationCode,
  wrappedPostResetPassword,
  wrappedPostResetPasswordNew,
} from "../controllers/userController";

const router = express.Router();

router.post("/", isAuthMiddleWare, (req, res, next) => {
  return res.status(200).json({ message: "success" });
});

router.post(
  "/register",
  isGuestMiddleWare,
  body("email")
    .notEmpty()
    .withMessage("لطفا ایمیل خود را وارد کنید")
    .isEmail()
    .withMessage("ایمیل وارد شده معتبر نیست")
    .custom(async (value) => {
      const user = await User.findOne({ where: { email: value } });
      if (user) {
        throw new Error("ایمیل وارد شده از قبل وجود دارد");
      }
    }),
  body("password").notEmpty().withMessage("لطفا رمز عبور خود را وارد کنید"),
  body("confirm_password")
    .notEmpty()
    .withMessage("لطفا تاییدیه رمز عبور خود را وارد کنید")
    .custom(async (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("رمز عبور ها مطابقت ندارند");
      }
    }),
  wrappedPostRegister
);

router.post(
  "/register/activation",
  isGuestMiddleWare,
  body("activation_code")
    .notEmpty()
    .withMessage("لطفا کد تایید شده را وارد کنید"),
  wrappedPostRegisterActivation
);

router.post(
  "/login",
  isGuestMiddleWare,
  body("email_username")
    .notEmpty()
    .withMessage("لطفا نام کاربری یا ایمیل خود را وارد کنید"),
  body("password").notEmpty().withMessage("لطفا رمز عبور خود را وارد کنید"),
  wrappedPostLogin
);

router.post("/refresh", wrappedPostRefresh);

router.post(
  "/reset-password",
  isGuestMiddleWare,
  body("email")
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
  body("password").notEmpty().withMessage("لطفا رمز عبور جدید را وارد کنید"),
  body("reset_password_token")
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

router.delete(
  "/profile/delete-user-image/",
  isAuthMiddleWare,
  wrappedDeleteProfileImage
);

router.post("/profile", isAuthMiddleWare, wrappedPostProfile);

router.post(
  "/profile/new-password",
  isAuthMiddleWare,
  body("password")
    .notEmpty()
    .withMessage("لطفا رمز عبور فعلی خود را وارد کنید")
    .custom(async (value, { req }) => {
      const userId = req.userId;
      const user = await User.findOne({ where: { id: userId } }) as User;
      const result = bcrypt.compareSync(value, user.password!);
      if (!result) {
        throw new Error("رمز عبور فعلی شما اشتباه است");
      }
    }),
  body("new_password")
    .notEmpty()
    .withMessage("لطفا رمز عبور جدید خود را وارد کنید"),
  body("confirm_password")
    .notEmpty()
    .withMessage("لطفا تاییدیه رمز عبور جدید خود را وارد کنید")
    .custom(async (value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error("رمز عبور های جدید با هم مطابقت ندارند");
      }
    }),
  wrappedPostProfileNewPassword
);

export default router;
