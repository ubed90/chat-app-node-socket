import { getAllChatMessagesController, sendAttachmentController, sendMessageController } from "@controllers/message";
import authMiddleware from "@middlewares/auth.middleware";
import express from "express";

const router = express.Router();

router.use(authMiddleware);

router
  .route('/attachment/:chatId')
  .post(sendAttachmentController);

router.route('/:chatId').post(sendMessageController);

router.route('/:chatId/:skip').get(getAllChatMessagesController);


export default router;