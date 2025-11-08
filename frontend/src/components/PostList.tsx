import React from 'react';
import type { Post as PostType } from '../types';
import Post from './Post';

interface PostListProps {
  posts: PostType[];
  emptyMessage?: string;
}

const PostList: React.FC<PostListProps> = ({ posts, emptyMessage }) => {
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
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;