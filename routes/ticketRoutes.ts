import express from "express";
import { wrappedDeleteTicket, wrappedGetTickets, wrappedGetUserTickets, wrappedPostTicket, wrappedPutTicket } from "../controllers/ticketController";
import { body } from "express-validator";
import isAuthMiddleWare from "../middlewares/isAuthMiddleWare";
import isAdminMiddleWare from "../middlewares/isAdminMiddleWare";

const router = express.Router();

router.get(
    "/tickets",
    isAuthMiddleWare,
    isAdminMiddleWare,
    wrappedGetTickets
);

router.post(
    "/tickets",
    isAuthMiddleWare,
    body("title").notEmpty().withMessage("لطفا موضوع تیکت را وارد کنید"),
    body("body").notEmpty().withMessage("لطفا متن تیکت را وارد کنید"),
    wrappedPostTicket
);

router.put(
    "/tickets/:id",
    isAuthMiddleWare,
    isAdminMiddleWare,
    body("answer").notEmpty().withMessage("لطفا پاسخ تیکت را وارد کنید"),
    wrappedPutTicket
);

router.delete(
    "/tickets/:id",
    isAuthMiddleWare,
    isAdminMiddleWare,
    wrappedDeleteTicket
);

router.get("/tickets/user",isAuthMiddleWare, wrappedGetUserTickets)

export default router;
