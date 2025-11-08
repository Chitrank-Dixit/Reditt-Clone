import { Router } from 'express';
import Comment from '../models/Comment';
import Post from '../models/Post';
import User from '../models/User';
import auth from '../middleware/auth';

const router = Router();

// Vote on a comment
router.post('/:id/vote', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    const { vote } = req.body; // 'up' or 'down'
    
    let voteChange = 0;
    if (vote === 'up') {
      comment.votes++;
      voteChange = 1;
    } else if (vote === 'down') {
      comment.votes--;
      voteChange = -1;
    } else {
      return res.status(400).json({ message: 'Invalid vote direction' });
    }
    
    // Update author's karma
    if (voteChange !== 0) {
      await User.findOneAndUpdate({ name: comment.author.name }, { $inc: { karma: voteChange } });
    }

    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Reply to a comment
router.post('/:id/reply', auth, async (req, res) => {
  try {
    const parentComment = await Comment.findById(req.params.id);
    if (!parentComment) {
      return res.status(404).json({ message: 'Parent comment not found' });
    }

    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Reply content is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: 'Authenticated user not found' });
    }

    const newReply = new Comment({
      content,
      author: { id: user.id, name: user.name },
      post: parentComment.post, // Associate with the same post
      votes: 1, // Start with one upvote
    });

    await newReply.save();

    // Add reply to parent comment
    parentComment.replies.push(newReply._id as any);
    await parentComment.save();
    
    // Increment post's comment count
    await Post.findByIdAndUpdate(parentComment.post as any, { $inc: { commentsCount: 1 } });
    
    const populatedReply = newReply.toJSON();
    populatedReply.replies = []; // Ensure new reply has an empty replies array for consistency

    res.status(201).json(populatedReply);
  } catch (error) {
    console.error('Error replying to comment:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;