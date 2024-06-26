import express from 'express';
import {
  autoLoginController,
  changePasswordController,
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  removeProfilePictureController,
  resetPasswordController,
  updateProfileController,
  updateProfilePictureController,
  verifyEmailController,
} from '@controllers/auth';
import authMiddleware from '@middlewares/auth.middleware';

const router = express.Router();

router.route('/login').post(loginController);

router.route('/auto-login').post(autoLoginController);

router.route('/register').post(registerController);

router.route('/verify-email').post(verifyEmailController);

router.route('/forgot-password').post(forgotPasswordController);

router.route('/reset-password').post(resetPasswordController);

router.route('/logout').post(authMiddleware, logoutController);

router
  .route('/update-profile/:id')
  .patch(authMiddleware, updateProfileController)
  .post(authMiddleware, updateProfilePictureController)
  .delete(authMiddleware, removeProfilePictureController);

router.route('/change-password').post(authMiddleware, changePasswordController);

export default router;
