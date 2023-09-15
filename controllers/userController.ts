import { validationResult } from "express-validator";
import User from "../models/User";
import UserProfile from "../models/UserProfile";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import sendEmail from "../helpers/sendEmail";
import { Op } from "sequelize";
import { v4 } from "uuid";
import fs from "fs";
import path from "path";
import deleteFile from "../helpers/deleteFile";
import { CustomRequestHandler, wrapperRequestHandler } from "../types/types";

const SECRET_KEY = "supersupersecretkey";

const postRegister: CustomRequestHandler = async (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors);
  }
  try {
    const user = await User.create({ email });
    bcrypt.hash(password, 12, async function (err, hash: string) {
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

const postRegisterActivation: CustomRequestHandler = async (req, res, next) => {
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
        const accessToken = jwt.sign(
          { email: user.email, userId: user.id },
          SECRET_KEY,
          { expiresIn: "2min" }
        );
        const refreshToken = jwt.sign(
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

const postLogin: CustomRequestHandler = async (req, res, next) => {
  const { email_username, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors);
  }

  const user = await User.findOne({
    where: {
      [Op.or]: [{ email: email_username }, { username: email_username }],
    },
  }) as User;

  if (!user) {
    return res.status(400).json({ message: "اطلاعات وارد شده اشتباه است" });
  }

  if (!user.is_active) {
    return res.status(400).json({
      message:
        "حساب کاربری شما هنوز غیر فعال است. برای فعالسازی به ایمیل خود مراجعه کنید",
    });
  }

  bcrypt.compare(password, user.password!, async (err, result) => {
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

const postRefresh: CustomRequestHandler = (req, res, next) => {
  const { refresh } = req.body;
  if (!refresh) {
    return res.status(400).json({ message: "unvalid refresh token" });
  }

  jwt.verify(refresh, SECRET_KEY, (err:any, info:any) => {
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

const postResetPassword: CustomRequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors);
  }
  const { email } = req.body;
  try {
    const user = (await User.findOne({ where: { email } })) as User;

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

const postResetPasswordNew: CustomRequestHandler = async (req, res, next) => {
  const { reset_password_token, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors);
  }

  try {
    const user = (await User.findOne({
      where: { reset_password_token },
    })) as User;

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

const postResendEmailActivationCode: CustomRequestHandler = async (
  req,
  res,
  next
) => {
  const { email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors);
  }

  const user = (await User.findOne({ where: { email } })) as User;
  if (!user) {
    return res.status(400).json({ message: "ایمیل اشتباه است" });
  }

  user.activation_code = new Date().getTime().toString().slice(8);
  await user.save();
  try {
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
    return res
      .status(500)
      .json({ message: "خطایی رخ داد لطفا دوباره امتحان کنید" });
  }
};

const getProfile: CustomRequestHandler = async (req, res, next) => {
  const user = (await User.findOne({ where: { id: req.userId } })) as User;
  const profile = (await UserProfile.findOne({
    where: { userId: user.id },
  })) as UserProfile;
  if (user && profile) {
    return res.status(200).json({
      user,
      profile,
    });
  }
  return res.status(401).json({ message: "unauthorizated" });
};

const postProfileImage: CustomRequestHandler = async (req, res, next) => {
  const userId = req.userId;
  const image = req.file;

  if (!image) {
    return res
      .status(400)
      .json({ message: "لطفا عکس پروفایل خود را تعیین کنید" });
  }

  const profile = (await UserProfile.findOne({
    where: { userId },
  })) as UserProfile;
  if (profile.image) {
    deleteFile(profile.image);
  }

  profile.image = image.path;
  await profile.save();
  return res
    .status(200)
    .json({ message: "عکس پروفایل شما با موفقیت تغییر کرد" });
};

const deleteProfileImage: CustomRequestHandler = async (req, res, next) => {
  const userId = req.userId;

  const profile = (await UserProfile.findOne({
    where: { userId },
  })) as UserProfile;
  if (profile.image) {
    deleteFile(profile.image);
    profile.image = null;
    await profile.save();
    return res
      .status(200)
      .json({ message: "عکس پروفایل شما با موفقیت حذف شد" });
  }
  return res.status(400).json({ message: "شما عکس پروفایلی ندارید" });
};

const postProfile: CustomRequestHandler = async (req, res, next) => {
  const { bio, age, skills, experiences, gender } = req.body;

  const profile = (await UserProfile.findOne({
    where: { userId: req.userId },
  })) as UserProfile;

  if (typeof bio !== "undefined") {
    if (bio === "") {
      profile.bio = null;
    } else {
      profile.bio = bio;
    }
  }

  if (typeof age !== "undefined") {
    if (age === "") {
      profile.age = null;
    } else {
      profile.age = +age || null;
    }
  }

  if (typeof gender !== "undefined") {
    if (gender === "") {
      profile.gender = null;
    } else {
      profile.gender = gender;
    }
  }

  if (typeof skills !== "undefined") {
    if (skills === "") {
      profile.skills = null;
    } else {
      profile.skills = skills;
    }
  }

  if (typeof experiences !== "undefined") {
    if (experiences === "") {
      profile.experiences = null;
    } else {
      profile.experiences = experiences;
    }
  }

  await profile.save();

  return res.status(200).json({ message: "اطلاعات شما با موفقیت ویرایش شد" });
};

const postProfileNewPassword: CustomRequestHandler = async (req, res, next) => {
  const { password, confirm_password, new_password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors);
  }

  const userId = req.userId;
  const user = (await User.findOne({ where: { id: userId } })) as User;

  bcrypt.hash(new_password, 12, async (err, hash: string) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "خطایی رخ داد لطفا بعدا امتحان کنید" });
    }

    user.password = hash;
    await user.save();
    return res
      .status(200)
      .json({ message: "رمز عبور شما با موفقیت تغییر کرد" });
  });
};

export const wrappedPostRegister = wrapperRequestHandler(postRegister);
export const wrappedPostRegisterActivation = wrapperRequestHandler(
  postRegisterActivation
);
export const wrappedPostLogin = wrapperRequestHandler(postLogin);
export const wrappedPostRefresh = wrapperRequestHandler(postRefresh);
export const wrappedPostResetPassword =
  wrapperRequestHandler(postResetPassword);
export const wrappedPostResetPasswordNew =
  wrapperRequestHandler(postResetPasswordNew);
export const wrappedPostResendEmailActivationCode = wrapperRequestHandler(
  postResendEmailActivationCode
);
export const wrappedGetProfile = wrapperRequestHandler(getProfile);
export const wrappedPostProfile = wrapperRequestHandler(postProfile);
export const wrappedPostProfileImage = wrapperRequestHandler(postProfileImage);
export const wrappedDeleteProfileImage =
  wrapperRequestHandler(deleteProfileImage);
export const wrappedPostProfileNewPassword = wrapperRequestHandler(
  postProfileNewPassword
);