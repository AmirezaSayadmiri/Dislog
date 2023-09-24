import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { CustomRequestHandler, wrapperRequestHandler } from "../types/types";
import User from "../models/User";
import AppError from "../AppError";

const isAuthMiddleWare: CustomRequestHandler = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
        try {
            const decodedToken = jwt.verify(token, "supersupersecretkey") as {
                userId: number;
            };
            if (decodedToken) {
                const user = await User.findOne({ where: { id: decodedToken.userId, is_active: true } });
                if (user) {
                    req.userId = decodedToken.userId;
                    if (user.role === "admin") {
                        req.isAdmin = true;
                    }
                    return next();
                }
                return next(new AppError("unauthorized", 401));
            }
            return next(new AppError("unauthorized", 401));
        } catch (err) {
            console.log(err);
            return next(new AppError("unauthorized", 401));
        }
    }
    return next(new AppError("unauthorized", 401));
};

export default wrapperRequestHandler(isAuthMiddleWare);
