const { validationResult } = require("express-validator");
const User = require("../models/User");
const UserProfile = require("../models/UserProfile");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmail = require("../helpers/sendEmail");
const { Op } = require("sequelize");
const { v4 } = require("uuid");

const SECRET_KEY = "supersupersecretkey";

const register = async (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors);
  }
  try {
    const user = await User.create({ email });
    bcrypt.hash(password, 12, async function (err, hash) {
      if (err) {
        return res
          .status(500)
          .json({ message: "خطایی رخ داد لطفا دوباره امتحان کنید" });
      }
      user.password = hash;
      await user.save();
    });
    await UserProfile.create({ userId: user.id });
    const result = await sendEmail(
      email,
      "فعالسازی حساب کاربری دیسلاگ",
      `کد فعالسازی حساب شما در دیسلاگ ${user.activation_code}`,
      `کد فعالسازی حساب شما در دیسلاگ ${user.activation_code}`
    );
    return res
      .status(201)
      .json({ message: "لطفا کد ارسال شده به ایمیل خود را وارد کنید" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "خطایی رخ داد لطفا دوباره امتحان کنید" });
  }
};

const registerActivation = async (req, res, next) => {
  const { activation_code } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json(errors);
  } else {
    try {
      const user = await User.findOne({ where: { activation_code } });
      if (user) {
        user.activation_code = null;
        user.is_active = true;
        await user.save();
        const accessToken = await jwt.sign(
          { email: user.email, userId: user.id },
          SECRET_KEY,
          { expiresIn: "2min" }
        );
        const refreshToken = await jwt.sign(
          { email: user.email, userId: user.id },
          SECRET_KEY,
          { expiresIn: "1d" }
        );
        return res.status(200).json({
          userId: user.id,
          user,
          access: accessToken,
          refresh: refreshToken,
        });
      }
      return res
        .status(401)
        .json({ message: "کد تایید وارد شده اشتباه میباشد" });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "خطایی رخ داد لطفا دوباره امتحان کنید" });
    }
  }
};

const login = async (req, res, next) => {
  const { email_username, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors);
  }

  const user = await User.findOne({
    where: {
      [Op.or]: [{ email: email_username }, { username: email_username }],
    },
  });

  if (!user) {
    return res.status(400).json({ message: "اطلاعات وارد شده اشتباه است" });
  }

  if (!user.is_active) {
    return res.status(400).json({
      message:
        "حساب کاربری شما هنوز غیر فعال است. برای فعالسازی به ایمیل خود مراجعه کنید",
    });
  }

  bcrypt.compare(password, user.password, async (err, result) => {
    if (!result) {
      return res.status(400).json({ message: "اطلاعات وارد شده اشتباه است" });
    }
    const accessToken = await jwt.sign(
      { email: user.email, userId: user.id },
      SECRET_KEY,
      { expiresIn: "10m" }
    );
    const refreshToken = await jwt.sign(
      { email: user.email, userId: user.id },
      SECRET_KEY,
      { expiresIn: "1d" }
    );
    return res.status(200).json({
      userId: user.id,
      user,
      access: accessToken,
      refresh: refreshToken,
    });
  });
};

const refresh = (req, res, next) => {
  const { refresh } = req.body;
  if (!refresh) {
    return res.status(400).json({ message: "unvalid refresh token" });
  }

  jwt.verify(refresh, SECRET_KEY, (err, info) => {
    if (err) {
      return res.status(401).json({ message: "ex" });
    }
    const access = jwt.sign(
      { email: info.email, userId: info.userId },
      SECRET_KEY,
      { expiresIn: "10m" }
    );
    return res.status(200).json({ access: access });
  });
};

const reset_password = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors);
  }
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });

    user.reset_password_token = v4();
    await user.save();
    const result = await sendEmail(
      email,
      "بازیابی رمز عبور",
      `لینک بازیابی رمز عبور <a href="http://localhost:5173/reset-password/new/${user.reset_password_token}">link</a>`,
      `لینک بازیابی رمز عبور <a href="http://localhost:5173/reset-password/new/${user.reset_password_token}">link</a>`
    );
    return res.status(200).json({
      message: "لینک بازیابی رمز عبور با موفقیت به ایمیل شما ارسال شد",
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "خطایی رخ داد لطفا دوباره امتحان کنید" });
  }
};

const reset_password_new = async (req, res, next) => {
  const { reset_password_token, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors);
  }
  
  try {
    const user = await User.findOne({
      where: { reset_password_token },
    });

    const hashedPassword = bcrypt.hash(password, 12, async (err, hash) => {
      if (err) {
        return res.status(500).json({
          message: "خطایی رخ داد لطفا دوباره امتحان کنید",
        });
      }
      user.reset_password_token = null;
      user.password = hash;
      await user.save();
      return res.status(200).json({
        message: "رمز عبور شما با موفقیت تغییر کرد",
      });
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "خطایی رخ داد لطفا دوباره امتحان کنید" });
  }
};

module.exports.register = register;
module.exports.registerActivation = registerActivation;
module.exports.login = login;
module.exports.refresh = refresh;
module.exports.reset_password = reset_password;
module.exports.reset_password_new = reset_password_new;
