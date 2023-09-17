import { Request } from "express";
import multer from "multer";

const questionImageStorage = multer.diskStorage({
    destination: (req: Request, file, cb) => {
        cb(null, "images/questions");
    },
    filename: (req: Request, file, cb) => {
        cb(null, `${new Date().getTime()}-${file.originalname}`);
    },
});

const questionImageFilter = (req: Request, file: any, cb: Function) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg") {
        return cb(null, true);
    }
    cb(null, false);
};

export { questionImageStorage, questionImageFilter };
