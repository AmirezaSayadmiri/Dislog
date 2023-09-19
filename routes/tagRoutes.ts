import express from "express";
import { wrappedGetTags } from "../controllers/tagControllers";

const router = express.Router();

router.get("/tags", wrappedGetTags);

export default router;
