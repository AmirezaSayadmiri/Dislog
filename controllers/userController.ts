import { validationResult } from "express-validator";
import User from "../models/User";
import UserProfile from "../models/UserProfile";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import sendEmail from "../helpers/sendEmail";
import { Op, Sequelize, where } from "sequelize";
import { v4 } from "uuid";
import fs from "fs";
import path from "path";
import deleteFile from "../helpers/deleteFile";
import { CustomRequestHandler, wrapperRequestHandler } from "../types/types";
import sequelize from "../database";
import Question from "../models/Question";
import Answer from "../models/Answer";
import Tag from "../models/Tag";
import AppError from "../AppError";

const SECRET_KEY = "supersupersecretkey";

const postRegister: CustomRequestHandler = async (req, res, next) => {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError("error", 400, errors.array()));
    }
    try {
        let user = (await User.findOne({ where: { email } })) as User;

        if (!user) {
            user = await User.create({ email });
        }

        bcrypt.hash(password, 12, async function (err, hash: string) {
            if (err) {
                return res.status(500).json({ message: "خطایی رخ داد لطفا دوباره امتحان کنید" });
            }
            user.username = "user" + new Date().getTime().toString().slice(8);
            user.activation_code = new Date().getTime().toString().slice(8);
            user.password = hash;
            await user.save();
        });
        await UserProfile.create({ UserId: user.id });
        const result = await sendEmail(
            email,
            "فعالسازی حساب کاربری دیسلاگ",
            `کد فعالسازی حساب شما در دیسلاگ ${user.activation_code}`,
            `کد فعالسازی حساب شما در دیسلاگ ${user.activation_code}`
        );
        return res.status(201).json({ message: "لطفا کد ارسال شده به ایمیل خود را وارد کنید" });
    } catch (err) {
        console.log(err);
        next(new AppError("خطایی رخ داد", 500));
    }
};

const postRegisterActivation: CustomRequestHandler = async (req, res, next) => {
    const { activation_code } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError("error", 400, errors.array()));
    }
    try {
        const user = await User.findOne({ where: { activation_code } });
        if (user) {
            user.activation_code = null;
            user.is_active = true;
            await user.save();
            const accessToken = jwt.sign({ email: user.email, userId: user.id }, SECRET_KEY, { expiresIn: "10m" });
            const refreshToken = jwt.sign({ email: user.email, userId: user.id }, SECRET_KEY, { expiresIn: "1d" });
            return res.status(200).json({
                userId: user.id,
                user,
                access: accessToken,
                refresh: refreshToken,
            });
        }
        next(new AppError("کد تایید وارد شده اشتباه میباشد", 400));
    } catch (err) {
        console.log(err);
        next(new AppError("خطایی رخ داد", 500));
    }
};

const postLogin: CustomRequestHandler = async (req, res, next) => {
    const { email_username, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError("error", 400, errors.array()));
    }

    const user = (await User.findOne({
        where: {
            [Op.or]: [{ email: email_username }, { username: email_username }],
        },
    })) as User;

    if (!user) {
        return next(new AppError("اطلاعات وارد شده اشتباه است", 400));
    }

    if (!user.is_active) {
        return next(new AppError("حساب کاربری شما هنوز غیر فعال است. برای فعالسازی به ایمیل خود مراجعه کنید", 400));
    }

    bcrypt.compare(password, user.password!, async (err, result) => {
        if (!result) {
            return next(new AppError("اطلاعات وارد شده اشتباه است", 400));
        }
        const accessToken = jwt.sign({ email: user.email, userId: user.id }, SECRET_KEY, { expiresIn: "10m" });
        const refreshToken = jwt.sign({ email: user.email, userId: user.id }, SECRET_KEY, { expiresIn: "1d" });
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
        return next(new AppError("unvalid refresh token", 400));
    }

    jwt.verify(refresh, SECRET_KEY, (err: any, info: any) => {
        if (err) {
            return next(new AppError("expired", 401));
        }
        const access = jwt.sign({ email: info.email, userId: info.userId }, SECRET_KEY, { expiresIn: "10m" });
        return res.status(200).json({ access: access });
    });
};

const postResetPassword: CustomRequestHandler = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError("error", 400, errors.array()));
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
        next(new AppError("خطایی رخ داد", 500));
    }
};

const postResetPasswordNew: CustomRequestHandler = async (req, res, next) => {
    const { reset_password_token, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError("error", 400, errors.array()));
    }

    try {
        const user = (await User.findOne({
            where: { reset_password_token },
        })) as User;

        const hashedPassword = bcrypt.hash(password, 12, async (err, hash) => {
            if (err) {
                console.log(err);
                return next(new AppError("خطایی رخ داد", 500));
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
        return next(new AppError("خطایی رخ داد", 500));
    }
};

const postResendEmailActivationCode: CustomRequestHandler = async (req, res, next) => {
    const { email } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError("error", 400, errors.array()));
    }

    const user = (await User.findOne({ where: { email } })) as User;

    if (!user) {
        return next(new AppError("ایمیل اشتباه است", 400));
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
        return res.status(201).json({ message: "لطفا کد ارسال شده به ایمیل خود را وارد کنید" });
    } catch (err) {
        console.log(err);
        return next(new AppError("خطایی رخ داد", 500));
    }
};

