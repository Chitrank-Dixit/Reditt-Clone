import { Router } from 'express';
import Comment from '../models/Comment';

const router = Router();

// Vote on a comment
router.post('/:id/vote', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    const { vote } = req.body; // 'up' or 'down'
    if (vote === 'up') {
      comment.votes++;
    } else if (vote === 'down') {
      comment.votes--;
    } else {
      return res.status(400).json({ message: 'Invalid vote direction' });
    }
    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
