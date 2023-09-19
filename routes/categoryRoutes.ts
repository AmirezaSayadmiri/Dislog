import express from "express";
import { wrappedGetCategories } from "../controllers/categoryControllers";

const router = express.Router();

router.get("/categories", wrappedGetCategories);

export default router;
