import AppError from "../AppError";
import { CustomRequestHandler, wrapperRequestHandler } from "../types/types";

const isAdminMiddleWare: CustomRequestHandler = (req, res, next) => {
    if (!req.isAdmin) {
        return next(new AppError("unauthorized", 401));
    }
    return next();
};

export default wrapperRequestHandler(isAdminMiddleWare);
