import React from 'react';
import type { Post as PostType } from '../types';
import Post from './Post';

interface PostListProps {
  posts: PostType[];
  onUpdatePost: (updatedPost: PostType) => void;
  onDeletePost: (postId: string) => void;
  // FIX: Allow JSX elements for the empty message
  emptyMessage?: React.ReactNode;
}

const PostList: React.FC<PostListProps> = ({ posts, onUpdatePost, onDeletePost, emptyMessage }) => {
  if (posts.length === 0) {
    return (
      <div className="text-center text-reddit-text-secondary p-8 bg-reddit-dark-soft rounded-md">
        {emptyMessage || 'No posts found.'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <Post 
          key={post.id} 
          post={post} 
          onUpdatePost={onUpdatePost} 
          onDeletePost={onDeletePost} 
        />
      ))}
    </div>
  );
};

export default PostList;
