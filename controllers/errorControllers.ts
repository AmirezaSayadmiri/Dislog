import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import AppError from "../AppError";

const sendDevError = (err: Error | AppError, res: Response) => {
    let json: any = { stack: err.stack, message: err.message };

    if (err instanceof AppError && err.errors) {
        json.errors = err.errors;
    }

    return res.status((err instanceof AppError && err.statusCode) || 500).json(json);
};

const sendProdError = (err: AppError, res: Response) => {
    let json: any = { message: err.message };

    if (err.errors) {
        json.errors = err.errors;
    }

    return res.status(err.statusCode).json(json);
};

const handleCastError = (err: any) => {
    const message = `Invalid ${err.path!} : ${err.value!}`;
    return new AppError(message, 400);
};

const errorHandler = (err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === "development") {
        sendDevError(err, res);
    } else if (process.env.NODE_ENV === "production") {
        if (err.name === "CastError") {
            err = handleCastError(err);
        }

        if (err instanceof AppError && err.isOperational) {
            return sendProdError(err, res);
        }

        console.log(err);
        res.status(500).json({ message: "خطایی رخ داد" });
    }
};

export default errorHandler;
