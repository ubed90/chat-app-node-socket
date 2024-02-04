import { BadRequestError, CustomApiError, NotFoundError, UnauthorizedError } from '@/errors';
import { Chat, User } from '@/models';
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
              tokens: 0
            }
          }
        ]
      }
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
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              sender: { $first: '$sender' }
            }
          }
        ]
      }
    },
    {
      $addFields: {
        lastMessage: {
          $first: '$lastMessage'
        },
      }
    },
    ...(isGroupChat ? [{
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
              profilePicture: 1
            }
          }
        ]
      }
    }, {
      $addFields: {
        admin: {
          $first: '$admin'
        }
      }
    }] : [])
  ]
}

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
    message: 'User chats fetched successfully'
  })
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
              ...searchQuery[type as searchKeys]
            }
          }
        ],
      },
    },
    {
      $project: {
        email: 1,
        username: 1,
        name: 1,
        profilePicture: 1,
      },
    },
  ]);


  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Users Fetched Successfully',
    users
  })
};

const createOrAccessChatController = async (req: Request, res: Response) => {
  const { receiverId } = req.body;

  const userId = res.locals.user._id;

  if(receiverId === res.locals.user._id) throw new BadRequestError('You cannot chat with yourself');

  const receiver = await User.findOne({ _id: receiverId });

  if(!receiver) throw new BadRequestError(`No user found with Id: ${receiverId}`);

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

  if(chat.length) {
    return res.status(StatusCodes.OK).json({
      status: 'success',
      chat: chat[0],
      message: 'Chat fetched Successfully.'
    })
  }

  const newChat = await Chat.create({
    users: [new Types.ObjectId(userId), new Types.ObjectId(receiverId)],
    admin: new Types.ObjectId(userId)
  });

  chat = await Chat.aggregate([
    {
      $match: {
        _id: newChat._id
      }
    },
    ...chatCommonAggregation()
  ])

  if(!chat[0]) throw new CustomApiError('Internal Server Error', StatusCodes.INTERNAL_SERVER_ERROR);
  console.log(chat);
  

  return res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: 'New Chat created successfully',
    chat: chat[0]
  });
};

const createGroupChatController = async (req: Request, res: Response) => {
  const { name, participants } = req.body;

  if(!name || participants.length < 2) throw new BadRequestError('Invalid request');

  if(participants.includes(res.locals.user._id)) throw new BadRequestError('Participants cannot contain the creator');

  const members = [...new Set([...participants, res.locals.user._id])];

  if(members.length < 3) throw new BadRequestError(
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
        _id: newGroupChat._id
      },
    },
    ...chatCommonAggregation()
  ])

  if (!chat[0])
    throw new CustomApiError(
      'Internal Server Error',
      StatusCodes.INTERNAL_SERVER_ERROR
    );

  return res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: 'New Group Chat created',
    chat: chat[0],
  });
};

const getGroupChatDetailsController = async (req: Request, res: Response) => {
  const { groupId } = req.params;

  const chat = await Chat.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(groupId),
        isGroupChat: true
      }
    },
    ...chatCommonAggregation()
  ]);

  if (!chat[0]) {
    throw new NotFoundError('Group chat does not exist');
  }

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Group details fetched successfully',
    chat: chat[0]
  })
}

const renameGroupChatController = async (req: Request, res: Response) => {
  const { groupId, name } = req.body;

  if(!groupId || !name) throw new BadRequestError('Invalid request')

  const groupChat = await Chat.findOne({
    _id: groupId,
    isGroupChat: true
  })

  if(!groupChat) throw new NotFoundError('Group chat does not exist');

  if(groupChat.admin.toString() !== res.locals.user._id) throw new UnauthorizedError('Only admin is allowed to change the name');

  groupChat.name = name;

  await groupChat.save();

  const chat = await Chat.aggregate([
    {
      $match: {
        _id: groupChat._id
      }
    },
    ...chatCommonAggregation()
  ])

  if (!chat[0]) {
    throw new NotFoundError('Group chat does not exist');
  }

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Group renamed successfully',
    chat: chat[0],
  });
};

const addUserToGroupController = async (req: Request, res: Response) => {
  const { userId } = req.body;
  const { groupId } = req.params;

  if(!userId || !groupId) throw new BadRequestError('Invalid request');

  const groupChat = await Chat.findOne({ _id: groupId, isGroupChat: true })

  if(!groupChat) throw new NotFoundError(`No Group Chat found with ID: ${groupId}`);

  if(groupChat.admin.toString() !== res.locals.user._id) throw new UnauthorizedError('Only admins are allowed to add participants');

  if(groupChat.users.includes(userId)) throw new BadRequestError('User already present in group');

  groupChat.users.push(userId);

  await groupChat.save();

  const chat = await Chat.aggregate([
    {
      $match: {
        _id: groupChat._id
      }
    },
    ...chatCommonAggregation()
  ]);

  if (!chat[0]) {
    throw new NotFoundError('Group chat does not exist');
  }

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Participant added successfully',
    chat: chat[0]
  })
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
  const updatedChat = await Chat.findOneAndUpdate({ _id: groupId }, {
    $pull: {
      users: userId
    }
  }, {
    new: true
  })


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

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Participant removed successfully',
    chat: chat[0],
  });
};

const leaveGroupChatController = async (req: Request, res: Response) => {
  const { chatId } = req.body;

  if (!chatId) throw new BadRequestError('Invalid request');

  const groupChat = await Chat.findOne({ _id: chatId, isGroupChat: true });

  if (!groupChat)
    throw new NotFoundError(`No Group Chat found with ID: ${chatId}`);

  if (!groupChat.users.includes(res.locals.user._id))
    throw new BadRequestError('You are not a part of this group chat');

  // * NEW
  const updatedChat = await Chat.findOneAndUpdate(
    { _id: chatId },
    {
      $pull: {
        users: res.locals.user._id,
      },
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

  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: `You Left group ${updatedChat?.name} successfully`,
    chat: chat[0],
  });
};

const deleteChatController = async (req: Request, res: Response) => {
  const { chatId } = req.body;

  if(!chatId) throw new BadRequestError('Invalid chatId')

  let chat = await Chat.findOne({ _id: chatId });

  if (!chat) {
    throw new NotFoundError('Chat does not exist');
  }

  await chat.deleteOne();
  
  return res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Chat deleted Successfully.'
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
  getGroupChatDetailsController
};
