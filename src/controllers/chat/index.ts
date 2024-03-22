import {
  BadRequestError,
  CustomApiError,
  NotFoundError,
  UnauthorizedError,
} from '@/errors';
import { Chat, Message, User } from '@/models';
import { CHAT_EVENTS } from '@/utils/socket';
import { emitSocketEvent } from '@/utils/socket/socketEvents';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { PipelineStage, Types } from 'mongoose';

const chatCommonAggregation = (isGroupChat = true): PipelineStage[] => {
  return [
    {
      $lookup: {
        from: 'users',
        foreignField: '_id',
        localField: 'users',
        as: 'users',
        pipeline: [
          {
            $project: {
              password: 0,
              isAdmin: 0,
              isVerified: 0,
              verifiedOn: 0,
              verificationToken: 0,
              passwordToken: 0,
              passwordTokenExpirationDate: 0,
              tokens: 0,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'messages',
        foreignField: '_id',
        localField: 'lastMessage',
        as: 'lastMessage',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              foreignField: '_id',
              localField: 'sender',
              as: 'sender',
              pipeline: [
                {
                  $project: {
                    email: 1,
                    profilePicture: 1,
                    name: 1,
                    username: 1,
                    phoneNumber: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              sender: { $first: '$sender' },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        lastMessage: {
          $first: '$lastMessage',
        },
      },
    },
    ...(isGroupChat
      ? [
          {
            $lookup: {
              from: 'users',
              localField: 'admin',
              foreignField: '_id',
              as: 'admin',
              pipeline: [
                {
                  $project: {
                    name: 1,
                    email: 1,
                    username: 1,
                    profilePicture: 1,
                    phoneNumber: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              admin: {
                $first: '$admin',
              },
            },
          },
        ]
      : []),
  ];
};

const getAllChatsController = async (_: Request, res: Response) => {
  const chats = await Chat.aggregate([
    {
      $match: {
        users: {
          $elemMatch: {
            $eq: new Types.ObjectId(res.locals.user._id),
          },
        },
      },
    },
    {
      $sort: {
        updatedAt: -1,
      },
    },
    ...chatCommonAggregation(),
  ]);

  return res.status(StatusCodes.OK).json({
    status: 'success',
    chats,
    message: 'User chats fetched successfully',
  });
};

const getAvailableUsersController = async (req: Request, res: Response) => {
  let { type, search } = req.query;

  const searchQuery = {
    name: {
      $regex: search,
      $options: 'i',
    },
    phoneNumber: {
      $regex: search,
      $options: 'i',
    },
    email: {
      $regex: search,
      $options: 'i',
    },
    username: {
      $regex: search,
      $options: 'i',
    },
  };

  type searchKeys = keyof typeof searchQuery;

  const users = await User.aggregate([
    {
      $match: {
        $and: [
          {
            _id: {
              $ne: new Types.ObjectId(res.locals.user._id),
            },
          },
          {
            [type as string]: {
              ...searchQuery[type as searchKeys],
            },
          },
        ],
      },
    },
    {
      $project: {
        email: 1,
        username: 1,
        name: 1,
        profilePicture: 1,
        phoneNumber: 1,
      },
    },
  ]);

  console.log(type, search);
  console.log(users);

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Users Fetched Successfully',
    users,
  });
};

const createOrAccessChatController = async (req: Request, res: Response) => {
  const { receiverId } = req.body;

  const userId = res.locals.user._id;

  if (receiverId === res.locals.user._id)
    throw new BadRequestError('You cannot chat with yourself');

  const receiver = await User.findOne({ _id: receiverId });

  if (!receiver)
    throw new BadRequestError(`No user found with Id: ${receiverId}`);

  let chat = await Chat.aggregate([
    {
      $match: {
        isGroupChat: false,
        $and: [
          {
            users: {
              $elemMatch: {
                $eq: new Types.ObjectId(userId),
              },
            },
          },
          {
            users: {
              $elemMatch: {
                $eq: new Types.ObjectId(receiverId),
              },
            },
          },
        ],
      },
    },
    ...chatCommonAggregation(false),
  ]);

  if (chat.length) {
    return res.status(StatusCodes.OK).json({
      status: 'success',
      chat: chat[0],
      message: 'Chat fetched Successfully.',
    });
  }

  const newChat = await Chat.create({
    users: [new Types.ObjectId(userId), new Types.ObjectId(receiverId)],
    admin: new Types.ObjectId(userId),
  });

  chat = await Chat.aggregate([
    {
      $match: {
        _id: newChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  if (!chat[0])
    throw new CustomApiError(
      'Internal Server Error',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  console.log(chat);

  emitSocketEvent(req, receiverId, CHAT_EVENTS.newChat, chat[0]);

  return res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: 'New Chat created successfully',
    chat: chat[0],
  });
};

const createGroupChatController = async (req: Request, res: Response) => {
  const { name, participants } = req.body;

  if(!name) throw new BadRequestError('Group Name is Required.');

  if (participants.length < 2)
    throw new BadRequestError('Minimum 3 participants are required to create a group.');

  if (participants.includes(res.locals.user._id))
    throw new BadRequestError('Participants cannot contain the creator');

  const members = [...new Set([...participants, res.locals.user._id])];

  if (members.length < 3)
    throw new BadRequestError(
      'Seems like you have passed duplicate participants.'
    );

  const newGroupChat = await Chat.create({
    name,
    users: members,
    isGroupChat: true,
    admin: new Types.ObjectId(res.locals.user._id),
  });

  const chat = await Chat.aggregate([
    {
      $match: {
        _id: newGroupChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  if (!chat[0])
    throw new CustomApiError(
      'Internal Server Error',
      StatusCodes.INTERNAL_SERVER_ERROR
    );

  newGroupChat.users.forEach((user) => {
    if (user._id.toString() === res.locals.user._id) return;

    emitSocketEvent(req, user._id.toString(), CHAT_EVENTS.newChat, chat[0]);
  });

  return res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: 'New Group Chat created',
    chat: chat[0],
  });
};

const getChatDetailsController = async (req: Request, res: Response) => {
  const { chatId } = req.params;

  const chat = await Chat.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(chatId),
      },
    },
    ...chatCommonAggregation(),
  ]);

  if (!chat[0]) {
    throw new NotFoundError('Chat does not exist');
  }

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Group details fetched successfully',
    chat: chat[0],
  });
};

const renameGroupChatController = async (req: Request, res: Response) => {
  const { groupId, name } = req.body;

  if (!groupId || !name) throw new BadRequestError('Invalid request');

  const groupChat = await Chat.findOne({
    _id: groupId,
    isGroupChat: true,
  });

  if (!groupChat) throw new NotFoundError('Group chat does not exist');

  if (groupChat.admin.toString() !== res.locals.user._id)
    throw new UnauthorizedError('Only admin is allowed to change the name');

  const notificationMessage = await Message.create({
    content: res.locals.user.name + ' changed the group name as ' + `"${name}"`,
    chat: groupChat._id,
    sender: groupChat.admin,
    isNotification: true,
  });

  groupChat.name = name;

  groupChat.lastMessage = new Types.ObjectId(notificationMessage._id);

  await groupChat.save();

  const chat = await Chat.aggregate([
    {
      $match: {
        _id: groupChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  if (!chat[0]) {
    throw new NotFoundError('Group chat does not exist');
  }

  groupChat.users.forEach((user) => {
    if (user._id.toString() !== res.locals.user._id) {
      emitSocketEvent(req, user._id.toString(), CHAT_EVENTS.updateGroupName, {
        chatId: groupChat._id,
        name,
      });
    };

    emitSocketEvent(req, user._id.toString(), CHAT_EVENTS.onMessage, {
      newMessage: notificationMessage,
      chat: chat[0]
    });
  });

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Group renamed successfully',
    chat: chat[0],
  });
};

const addUserToGroupController = async (req: Request, res: Response) => {
  const { userId } = req.body;
  const { groupId } = req.params;

  if (!userId || !groupId) throw new BadRequestError('Invalid request');

  const groupChat = await Chat.findOne({ _id: groupId, isGroupChat: true });

  if (!groupChat)
    throw new NotFoundError(`No Group Chat found with ID: ${groupId}`);

  if (groupChat.admin.toString() !== res.locals.user._id)
    throw new UnauthorizedError('Only admins are allowed to add participants');

  if (groupChat.users.includes(userId))
    throw new BadRequestError('User already present in group');

  const userToAdd = await User.findOne({ _id: userId });

  groupChat.users.push(userId);

  const notificationMessage = await Message.create({
    content: res.locals.user.name + ' added ' + userToAdd?.name,
    chat: groupChat._id,
    sender: groupChat.admin,
    isNotification: true,
  });

  groupChat.lastMessage = new Types.ObjectId(notificationMessage._id);

  await groupChat.save();

  const chat = await Chat.aggregate([
    {
      $match: {
        _id: groupChat._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  if (!chat[0]) {
    throw new NotFoundError('Group chat does not exist');
  }

  groupChat.users.forEach((user) => {
    if (user._id.toString() === userToAdd?._id.toString()) {
      emitSocketEvent(
        req,
        user._id.toString(),
        CHAT_EVENTS.newChat,
        chat[0]
      );

      return;
    }

    emitSocketEvent(req, user._id.toString(), CHAT_EVENTS.onMessage, {
      newMessage: notificationMessage,
      chat: chat[0]
    });
  });

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Participant added successfully',
    chat: chat[0],
  });
};

const removeUserFromGroupController = async (req: Request, res: Response) => {
  const { userId } = req.body;
  const { groupId } = req.params;

  if (!userId || !groupId) throw new BadRequestError('Invalid request');

  const groupChat = await Chat.findOne({ _id: groupId, isGroupChat: true });

  if (!groupChat)
    throw new NotFoundError(`No Group Chat found with ID: ${groupId}`);

  if (groupChat.admin.toString() !== res.locals.user._id)
    throw new UnauthorizedError('Only admins are allowed to add participants');

  if (!groupChat.users.includes(userId))
    throw new BadRequestError('User not present in group');

  // * OLD
  // groupChat.users = groupChat.users.filter(user => user.toString() !== userId) as Types.Array<Types.ObjectId>;
  // await groupChat.save();

  // * NEW
  const userToRemove = await User.findOne({ _id: userId });

  const notificationMessage = await Message.create({
    content: res.locals.user.name + ' removed ' + userToRemove?.name,
    chat: groupChat._id,
    sender: groupChat.admin,
    isNotification: true,
  });

  const updatedChat = await Chat.findOneAndUpdate(
    { _id: groupId },
    {
      $pull: {
        users: userId,
      },
      lastMessage: notificationMessage._id,
    },
    {
      new: true,
    }
  );

  const chat = await Chat.aggregate([
    {
      $match: {
        _id: updatedChat?._id,
      },
    },
    ...chatCommonAggregation(),
  ]);

  if (!chat[0]) {
    throw new NotFoundError('Group chat does not exist');
  }

  groupChat.users.forEach((user) => {
    if (user._id.toString() === userToRemove?._id.toString()) {
      emitSocketEvent(
        req,
        user._id.toString(),
        CHAT_EVENTS.removeFromGroup,
        chat[0]
      );
      
      return;
    }

    emitSocketEvent(req, user._id.toString(), CHAT_EVENTS.onMessage, {
      newMessage: notificationMessage,
      chat: chat[0]
    });
  });

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Participant removed successfully',
    chat: chat[0],
  });
};

const leaveGroupChatController = async (req: Request, res: Response) => {
  const { chatId } = req.body;

  if (!chatId) throw new BadRequestError('Invalid request');

  const groupChat = await Chat.findOne({ _id: chatId, isGroupChat: true }).populate('admin');

  if (!groupChat)
    throw new NotFoundError(`No Group Chat found with ID: ${chatId}`);

  if (!groupChat.users.includes(res.locals.user._id))
    throw new BadRequestError('You are not a part of this group chat');

  const userToRemove = await User.findOne({ _id: res.locals.user._id });

  if(groupChat.users.length !== 1) {
    let newAdmin = undefined;

    if (
      userToRemove?._id.toString() === groupChat.admin._id.toString() &&
      groupChat.users.length > 1
    ) {
      newAdmin =
        groupChat.users[Math.floor(groupChat.users.length * Math.random())];
    }

    const notificationMessage = await Message.create({
      content: userToRemove?.name + ' left the Group',
      chat: groupChat._id,
      sender: userToRemove?._id,
      isNotification: true,
    });

    // * NEW
    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId },
      {
        $pull: {
          users: res.locals.user._id,
        },
        lastMessage: notificationMessage._id,
        ...(newAdmin ? { admin: newAdmin } : {}),
      },
      {
        new: true,
      }
    );

    const chat = await Chat.aggregate([
      {
        $match: {
          _id: updatedChat?._id,
        },
      },
      ...chatCommonAggregation(),
    ]);

    if (!chat[0]) {
      throw new NotFoundError('Group chat does not exist');
    }

    updatedChat?.users.forEach((user) => {
      if (user._id.toString() === res.locals.user._id) return;

      emitSocketEvent(req, user._id.toString(), CHAT_EVENTS.onMessage, {
        newMessage: notificationMessage,
        chat: chat[0],
      });
    });

    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: `You Left group ${updatedChat?.name} successfully`,
    });
  } else {
    await groupChat.deleteOne();
  }

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: `You Left group ${groupChat?.name} successfully`,
  });
};

const deleteChatController = async (req: Request, res: Response) => {
  const { chatId } = req.body;

  if (!chatId) throw new BadRequestError('Invalid chatId');

  let chat = await Chat.findOne({ _id: chatId, isGroupChat: false });

  if (!chat) {
    throw new NotFoundError('Chat does not exist');
  }

  await chat.deleteOne();

  chat.users.forEach((user) => {
    if (user._id.toString() === res.locals.user._id) return;

    emitSocketEvent(req, user._id.toString(), CHAT_EVENTS.deleteChat, {
      deletedChat: chat,
      name: res.locals.user.name,
    });
  });

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Chat deleted Successfully.',
  });
};

const deleteGroupChatController = async (req: Request, res: Response) => {
  const { groupId } = req.body;

  if (!groupId) throw new BadRequestError('Invalid delete request.');

  const groupChat = await Chat.findOne({ _id: groupId });

  if (!groupChat)
    throw new BadRequestError('No group found with id: ' + groupId);

  if (groupChat.admin.toString() !== res.locals.user._id)
    throw new UnauthorizedError('Only admins are allowed to delete the group.');

  await groupChat.deleteOne();

  groupChat.users.forEach((user) => {
    if (user._id.toString() === res.locals.user._id) return;

    emitSocketEvent(req, user._id.toString(), CHAT_EVENTS.deleteChat, {
      deletedChat: groupChat,
      name: res.locals.user.name,
    });
  });

  return res.json({
    status: 'success',
    message: 'Successfully deleted the group ' + groupChat.name,
  });
};

export {
  getAllChatsController,
  getAvailableUsersController,
  createOrAccessChatController,
  createGroupChatController,
  renameGroupChatController,
  addUserToGroupController,
  removeUserFromGroupController,
  leaveGroupChatController,
  deleteChatController,
  getChatDetailsController,
  deleteGroupChatController,
};
