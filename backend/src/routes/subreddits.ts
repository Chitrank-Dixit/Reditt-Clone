import { Router } from 'express';
import Subreddit from '../models/Subreddit';
import Post from '../models/Post';
import User from '../models/User';
import auth from '../middleware/auth';

const router = Router();

// Create a new subreddit
router.post('/create', auth, async (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) {
        return res.status(400).json({ message: 'Name and description are required.' });
    }

    try {
        let subreddit = await Subreddit.findOne({ name });
        if (subreddit) {
            return res.status(400).json({ message: 'A community with this name already exists.' });
        }

        subreddit = new Subreddit({
            name,
            description,
            creator: req.user.id,
            moderators: [req.user.id],
            members: [req.user.id],
        });

        await subreddit.save();

        // Also add this subreddit to the user's joined list
        await User.findByIdAndUpdate(req.user.id, { $addToSet: { joinedSubreddits: subreddit._id } });

        res.status(201).json(subreddit);

    } catch (error) {
        console.error('Error creating subreddit:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get subreddit details
router.get('/:name', async (req, res) => {
    try {
        const subreddit = await Subreddit.findOne({ name: req.params.name });
        if (!subreddit) {
            return res.status(404).json({ message: 'Subreddit not found' });
        }
        res.json(subreddit);
    } catch (error) {
        console.error('Error fetching subreddit:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get posts for a subreddit
router.get('/:name/posts', async (req, res) => {
    try {
        const subreddit = await Subreddit.findOne({ name: req.params.name });
        if (!subreddit) {
            return res.status(404).json({ message: 'Subreddit not found' });
        }

        const posts = await Post.find({ subreddit: subreddit._id, status: 'visible' })
            .populate('author', 'name')
            .populate('subreddit', 'name')
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        console.error('Error fetching subreddit posts:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Join a subreddit
router.post('/:id/join', auth, async (req, res) => {
    try {
        const subredditId = req.params.id;
        const userId = req.user.id;
        
        // Add user to subreddit's members list and subreddit to user's joined list
        const subreddit = await Subreddit.findByIdAndUpdate(subredditId, { $addToSet: { members: userId } }, { new: true });
        await User.findByIdAndUpdate(userId, { $addToSet: { joinedSubreddits: subredditId } });

        if (!subreddit) {
             return res.status(404).json({ message: 'Subreddit not found' });
        }

        res.json(subreddit);
    } catch (error) {
        console.error('Error joining subreddit:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Leave a subreddit
router.post('/:id/leave', auth, async (req, res) => {
    try {
        const subredditId = req.params.id;
        const userId = req.user.id;
        
        // Remove user from subreddit's members list and subreddit from user's joined list
        const subreddit = await Subreddit.findByIdAndUpdate(subredditId, { $pull: { members: userId } }, { new: true });
        await User.findByIdAndUpdate(userId, { $pull: { joinedSubreddits: subredditId } });

        if (!subreddit) {
             return res.status(404).json({ message: 'Subreddit not found' });
        }

        res.json(subreddit);
    } catch (error) {
        console.error('Error leaving subreddit:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


export default router;