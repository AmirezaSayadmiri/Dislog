const express = require("express");
const { body } = require("express-validator");
const User = require("../models/User");
const {
  register,
  registerActivation,
  login,
  refresh,
  reset_password_new,
  reset_password,
} = require("../controllers/userController");
const isGuestMiddleWare = require("../middlewares/isGuestMiddleWare");
const isAuthMiddleWare = require("../middlewares/isAuthMiddleWare");
const { v4 } = require("uuid");
const sendEmail = require("../helpers/sendEmail");

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
  register
);

router.post(
  "/register/activation",
  isGuestMiddleWare,
  body("activation_code")
    .notEmpty()
    .withMessage("لطفا کد تایید شده را وارد کنید"),
  registerActivation
);

router.post(
  "/login",
  isGuestMiddleWare,
  body("email_username")
    .notEmpty()
    .withMessage("لطفا نام کاربری یا ایمیل خود را وارد کنید"),
  body("password").notEmpty().withMessage("لطفا رمز عبور خود را وارد کنید"),
  login
);

router.post("/refresh", refresh);

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
    reset_password
);

router.post(
  "/reset-password/new",
  isGuestMiddleWare,
  body("password")
  .notEmpty().withMessage("لطفا رمز عبور جدید را وارد کنید"),   
  body("reset_password_token")
    .notEmpty().withMessage("لطفا توکن را وارد کنید")
    .custom(async (value) => {
      const user = await User.findOne({
        where: { reset_password_token: value },
      });
      if (!user) {
        throw new Error("توکن وارد شده اشتباه است");
      }
    }),
    reset_password_new
);

module.exports = router;
