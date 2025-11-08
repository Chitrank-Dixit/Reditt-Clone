export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface ProfileUser {
  id: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  joinDate: string;
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
  updatedAt: string;
  imageUrl?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
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
  content: string;
  subreddit: string;
  imageUrl?: string;
}

export interface UpdatePostPayload {
  title: string;
  content: string;
}