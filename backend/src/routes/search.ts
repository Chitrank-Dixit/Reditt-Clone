import { Router } from 'express';
import Post from '../models/Post';
import Comment from '../models/Comment';
import Subreddit from '../models/Subreddit';

const router = Router();

// General search endpoint
router.get('/', async (req, res) => {
    const query = req.query.q as string;

    if (!query) {
        return res.status(400).json({ message: 'Search query is required.' });
    }

    try {
        const regex = new RegExp(query, 'i'); // Case-insensitive regex

        const posts = await Post.find({
            $or: [{ title: regex }, { content: regex }],
            status: 'visible'
        }).populate('author', 'name').populate('subreddit', 'name').limit(20);

        const comments = await Comment.find({
            content: regex
        }).populate('author', 'name').populate('post', 'id title').limit(20);

        const subreddits = await Subreddit.find({
            $or: [{ name: regex }, { description: regex }]
        }).limit(20);

        res.json({ posts, comments, subreddits });

    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).json({ message: 'Server error while searching.' });
    }
});

export default router;