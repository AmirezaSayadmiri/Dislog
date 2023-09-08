const express = require("express");
const { body } = require("express-validator");
const User = require("../models/User");
const {
  register,
  registerActivation,
  login,
  refresh
} = require("../controllers/userController");
const isGuestMiddleWare = require("../middlewares/isGuestMiddleWare");

const router = express.Router();

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
  body("password").notEmpty().withMessage("لطفا رمز عبور خود را وارد کنید"),
  login
);

router.post('/refresh',refresh)

module.exports = router;
