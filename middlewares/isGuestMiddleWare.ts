import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { CustomRequestHandler, wrapperRequestHandler } from "../types/types";

const isGuestMiddleWare: CustomRequestHandler = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
        try {
            jwt.verify(token, "supersupersecretkey", (isValidToken) => {
                if (isValidToken) {
                    return res.status(401).json({ message: "you are authenticated" });
                }
                return next();
            });
        } catch (err) {
            return res.status(500).json({ message: "خطایی رخ داد لطفا دوباره امتحان کنید" });
        }
    }
    next();
};

export default wrapperRequestHandler(isGuestMiddleWare);
