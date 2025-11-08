import { Router } from 'express';
import Post from '../models/Post';
import Comment from '../models/Comment';
import User from '../models/User';
import Subreddit from '../models/Subreddit';
import auth from '../middleware/auth';

const router = Router();

// Get all posts (personalized feed for logged-in users, global for guests)
router.get('/', async (req, res) => {
  try {
    const sort = (req.query.sort as string) || 'hot';
    const userId = req.user?.id;
    
    let query: any = {};
    if (userId) {
        const user = await User.findById(userId);
        if (user && user.joinedSubreddits.length > 0) {
            query.subreddit = { $in: user.joinedSubreddits };
        } else if (user) {
            // If user has joined no subreddits, return an empty feed
            return res.json([]);
        }
    }
    
    // Always filter removed posts for all users
    query.status = 'visible';

    let posts;

    const findQuery = Post.find(query).populate('author', 'name').populate('subreddit', 'name');

    if (sort === 'new') {
      posts = await findQuery.sort({ createdAt: -1 });
    } else if (sort === 'top') {
      posts = await findQuery.sort({ votes: -1 });
    } else if (sort === 'controversial') {
        posts = await findQuery.sort({ commentsCount: -1, votes: 1 });
    }
     else { // 'hot'
      const epoch = new Date('1970-01-01');
      const documents = await Post.find(query).populate('author', 'name').populate('subreddit', 'name');
      
      const scoredPosts = documents.map(post => {
        const score = Math.log10(Math.max(1, Math.abs(post.votes))) + 
                      (post.createdAt.getTime() - epoch.getTime()) / (45000 * 1000);
        return { ...post.toJSON(), score };
      });
      
      scoredPosts.sort((a, b) => b.score - a.score);
      posts = scoredPosts;
    }

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Create a new post
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, subreddit: subredditName, imageUrl, postType, linkUrl } = req.body;

    if (!title || !subredditName) {
      return res.status(400).json({ message: 'Title and subreddit are required' });
    }

    const subreddit = await Subreddit.findOne({ name: subredditName });
    if (!subreddit) {
      return res.status(404).json({ message: `Subreddit '${subredditName}' not found` });
    }

    const newPost = new Post({
      title,
      content,
      subreddit: subreddit._id,
      author: req.user.id,
      votes: 1,
      imageUrl,
      postType,
      linkUrl,
    });

    await newPost.save();
    const populatedPost = await Post.findById(newPost._id).populate('author', 'name').populate('subreddit', 'name');
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating post', error });
  }
});

// Get a single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name').populate('subreddit', 'name');
    if (!post || post.status === 'removed') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update a post
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id) {
        return res.status(403).json({ message: 'User not authorized to edit this post' });
    }

    post.title = title;
    post.content = content || undefined;
    await post.save();
    
    const populatedPost = await Post.findById(post._id).populate('author', 'name').populate('subreddit', 'name');
    res.json(populatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete a post
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to delete this post' });
        }
        
        await Comment.deleteMany({ post: post._id });
        await Post.findByIdAndDelete(req.params.id);
        
        res.status(204).send();

    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Get comments for a post
router.get('/:id/comments', async (req, res) => {
  try {
    const sort = (req.query.sort as string) || 'best';
    
    let sortOption: Record<string, 1 | -1> = { votes: -1 }; // best
    if (sort === 'new') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'old') {
      sortOption = { createdAt: 1 };
    }

    const populateReplies = async (comments: any[]): Promise<any[]> => {
        for (let i = 0; i < comments.length; i++) {
            if (comments[i].replies && comments[i].replies.length > 0) {
                const populatedReplies = await Comment.find({ '_id': { $in: comments[i].replies } }).populate('author', 'name');
                comments[i].replies = await populateReplies(populatedReplies);
            }
        }
        return comments;
    };

    const topLevelComments = await Comment.find({ post: req.params.id, parentComment: { $exists: false } })
      .sort(sortOption)
      .populate('author', 'name');
    
    const commentsWithPopulatedReplies = await populateReplies(topLevelComments);

    res.json(commentsWithPopulatedReplies);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Vote on a post
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author');
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
    
    if (voteChange !== 0 && post.author instanceof User) {
      await User.findByIdAndUpdate(post.author._id, { $inc: { karma: voteChange } });
    }
    
    await post.save();
    const populatedPost = await Post.findById(post._id).populate('author', 'name').populate('subreddit', 'name');
    res.json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;