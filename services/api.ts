
import type { Post, Comment } from '../types';

const MOCK_USERS = [
  { id: 'u1', name: 'dev_user' },
  { id: 'u2', name: 'react_fan' },
  { id: 'u3', name: 'tailwind_guru' },
];

const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    title: 'React 19 is coming! What are you most excited about?',
    content: 'The new compiler looks amazing. I think it will significantly improve performance for complex applications. Also, the new actions feature will simplify form handling a lot.',
    author: MOCK_USERS[0],
    subreddit: 'reactjs',
    votes: 1200,
    commentsCount: 89,
    createdAt: '8 hours ago',
    imageUrl: 'https://picsum.photos/seed/react19/800/400',
  },
  {
    id: 'p2',
    title: 'Show off your best Tailwind CSS components!',
    content: 'I created this fully responsive card component with some cool hover effects. Check out the code in the comments!',
    author: MOCK_USERS[2],
    subreddit: 'tailwindcss',
    votes: 456,
    commentsCount: 42,
    createdAt: '1 day ago',
  },
  {
    id: 'p3',
    title: 'Node.js vs. Deno vs. Bun in 2024',
    content: 'With the rise of new JavaScript runtimes, which one are you betting on for your next project and why?',
    author: MOCK_USERS[0],
    subreddit: 'node',
    votes: 789,
    commentsCount: 153,
    createdAt: '3 hours ago',
    imageUrl: 'https://picsum.photos/seed/nodejs/800/300',
  },
];

const MOCK_COMMENTS: { [postId: string]: Comment[] } = {
  'p1': [
    {
      id: 'c1-1',
      content: 'Definitely the compiler. Less manual memoization is a huge win.',
      author: MOCK_USERS[1],
      votes: 55,
      createdAt: '7 hours ago',
      replies: [
        {
          id: 'c1-1-1',
          content: 'Agreed! My code will be so much cleaner.',
          author: MOCK_USERS[0],
          votes: 23,
          createdAt: '6 hours ago',
          replies: [],
        }
      ],
    },
    {
      id: 'c1-2',
      content: 'I am a bit worried about the learning curve for the new features.',
      author: MOCK_USERS[2],
      votes: 12,
      createdAt: '5 hours ago',
      replies: [],
    }
  ],
  'p2': [],
  'p3': [
      {
        id: 'c3-1',
        content: 'Bun\'s speed is just undeniable. For new projects, it\'s a strong contender.',
        author: MOCK_USERS[2],
        votes: 40,
        createdAt: '2 hours ago',
        replies: []
      }
  ]
};

const simulateNetworkDelay = <T,>(data: T): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data);
    }, 500 + Math.random() * 500);
  });
};

export const getPosts = async (): Promise<Post[]> => {
  return simulateNetworkDelay(MOCK_POSTS);
};

export const getPostById = async (postId: string): Promise<Post> => {
  const post = MOCK_POSTS.find(p => p.id === postId);
  if (!post) {
    return Promise.reject(new Error('Post not found'));
  }
  return simulateNetworkDelay(post);
};

export const getCommentsByPostId = async (postId: string): Promise<Comment[]> => {
  const comments = MOCK_COMMENTS[postId] || [];
  return simulateNetworkDelay(comments);
};
