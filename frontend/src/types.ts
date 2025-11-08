export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

// User object derived from the JWT token
export interface AuthUser {
    id: string;
    name: string;
    iat: number;
}

export interface ProfileUser {
  id: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  joinDate: string;
  karma: number;
}

export interface Post {
  id: string;
  title: string;
  content?: string;
  author: { id: string, name: string };
  subreddit: string;
  votes: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  postType: 'text' | 'link';
  linkUrl?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: { id: string, name: string };
  votes: number;
  createdAt: string;
  updatedAt: string;
  replies: Comment[];
  post?: {
    id: string;
    title: string;
  }
}

export interface NewPostPayload {
  title: string;
  subreddit: string;
  content?: string;
  imageUrl?: string;
  postType: 'text' | 'link';
  linkUrl?: string;
}

export interface UpdatePostPayload {
  title: string;
  content: string;
}