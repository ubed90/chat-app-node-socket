import express from 'express';

// * Application routes
import authRoutes from './auth'
import chatRoutes from './chat';
import messageRoutes from './message';

const router = express.Router();


router.use('/auth', authRoutes);
router.use('/chats', chatRoutes);
router.use('/message', messageRoutes);

export default router;