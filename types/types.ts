import { NextFunction, Request, Response } from "express";

interface CustomRequest extends Request {
    userId: string | number | undefined;
}

type CustomRequestHandler = (req: CustomRequest, res: Response, next: NextFunction) => any;

const wrapperRequestHandler = (handler: CustomRequestHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const customReq: CustomRequest = req as CustomRequest;

        return handler(customReq, res, next);
    };
};

export { wrapperRequestHandler, CustomRequestHandler };
