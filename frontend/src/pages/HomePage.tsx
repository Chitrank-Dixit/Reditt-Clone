import React, { useState, useEffect } from 'react';
import PostList from '../components/PostList';
import Sidebar from '../components/Sidebar';
import CreatePost from '../components/CreatePost';
import LoadingSpinner from '../components/LoadingSpinner';
import SortBar from '../components/SortBar';
import type { Post as PostType } from '../types';
import { getPosts } from '../services/api';

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState('hot');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedPosts = await getPosts(sort);
        setPosts(fetchedPosts);
      } catch (err) {
        setError('Failed to fetch posts.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [sort]);
  
  const handlePostCreated = (newPost: PostType) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
    // Optionally, switch to 'new' sort to see the post at the top
    if (sort !== 'new') {
        setSort('new');
    }
  };

  const handlePostUpdated = (updatedPost: PostType) => {
    setPosts(prevPosts =>
      prevPosts.map(p => (p.id === updatedPost.id ? updatedPost : p))
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <CreatePost onPostCreated={handlePostCreated} />
        <SortBar currentSort={sort} onSortChange={setSort} />
        {loading && <LoadingSpinner />}
        {error && <div className="text-reddit-orange text-center p-4 bg-reddit-dark-soft rounded">{error}</div>}
        {!loading && !error && <PostList posts={posts} onUpdatePost={handlePostUpdated} emptyMessage="No posts to show. Try creating one or changing the sort option." />}
      </div>
      <div className="hidden md:block">
        <Sidebar />
      </div>
    </div>
  );
};

export default HomePage;