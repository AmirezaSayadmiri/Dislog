import { Request } from "express";
import multer from "multer";

const userProfileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/users/profile-images");
  },
  filename: (req, file, cb) => {
    cb(null, `${new Date().getTime()}-${file.originalname}`);
  },
});

const userProfileFileFilter = (req:Request, file:any, cb:Function) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    return cb(null, true);
  }
  cb(null, false);
};

export { userProfileStorage, userProfileFileFilter };
