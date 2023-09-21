import { CustomRequestHandler, wrapperRequestHandler } from "../types/types";

const isAdminMiddleWare:CustomRequestHandler = (req, res, next) => {
    if(!req.isAdmin){
        return res.status(401).json({message:"a unauthorized"})
    }
    return next()
}

export default wrapperRequestHandler(isAdminMiddleWare);