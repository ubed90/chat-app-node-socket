import { getAllChatMessagesController, sendMessageController } from "@/controllers/message";
import express from "express";

const router = express.Router();

router.route('/:chatId').get(getAllChatMessagesController).post(sendMessageController);


export default router;