const getProfile: CustomRequestHandler = async (req, res, next) => {
    const user = (await User.findOne({ where: { id: req.userId } })) as User;
    const profile = (await UserProfile.findOne({
        where: { UserId: user.id },
        include: [
            { model: UserProfile, as: "Follower", include: [{ model: User, as: "User" }] },
            { model: UserProfile, as: "Following", include: [{ model: User, as: "User" }] },
        ],
    })) as UserProfile;

    if (user && profile) {
        return res.status(200).json({
            user,
            profile,
        });
    }

    next(new AppError("unauthorized", 401));
};

const postProfileImage: CustomRequestHandler = async (req, res, next) => {
    const userId = req.userId;
    const image = req.file;

    if (!image) {
        return next(new AppError("لطفا عکس پروفایل خود را تعیین کنید", 400));
    }

    const profile = (await UserProfile.findOne({
        where: { UserId: userId },
    })) as UserProfile;

    if (profile.image) {
        deleteFile(profile.image);
    }

    profile.image = image.path;
    await profile.save();

    return res.status(200).json({ message: "عکس پروفایل شما با موفقیت تغییر کرد" });
};

const deleteProfileImage: CustomRequestHandler = async (req, res, next) => {
    const userId = req.userId;

    const profile = (await UserProfile.findOne({
        where: { UserId: userId },
    })) as UserProfile;

    if (profile.image) {
        deleteFile(profile.image);
        profile.image = null;
        await profile.save();
        return res.status(200).json({ message: "عکس پروفایل شما با موفقیت حذف شد" });
    }

    return next(new AppError("شما عکس پروفایلی ندارید", 400));
};

const postProfile: CustomRequestHandler = async (req, res, next) => {
    const { bio, age, skills, experiences, gender } = req.body;

    const profile = (await UserProfile.findOne({
        where: { UserId: req.userId },
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
    const { new_password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError("error", 400, errors.array()));
    }

    const userId = req.userId;
    const user = (await User.findOne({ where: { id: userId } })) as User;

    bcrypt.hash(new_password, 12, async (err, hash: string) => {
        if (err) {
            console.log(err);
            next(new AppError("خطایی رخ داد", 500));
        }

        user.password = hash;
        await user.save();
        return res.status(200).json({ message: "رمز عبور شما با موفقیت تغییر کرد" });
    });
};

const getUser: CustomRequestHandler = async (req, res, next) => {
    const username = req.params.username;

    const targetUser = await User.findOne({ where: { username } });
    if (!targetUser) {
        return next();
    }

    const targetProfile = (await UserProfile.findOne({
        where: { UserId: targetUser.id },
        include: { model: UserProfile, as: "Follower" },
    })) as UserProfile;

    return res.status(200).json({
        user: targetUser,
        profile: targetProfile,
    });
};

const postFollowUser: CustomRequestHandler = async (req, res, next) => {
    const username = req.params.username;

    const targetUser = await User.findOne({ where: { username } });

    if (!targetUser || !targetUser.is_active) {
        return next();
    }

    const targetUserProfile = (await UserProfile.findOne({
        where: { UserId: targetUser.id },
    })) as UserProfile;
    const profile = (await UserProfile.findOne({
        where: { UserId: req.userId },
    })) as UserProfile;

    if (targetUser.id == req.userId) {
        return next();
    }

    const hasFollowed = await profile.hasFollowing(targetUserProfile);

    if (!hasFollowed) {
        await profile.addFollowing(targetUserProfile!);
        return res.status(200).json({ message: "کاربر مورد نظر دنبال شد" });
    }

    return next(new AppError("شما قبلا کاربر مورد نظر را دنبال کرده اید", 400));
};

const postUnFollowUser: CustomRequestHandler = async (req, res, next) => {
    const username = req.params.username;

    const targetUser = await User.findOne({ where: { username } });

    if (!targetUser || !targetUser.is_active) {
        return next();
    }

    const targetUserProfile = (await UserProfile.findOne({
        where: { UserId: targetUser.id },
    })) as UserProfile;
    const profile = (await UserProfile.findOne({
        where: { UserId: req.userId },
    })) as UserProfile;

    const hasFollowed = await profile.hasFollowing(targetUserProfile);

    if (hasFollowed) {
        await profile.removeFollowing(targetUserProfile!);
        return res.status(200).json({ message: "کاربر مورد نظر با موفقیت آنفالو شد" });
    }

    return next(new AppError("شما هنوز کاربر مورد نظر را دنبال نکردید", 400));
};

const postProfileChangeUsername: CustomRequestHandler = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError("error", 400, errors.array()));
    }

    const { username } = req.body;

    const user = (await User.findOne({ where: { id: req.userId } })) as User;
    user.username = username;
    await user.save();

    return res.status(200).json({ message: "نام کاربری شما با موفقیت تغییر کرد" });
};

