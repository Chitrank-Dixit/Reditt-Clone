import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PostList from '../components/PostList';
import Sidebar from '../components/Sidebar';
import CreatePost from '../components/CreatePost';
import LoadingSpinner from '../components/LoadingSpinner';
import SortBar from '../components/SortBar';
import type { Post as PostType } from '../types';
import { getPosts } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState('hot');
  const { user } = useAuth();

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
  }, [sort, user]);
  
  const handlePostCreated = (newPost: PostType) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
    if (sort !== 'new') {
        setSort('new');
    }
  };

  const handlePostUpdated = (updatedPost: PostType) => {
    setPosts(prevPosts =>
      prevPosts.map(p => (p.id === updatedPost.id ? updatedPost : p))
    );
  };

  const handlePostDeleted = (deletedPostId: string) => {
    setPosts(prevPosts => prevPosts.filter(p => p.id !== deletedPostId));
  };
  
  const getEmptyMessage = () => {
      if(user) {
          return (
            <div className="text-center">
                <p>Your personal feed is empty.</p>
                <p className="mt-2">Join some communities to get started!</p>
                <Link to="/r/reactjs" className="mt-4 inline-block bg-reddit-blue text-white font-bold py-2 px-4 rounded-full text-sm">
                    Explore r/reactjs
                </Link>
            </div>
          );
      }
      return 'There are no posts here. Maybe the server is sleeping?';
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        {user && <CreatePost onPostCreated={handlePostCreated} />}
        <SortBar currentSort={sort} onSortChange={setSort} />
        {loading && <LoadingSpinner />}
        {error && <div className="text-reddit-orange text-center p-4 bg-reddit-dark-soft rounded">{error}</div>}
        {!loading && !error && <PostList posts={posts} onUpdatePost={handlePostUpdated} onDeletePost={handlePostDeleted} emptyMessage={getEmptyMessage()} />}
      </div>
      <div className="hidden md:block">
        <Sidebar />
      </div>
    </div>
  );
};

export default HomePage;