import { Request, Response } from 'express';

const getAllChatsController = (req: Request, res: Response) => {
  return res.send('GET All USER CHATS');
};

const getAvailableUsersController = (req: Request, res: Response) => {
  return res.send('GET ALL AVAILABLE USERS');
};

const createOrAccessChatController = (req: Request, res: Response) => {
  return res.send('CREATE OR GET EXISTING CHAT');
};

const createGroupChatController = (req: Request, res: Response) => {
  return res.send('CREATE GROUP CHAT CONTROLLER');
};

const renameGroupChatController = (req: Request, res: Response) => {
  return res.send('RENAME GROUP CHAT CONTROLLER');
};

const addUserToGroupController = (req: Request, res: Response) => {
  return res.send('ADD TO GROUP CHAT CONTROLLER');
};

const removeUserFromGroupController = (req: Request, res: Response) => {
  return res.send('REMOVE FROM GROUP CHAT CONTROLLER');
};

const leaveGroupChatController = (req: Request, res: Response) => {
  return res.send('LEAVE GROUP CHAT CONTROLLER');
};

const deleteChatController = (req: Request, res: Response) => {
  return res.send('DELETE CHAT CONTROLLER');
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
};
