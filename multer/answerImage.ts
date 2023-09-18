import { Request } from "express";
import multer from "multer";

const answerImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images/answers");
    },
    filename: (req, file, cb) => {
        cb(null, `${new Date().getTime()}-${file.originalname}`);
    },
});

const answerImageFileFilter = (req: Request, file: any, cb: Function) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg") {
        return cb(null, true);
    }
    cb(null, false);
};

export { answerImageFileFilter, answerImageStorage };
