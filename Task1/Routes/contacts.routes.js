import express from "express";
import { get } from "mongoose";
import contactController from "../Controllers/contact.controller.js";

const router = express.Router();

router.get("/contacts", contactController.getAll);

router.post("/identify", contactController.identify);

export default router;
