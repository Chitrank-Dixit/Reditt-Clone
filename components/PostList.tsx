
import React, { useState, useEffect } from 'react';
import type { Post as PostType } from '../types';
import { getPosts } from '../services/api';
import Post from './Post';
import LoadingSpinner from './LoadingSpinner';

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const fetchedPosts = await getPosts();
        setPosts(fetchedPosts);
      } catch (err) {
        setError('Failed to fetch posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-reddit-orange text-center">{error}</div>;
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