const getBestUsers: CustomRequestHandler = async (req, res, next) => {
    const users = await User.findAll({
        include: [{ model: UserProfile, where: { score: { [Op.gt]: 0 } } }],
        order: [[sequelize.literal("UserProfile.score"), "DESC"]],
        limit: 4,
    });

    return res.status(200).json({ users });
};

const getLikedQuestions: CustomRequestHandler = async (req, res, next) => {
    const user = (await User.findByPk(req.userId)) as User;

    const questions = await user.getQlike({ include: [{ model: User, include: [{ model: UserProfile }] }] });

    return res.status(200).json({ questions });
};

const getDislikedQuestions: CustomRequestHandler = async (req, res, next) => {
    const user = (await User.findByPk(req.userId)) as User;

    const questions = await user.getQDlike({ include: [{ model: User, include: [{ model: UserProfile }] }] });

    return res.status(200).json({ questions });
};

const getViewedQuestions: CustomRequestHandler = async (req, res, next) => {
    const user = (await User.findByPk(req.userId)) as User;

    const questions = await user.getQview({ include: [{ model: User, include: [{ model: UserProfile }] }] });

    return res.status(200).json({ questions });
};

const getUsers: CustomRequestHandler = async (req, res, next) => {
    const users = await User.findAll({ include: { model: UserProfile, as: "UserProfile" } });
    return res.status(200).json({ users });
};

const deleteUser: CustomRequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findOne({ where: { id }, include: { model: UserProfile, as: "UserProfile" } });

    if (!user) {
        return next();
    }

    if (user.UserProfile.image) {
        deleteFile(user.UserProfile.image);
    }

    await user.destroy();

    return res.status(200).json({ message: "کاربر حذف شد" });
};

const postActiveUser: CustomRequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findOne({ where: { id }, include: { model: UserProfile, as: "UserProfile" } });

    if (!user) {
        return next();
    }

    user.is_active = !user.is_active;
    await user.save();

    return res.status(200).json({ message: `کاربر ${user.is_active ? "فعال" : "غیر فعال"} شد` });
};

const postGiveAccessUser: CustomRequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findOne({
        where: { id },
        include: { model: UserProfile, as: "UserProfile" },
    });

    if (!user) {
        return next();
    }

    user.role = user.role === "admin" ? "ordinary" : "admin";
    await user.save();

    return res.status(200).json({ message: "عملیات انجام شد" });
};

const getUserQuestions: CustomRequestHandler = async (req, res, next) => {
    const questions = await Question.findAll({ where: { UserId: +req.userId! }, include: [{ model: Tag, as: "Tag" }] });

    return res.status(200).json({ questions });
};

const getUserAnswers: CustomRequestHandler = async (req, res, next) => {
    const answers = await Answer.findAll({
        where: { UserId: +req.userId! },
        include: { model: Question, as: "Question" },
    });

    return res.status(200).json({ answers });
};

export const wrappedPostRegister = wrapperRequestHandler(postRegister);
export const wrappedPostRegisterActivation = wrapperRequestHandler(postRegisterActivation);
export const wrappedPostLogin = wrapperRequestHandler(postLogin);
export const wrappedPostRefresh = wrapperRequestHandler(postRefresh);
export const wrappedPostResetPassword = wrapperRequestHandler(postResetPassword);
export const wrappedPostResetPasswordNew = wrapperRequestHandler(postResetPasswordNew);
export const wrappedPostResendEmailActivationCode = wrapperRequestHandler(postResendEmailActivationCode);
export const wrappedGetProfile = wrapperRequestHandler(getProfile);
export const wrappedPostProfile = wrapperRequestHandler(postProfile);
export const wrappedPostProfileImage = wrapperRequestHandler(postProfileImage);
export const wrappedDeleteProfileImage = wrapperRequestHandler(deleteProfileImage);
export const wrappedPostProfileNewPassword = wrapperRequestHandler(postProfileNewPassword);
export const wrappedGetUser = wrapperRequestHandler(getUser);
export const wrappedPostFollowUser = wrapperRequestHandler(postFollowUser);
export const wrappedPostUnFollowUser = wrapperRequestHandler(postUnFollowUser);
export const wrappedPostProfileChangeUsername = wrapperRequestHandler(postProfileChangeUsername);
export const wrappedGetBestUsers = wrapperRequestHandler(getBestUsers);
export const wrappedGetLikedQuestions = wrapperRequestHandler(getLikedQuestions);
export const wrappedGetDislikedQuestions = wrapperRequestHandler(getDislikedQuestions);
export const wrappedGetViewedQuestions = wrapperRequestHandler(getViewedQuestions);
export const wrappedGetUsers = wrapperRequestHandler(getUsers);
export const wrappedDeleteUser = wrapperRequestHandler(deleteUser);
export const wrappedPostActiveUser = wrapperRequestHandler(postActiveUser);
export const wrappedPostGiveAccessUser = wrapperRequestHandler(postGiveAccessUser);
export const wrappedGetUserQuestions = wrapperRequestHandler(getUserQuestions);
export const wrappedGetUserAnswers = wrapperRequestHandler(getUserAnswers);
