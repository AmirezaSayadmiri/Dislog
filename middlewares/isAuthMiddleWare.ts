import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { CustomRequestHandler, wrapperRequestHandler } from "../types/types";

const isAuthMiddleWare: CustomRequestHandler = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      const decodedToken = jwt.verify(token, "supersupersecretkey") as {
        userId: number;
      };
      if (decodedToken) {
        req.userId = decodedToken.userId;
        return next();
      }
      return res.status(401).json({ message: "unauthorizated" });
    } catch (err) {
      return res.status(401).json({ message: "unauthorizated" });
    }
  }
  res.status(401).json({ message: "unauthorizated" });
};

export default wrapperRequestHandler(isAuthMiddleWare);
