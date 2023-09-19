import Tag from "../models/Tag";
import { CustomRequestHandler, wrapperRequestHandler } from "../types/types";

const getTags: CustomRequestHandler = async (req, res, next) => {
    const tags = await Tag.findAll();
    return res.status(200).json({ tags });
};
const wrappedGetTags = wrapperRequestHandler(getTags);

export { wrappedGetTags };
