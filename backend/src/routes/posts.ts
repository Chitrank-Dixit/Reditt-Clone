import { Router } from 'express';
import Post from '../models/Post';
import Comment from '../models/Comment';

const router = Router();

// Get all posts
router.get('/', async (req, res) => {
  try {
    const sort = (req.query.sort as string) || 'hot'; // default to 'hot'

    let posts;

    if (sort === 'new') {
      posts = await Post.find().sort({ createdAt: -1 });
    } else if (sort === 'top') {
      posts = await Post.find().sort({ votes: -1 });
    } else { // 'hot'
      // A simplified version of Reddit's hot sort algorithm.
      // Score = log10(abs(votes)) + (date_in_seconds / 45000)
      const epoch = new Date('1970-01-01');
      const postsWithScore = await Post.aggregate([
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
                    45000 * 1000, // 45000 seconds in milliseconds
                  ],
                },
              ],
            },
          },
        },
        { $sort: { score: -1 } },
      ]);
      
      // Aggregate returns plain objects; manually transform to match Mongoose toJSON
      posts = postsWithScore.map(p => {
        const { _id, score, ...rest } = p;
        return { ...rest, id: _id.toString() };
      });
    }

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Create a new post
router.post('/', async (req, res) => {
  try {
    const { title, content, subreddit } = req.body;

    if (!title || !subreddit) {
      return res.status(400).json({ message: 'Title and subreddit are required' });
    }

    // In a real app, author would come from authenticated user session
    const tempAuthor = { id: 'u1', name: 'dev_user' }; 

    const newPost = new Post({
      title,
      content,
      subreddit,
      author: tempAuthor,
      votes: 1, // Start with one upvote from the author
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating post', error });
  }
});

// Get a single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get comments for a post
router.get('/:id/comments', async (req, res) => {
  try {
    // This is a simplified implementation. A real app would use pagination and handle nested comments better.
    const comments = await Comment.find({ post: req.params.id }).populate('replies');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Vote on a post
router.post('/:id/vote', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const { vote } = req.body; // 'up' or 'down'
    if (vote === 'up') {
      post.votes++;
    } else if (vote === 'down') {
      post.votes--;
    } else {
      return res.status(400).json({ message: 'Invalid vote direction' });
    }
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;