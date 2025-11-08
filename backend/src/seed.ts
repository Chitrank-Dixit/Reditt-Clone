import mongoose from 'mongoose';
import 'dotenv/config';
import Post from './models/Post';
import Comment from './models/Comment';
import User from './models/User';
import Subreddit from './models/Subreddit';
import bcrypt from 'bcryptjs';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/reddit-clone';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for seeding');

    console.log('Clearing old data...');
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await User.deleteMany({});
    await Subreddit.deleteMany({});

    console.log('Seeding users...');
    const users = await User.create([
      { name: 'dev_user', email: 'dev@example.com', password: 'password123', bio: 'Full-stack developer.', avatarUrl: 'https://picsum.photos/seed/dev_user/200', karma: 2450, role: 'admin' },
      { name: 'react_fan', email: 'react@example.com', password: 'password123', bio: 'Frontend enthusiast.', joinDate: new Date('2022-08-15T10:00:00.000Z'), karma: 850 },
      { name: 'tailwind_guru', email: 'tailwind@example.com', password: 'password123', bio: 'Making the web beautiful.', avatarUrl: null, joinDate: new Date('2021-03-22T14:30:00.000Z'), karma: 1200 },
    ]);
    
    console.log('Seeding subreddits...');
    const subreddits = await Subreddit.create([
        { name: 'reactjs', description: 'A community for React developers.', creator: users[0]._id, members: [users[0]._id, users[1]._id] },
        { name: 'tailwindcss', description: 'The official community for Tailwind CSS.', creator: users[2]._id, members: [users[0]._id, users[2]._id] },
        { name: 'node', description: 'All about the Node.js JavaScript runtime.', creator: users[0]._id, members: [users[0]._id] },
    ]);

    // Update users with joined subreddits
    await User.findByIdAndUpdate(users[0]._id, { $addToSet: { joinedSubreddits: [subreddits[0]._id, subreddits[1]._id, subreddits[2]._id] } });
    await User.findByIdAndUpdate(users[1]._id, { $addToSet: { joinedSubreddits: [subreddits[0]._id] } });
    await User.findByIdAndUpdate(users[2]._id, { $addToSet: { joinedSubreddits: [subreddits[1]._id] } });

    console.log('Seeding posts...');
    const posts = await Post.insertMany([
      {
        _id: new mongoose.Types.ObjectId('652f8d6a9e1e83c2c1c4a9a1'),
        title: 'React 19 is coming! What are you most excited about?',
        content: 'The new compiler looks amazing. I think it will significantly improve performance for complex applications. Also, the new actions feature will simplify form handling a lot.',
        author: users[0]._id,
        subreddit: subreddits[0]._id,
        votes: 1200,
        commentsCount: 2,
        imageUrl: 'https://picsum.photos/seed/react19/800/400',
      },
      {
        _id: new mongoose.Types.ObjectId('652f8d6a9e1e83c2c1c4a9a2'),
        title: 'Show off your best Tailwind CSS components!',
        content: 'I created this fully responsive card component with some cool hover effects. Check out the code in the comments!',
        author: users[2]._id,
        subreddit: subreddits[1]._id,
        votes: 456,
        commentsCount: 0,
      },
      {
        _id: new mongoose.Types.ObjectId('652f8d6a9e1e83c2c1c4a9a3'),
        title: 'Node.js vs. Deno vs. Bun in 2024',
        content: 'With the rise of new JavaScript runtimes, which one are you betting on for your next project and why?',
        author: users[0]._id,
        subreddit: subreddits[2]._id,
        votes: 789,
        commentsCount: 1,
        imageUrl: 'https://picsum.photos/seed/nodejs/800/300',
      },
    ]);
    
    console.log('Seeding comments...');

    const reply = await Comment.create({
        content: 'Agreed! My code will be so much cleaner.',
        author: users[0]._id,
        votes: 23,
        post: posts[0]._id,
        replies: [],
    });

    await Comment.insertMany([
        {
            content: 'Definitely the compiler. Less manual memoization is a huge win.',
            author: users[1]._id,
            votes: 55,
            post: posts[0]._id,
            replies: [reply._id],
        },
        {
            content: 'I am a bit worried about the learning curve for the new features.',
            author: users[2]._id,
            votes: 12,
            post: posts[0]._id,
            replies: [],
        },
        {
            content: 'Bun\'s speed is just undeniable. For new projects, it\'s a strong contender.',
            author: users[2]._id,
            votes: 40,
            post: posts[2]._id,
            replies: [],
        }
    ]);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

seedDatabase();