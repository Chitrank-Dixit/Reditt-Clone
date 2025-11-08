import { Router } from 'express';
import Post from '../models/Post';
import Comment from '../models/Comment';
import User from '../models/User';

const router = Router();

// Get a user's profile data
router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({ name: req.params.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Get all posts by a user
router.get('/:username/posts', async (req, res) => {
    try {
        const sort = (req.query.sort as string) || 'new'; // default to 'new'
        const username = req.params.username;

        let posts;

        if (sort === 'new') {
            posts = await Post.find({ 'author.name': username }).sort({ createdAt: -1 });
        } else if (sort === 'top') {
            posts = await Post.find({ 'author.name': username }).sort({ votes: -1 });
        } else { // 'hot'
            const epoch = new Date('1970-01-01');
            const postsWithScore = await Post.aggregate([
                { $match: { 'author.name': username } },
                {
                    $project: {
                        title: 1,
                        content: 1,
                        author: 1,
                        subreddit: 1,
                        votes: 1,
                        commentsCount: 1,
                        imageUrl: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        score: {
                            $add: [
                                { $log10: { $max: [1, { $abs: '$votes' }] } },
                                {
                                    $divide: [
                                        { $subtract: ['$createdAt', epoch] },
                                        45000 * 1000,
                                    ],
                                },
                            ],
                        },
                    },
                },
                { $sort: { score: -1 } },
            ]);
            
            posts = postsWithScore.map(p => {
                const { _id, score, ...rest } = p;
                return { ...rest, id: _id.toString() };
            });
        }
        
        res.json(posts);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all comments by a user
router.get('/:username/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ 'author.name': req.params.username })
            .sort({ createdAt: -1 })
            .populate('post', 'title id'); // Populate post title and ID for context

        if (!comments) {
            return res.status(404).json({ message: 'Comments not found for this user.' });
        }
        res.json(comments);
    } catch (error) {
        console.error('Error fetching user comments:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// "Upload" an avatar for a user
router.post('/:username/avatar', async (req, res) => {
    try {
        const { username } = req.params;
        const { avatarUrl } = req.body; // Expecting a base64 data URL

        if (!avatarUrl) {
            return res.status(400).json({ message: 'avatarUrl is required' });
        }

        const user = await User.findOneAndUpdate(
            { name: username },
            { avatarUrl: avatarUrl },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ avatarUrl: user.avatarUrl });
    } catch (error) {
        console.error('Error updating avatar:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.put('/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { bio } = req.body;

        if (typeof bio === 'undefined') {
            return res.status(400).json({ message: 'Bio field is required for update' });
        }

        const user = await User.findOneAndUpdate(
            { name: username },
            { bio },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
