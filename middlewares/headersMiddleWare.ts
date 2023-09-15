import { RequestHandler } from "express";
import { CustomRequestHandler, wrapperRequestHandler } from "../types/types";

const headersMiddleWare: CustomRequestHandler = (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
};

export default wrapperRequestHandler(headersMiddleWare);
