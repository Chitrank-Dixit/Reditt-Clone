import { Router } from 'express';
import Post from '../models/Post';
import Comment from '../models/Comment';
import User from '../models/User';

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
    const { title, content, subreddit, imageUrl } = req.body;

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
      imageUrl,
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

// Update a post
router.put('/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true, runValidators: true }
    );
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    // In a real app, you would check if the authenticated user is the author of the post.
    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get comments for a post
router.get('/:id/comments', async (req, res) => {
  try {
    const sort = (req.query.sort as string) || 'best'; // default to 'best'
    
    let sortOption: Record<string, 1 | -1> = { votes: -1 }; // best
    if (sort === 'new') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'old') {
      sortOption = { createdAt: 1 };
    }

    const comments = await Comment.find({ post: req.params.id })
      .sort(sortOption)
      .populate('replies');
      
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

    let voteChange = 0;
    if (vote === 'up') {
      post.votes++;
      voteChange = 1;
    } else if (vote === 'down') {
      post.votes--;
      voteChange = -1;
    } else {
      return res.status(400).json({ message: 'Invalid vote direction' });
    }
    
    // Update author's karma
    if (voteChange !== 0) {
      await User.findOneAndUpdate({ name: post.author.name }, { $inc: { karma: voteChange } });
    }
    
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;