import express from 'express';
import {
  forgotPasswordController,
  loginController,
  registerController,
  resetPasswordController,
  verifyEmailController,
} from '@/controllers/auth';

const router = express.Router();

router.route('/login').post(loginController);

router.route('/register').post(registerController);

router.route('/verify-email').post(verifyEmailController);

router.route('/forgot-password').post(forgotPasswordController);

router.route('/reset-password').post(resetPasswordController);

export default router;