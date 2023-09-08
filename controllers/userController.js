const { validationResult } = require("express-validator");
const User = require("../models/User");
const UserProfile = require("../models/UserProfile");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmail = require("../helpers/sendEmail");
const { Op } = require("sequelize");

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
  const { username, email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (!username && !email) {
      return res.status(400).json({
        errors: { errors },
        errors2: "لطفا ایمیل یا نام کاربری خود را وارد کنید",
      });
    }
    return res.status(400).json(errors);
  }
  if (!username && !email) {
    return res.status(400).json({
      errors: { errors },
      errors2: "لطفا ایمیل یا نام کاربری خود را وارد کنید",
    });
  }
  const user = await User.findOne({
    where: {
      [Op.or]: [{ email: email || null }, { username: username || null }],
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
      { expiresIn: "5min" }
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
    const access = jwt.sign({ email: info.email, userId: info.userId }, SECRET_KEY,{expiresIn:'2min'});
    return res.status(200).json({access:access})
  });
};

module.exports.register = register;
module.exports.registerActivation = registerActivation;
module.exports.login = login;
module.exports.refresh = refresh;
