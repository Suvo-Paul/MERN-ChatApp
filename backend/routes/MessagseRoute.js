import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { getMessages } from "../controllers/MessagesController.js";

const messagesRoute = Router();

messagesRoute.post("/get-messages", verifyToken, getMessages);

export default messagesRoute;