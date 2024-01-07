import { Request, Response } from "express";

const getAllChatMessagesController = (req: Request, res: Response) => {
    return res.send("GET ALL CHAT MESSAGES");
}

const sendMessageController = (req: Request, res: Response) => {
  return res.send('SEND MESSAGE');
};

export { getAllChatMessagesController, sendMessageController };