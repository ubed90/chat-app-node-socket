import { getAllChatMessagesController, sendMessageController } from "@/controllers/message";
import authMiddleware from "@/middlewares/auth.middleware";
import express from "express";

const router = express.Router();

router.use(authMiddleware);

router.route('/:chatId').get(getAllChatMessagesController).post(sendMessageController);


export default router;