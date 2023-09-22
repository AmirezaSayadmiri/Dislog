import { validationResult } from "express-validator";
import { CustomRequestHandler, wrapperRequestHandler } from "../types/types";
import Ticket from "../models/Ticket";
import UserProfile from "../models/UserProfile";
import User from "../models/User";

const getTickets: CustomRequestHandler = async (req, res, next) => {
    const tickets = await Ticket.findAll({
        include: { model: User, as: "User", include: [{ model: UserProfile, as: "UserProfile" }] },
    });

    tickets.forEach(async ticket=>{
        ticket.is_seen=true;
        await ticket.save()
    })

    return res.status(200).json({ tickets });
};

const postTickt: CustomRequestHandler = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(401).json(errors);
    }

    const { title, body } = req.body;
    const ticket = await Ticket.create({ title, body, UserId: +req.userId! });

    return res.status(200).json({ message: "تیکت ثبت شد" });
};

const putTicket: CustomRequestHandler = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(401).json(errors);
    }

    const { answer } = req.body;
    const { id } = req.params;
    const ticket = (await Ticket.findByPk(id)) as Ticket;

    if (!ticket) {
        return next();
    }

    ticket.answer = answer;
    await ticket.save();

    return res.status(200).json({ message: "پاسخ تیکت ثبت شد" });
};

const deleteTickt: CustomRequestHandler = async (req, res, next) => {
    const { id } = req.params;
    const ticket = (await Ticket.findByPk(id)) as Ticket;

    if (!ticket) {
        return next();
    }

    await ticket.destroy();

    return res.status(200).json({ message: "تیکت حذف شد" });
};

const getUserTickets: CustomRequestHandler = async (req, res, next) => {
    const tickets = await Ticket.findAll({
        where: { UserId: +req.userId! },
        include: { model: User, as: "User", include: [{ model: UserProfile, as: "UserProfile" }] },
    });

    if (!tickets) {
        return next();
    }

    return res.status(200).json({ tickets });
};

export const wrappedGetTickets = wrapperRequestHandler(getTickets);
export const wrappedPostTicket = wrapperRequestHandler(postTickt);
export const wrappedPutTicket = wrapperRequestHandler(putTicket);
export const wrappedDeleteTicket = wrapperRequestHandler(deleteTickt);
export const wrappedGetUserTickets = wrapperRequestHandler(getUserTickets);
