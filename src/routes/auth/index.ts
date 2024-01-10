import express from 'express';
import {
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resetPasswordController,
  updateProfileController,
  verifyEmailController,
} from '@/controllers/auth';
import authMiddleware from '@/middlewares/auth.middleware';

const router = express.Router();

router.route('/login').post(loginController);

router.route('/register').post(registerController);

router.route('/verify-email').post(verifyEmailController);

router.route('/forgot-password').post(forgotPasswordController);

router.route('/reset-password').post(resetPasswordController);

router.route('/logout').post(authMiddleware, logoutController);

router.route('/update-profile/:id').patch(authMiddleware, updateProfileController);

export default router;