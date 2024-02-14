import { BadRequestError, CustomApiError, NotFoundError } from "@/errors";
import { Chat, Message } from "@/models";
import { CHAT_EVENTS } from "@/utils/socket";
import { emitSocketEvent } from "@/utils/socket/socketEvents";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { PipelineStage, Types } from "mongoose";

const messagesCommonAggregation = (): PipelineStage[] => {
  return [
    {
      $lookup: {
        from: 'users',
        foreignField: '_id',
        localField: 'sender',
        as: 'sender',
        pipeline: [
          {
            $project: {
              name: 1,
              email: 1,
              username: 1,
              profilePicture: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        sender: {
          $first: '$sender'
        }
      }
    }
  ]
}

const getAllChatMessagesController = async (req: Request, res: Response) => {
  const { chatId } = req.params;

  if(!chatId) throw new BadRequestError('Invalid chat Id: '+chatId);

  const chat = await Chat.findOne({
    _id: chatId,
    users: {
      $elemMatch: {
        $eq: new Types.ObjectId(res.locals.user._id)
      }
    }
  });

  if(!chat) throw new NotFoundError("You don't have any such chat");

  const allMessages = await Message.aggregate([
    {
      $match: {
        chat: new Types.ObjectId(chatId)
      }
    },
    ...messagesCommonAggregation(),
    {
      $sort: {
        createdAt: -1,
      }
    }
  ])

  return res.status(200).json({
    status: 'success',
    message: 'Messages fetched successfully',
    messages: allMessages
  })
}

const sendMessageController = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const { content } = req.body;

  if (!chatId) throw new BadRequestError('Invalid request');
  if (!content) throw new BadRequestError('Message field cannot be empty.');

  const chat = await Chat.findOne({
    _id: chatId,
    users: {
      $elemMatch: {
        $eq: new Types.ObjectId(res.locals.user._id),
      },
    },
  });

  if (!chat) throw new NotFoundError("You don't have any such chat");

  const newMessage = await Message.create({
    content,
    sender: new Types.ObjectId(res.locals.user._id),
    chat: new Types.ObjectId(chatId)
  });

  chat.lastMessage = new Types.ObjectId(newMessage._id);

  await chat.save();

  const message = await Message.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(newMessage._id),
      },
    },
    ...messagesCommonAggregation()
  ]);

  if(!message[0]) throw new CustomApiError('Internal server error', 500);
  
  chat.users.forEach((user) => {
    if(user._id.toString() === res.locals.user._id) return;

    emitSocketEvent(req, user._id.toString(), CHAT_EVENTS.onMessage, {
      newMessage: message[0],
      chat: chat
    });
  })

  return res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: 'Message sent successfully',
    newMessage: message[0]
  });
};

export { getAllChatMessagesController, sendMessageController };