import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Post as PostType, Subreddit } from '../types';
import { getSubredditByName, getSubredditPosts } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PostList from '../components/PostList';
import JoinLeaveButton from '../components/JoinLeaveButton';
import { useAuth } from '../hooks/useAuth';

const SubredditPage: React.FC = () => {
  const { subredditName } = useParams<{ subredditName: string }>();
  
  const [subreddit, setSubreddit] = useState<Subreddit | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchSubredditData = async () => {
      if (!subredditName) return;
      try {
        setLoading(true);
        setError(null);
        const [subredditData, postData] = await Promise.all([
          getSubredditByName(subredditName),
          getSubredditPosts(subredditName)
        ]);
        setSubreddit(subredditData);
        setPosts(postData);
      } catch (err) {
        console.error(err);
        setError(`Subreddit r/${subredditName} not found.`);
      } finally {
        setLoading(false);
      }
    };
    fetchSubredditData();
  }, [subredditName]);

    const handlePostUpdated = (updatedPost: PostType) => {
        setPosts(prevPosts =>
            prevPosts.map(p => (p.id === updatedPost.id ? updatedPost : p))
        );
    };

    const handlePostDeleted = (deletedPostId: string) => {
        setPosts(prevPosts => prevPosts.filter(p => p.id !== deletedPostId));
    };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !subreddit) {
    return (
      <div className="text-center text-reddit-orange">
        <p>{error || 'Subreddit not found.'}</p>
        <Link to="/" className="text-reddit-blue hover:underline mt-4 block">Go back home</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <div className="bg-reddit-dark-soft border border-reddit-border rounded-md p-4">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-white">r/{subreddit.name}</h1>
                    <p className="text-sm text-reddit-text-secondary">{subreddit.description}</p>
                </div>
                {user && <JoinLeaveButton subreddit={subreddit} onUpdate={setSubreddit} />}
            </div>
            <p className="text-xs text-reddit-text-secondary mt-2">{subreddit.memberCount.toLocaleString()} members</p>
        </div>
        <PostList 
            posts={posts} 
            onUpdatePost={handlePostUpdated} 
            onDeletePost={handlePostDeleted}
            emptyMessage={`No posts in r/${subreddit.name} yet.`}
        />
      </div>
      <div className="hidden md:block">
        <div className="bg-reddit-dark-soft border border-reddit-border rounded-md p-4 sticky top-20">
            <h3 className="text-white font-bold border-b border-reddit-border pb-2 mb-3">About Community</h3>
            <p className="text-sm text-reddit-text-secondary mb-3">{subreddit.description}</p>
            <p className="text-sm text-white font-bold">{subreddit.memberCount.toLocaleString()} Members</p>
            <p className="text-xs text-reddit-text-secondary">Created {new Date(subreddit.createdAt).toLocaleDateString()}</p>
            {user && (
                 <Link to="/" className="mt-4 w-full block text-center bg-reddit-blue text-white font-bold py-2 px-4 rounded-full text-sm">
                    Create Post
                </Link>
            )}
        </div>
      </div>
    </div>
  );
};

export default SubredditPage;