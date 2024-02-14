import {
  addUserToGroupController,
  createGroupChatController,
  createOrAccessChatController,
  deleteChatController,
  deleteGroupChatController,
  getAllChatsController,
  getAvailableUsersController,
  getGroupChatDetailsController,
  leaveGroupChatController,
  removeUserFromGroupController,
  renameGroupChatController,
} from '@/controllers/chat';
import express from 'express';
import authMiddleware from '@/middlewares/auth.middleware';

const router = express.Router();

router.use(authMiddleware);

router
  .route('/')
  .get(getAllChatsController)
  .post(createOrAccessChatController)
  .delete(deleteChatController);

router.route('/users').get(getAvailableUsersController);

router
  .route('/group')
  .post(createGroupChatController)
  .patch(renameGroupChatController)
  .delete(leaveGroupChatController);

router.route('/group/delete').delete(deleteGroupChatController);

router
  .route('/group/:groupId')
  .get(getGroupChatDetailsController)
  .patch(addUserToGroupController)
  .delete(removeUserFromGroupController);

export default router;
