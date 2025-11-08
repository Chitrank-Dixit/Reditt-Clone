import { Router } from 'express';
import Comment, { IComment } from '../models/Comment';
import Post from '../models/Post';
import User from '../models/User';
import auth from '../middleware/auth';
import mongoose from 'mongoose';

const router = Router();

// Helper function to recursively delete comments and count them
const deleteCommentAndReplies = async (commentId: mongoose.Types.ObjectId): Promise<number> => {
    const comment = await Comment.findById(commentId);
    if (!comment) {
        return 0;
    }

    let deletedCount = 1; // Count the comment itself

    // Recursively delete all replies
    if (comment.replies && comment.replies.length > 0) {
        for (const replyId of comment.replies) {
            deletedCount += await deleteCommentAndReplies(replyId);
        }
    }

    await Comment.findByIdAndDelete(commentId);
    return deletedCount;
};


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

// Edit a comment
router.put('/:id', auth, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }
        
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        
        if (comment.author.id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to edit this comment' });
        }

        comment.content = content;
        await comment.save();
        
        const populatedComment = await Comment.findById(comment._id).populate('replies');
        res.json(populatedComment);

    } catch (error) {
        console.error('Error editing comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a comment
router.delete('/:id', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.author.id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to delete this comment' });
        }

        // Find the parent comment if it exists to remove the reference
        const parentComment = await Comment.findOne({ replies: comment._id });
        if (parentComment) {
            parentComment.replies = parentComment.replies.filter(
                replyId => replyId.toString() !== comment._id.toString()
            );
            await parentComment.save();
        }

        // FIX: Cast comment._id to mongoose.Types.ObjectId to resolve type mismatch error.
        const deletedCount = await deleteCommentAndReplies(comment._id as mongoose.Types.ObjectId);

        // Decrement the post's comment count
        await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -deletedCount } });

        res.json({ message: 'Comment and replies deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


export default router;
