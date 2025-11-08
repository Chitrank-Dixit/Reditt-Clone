import { Router } from 'express';
import postRoutes from './posts';
import commentRoutes from './comments';
import userRoutes from './users';
import authRoutes from './auth';
import subredditRoutes from './subreddits';

const router = Router();

router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/users', userRoutes);
router.use('/subreddits', subredditRoutes);

export default router;