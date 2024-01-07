import {
  addUserToGroupController,
  createGroupChatController,
  createOrAccessChatController,
  deleteChatController,
  getAllChatsController,
  getAvailableUsersController,
  removeUserFromGroupController,
  renameGroupChatController,
} from '@/controllers/chat';
import express from 'express';

const router = express.Router();

router
  .route('/')
  .get(getAllChatsController)
  .post(createOrAccessChatController)
  .delete(deleteChatController);

router.route('/users').get(getAvailableUsersController);

router
  .route('/group')
  .post(createGroupChatController)
  .patch(renameGroupChatController);

router
  .route('/group/:groupId')
  .patch(addUserToGroupController)
  .delete(removeUserFromGroupController);

export default router;
