
export interface User {
  id: string;
  name: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  subreddit: string;
  votes: number;
  commentsCount: number;
  createdAt: string;
  imageUrl?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  votes: number;
  createdAt: string;
  replies: Comment[];
}
