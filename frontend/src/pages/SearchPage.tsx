import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchAll } from '../services/api';
import type { SearchResults, Post as PostType } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import PostList from '../components/PostList';
import UserComment from '../components/UserComment';
import SubredditListItem from '../components/SubredditListItem';

type View = 'posts' | 'comments' | 'communities';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('posts');

  useEffect(() => {
    const performSearch = async () => {
      if (!query) {
        setResults(null);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const searchResults = await searchAll(query);
        setResults(searchResults);
        // Default view to the first tab with results
        if (searchResults.posts.length > 0) {
          setView('posts');
        } else if (searchResults.comments.length > 0) {
          setView('comments');
        } else if (searchResults.subreddits.length > 0) {
          setView('communities');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch search results.');
      } finally {
        setLoading(false);
      }
    };
    performSearch();
  }, [query]);

  const handlePostUpdated = (updatedPost: PostType) => {
    setResults(prev => prev ? {
        ...prev,
        posts: prev.posts.map(p => p.id === updatedPost.id ? updatedPost : p)
    } : null);
  };

  const handlePostDeleted = (deletedPostId: string) => {
     setResults(prev => prev ? {
        ...prev,
        posts: prev.posts.filter(p => p.id !== deletedPostId)
    } : null);
  };

  const TabButton: React.FC<{ tabName: View; label: string, count: number }> = ({ tabName, label, count }) => (
    <button
      onClick={() => setView(tabName)}
      disabled={count === 0}
      className={`py-2 px-4 font-bold text-sm border-b-2 transition-colors duration-200 disabled:text-reddit-text-secondary/50 ${
        view === tabName
          ? 'text-white border-reddit-blue'
          : 'text-reddit-text-secondary border-transparent hover:text-white hover:border-reddit-text-secondary'
      }`}
    >
      {label} ({count})
    </button>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-reddit-orange">{error}</div>;
  }

  if (!query) {
    return <div className="text-center text-reddit-text-secondary">Please enter a search term.</div>;
  }

  if (!results || (results.posts.length === 0 && results.comments.length === 0 && results.subreddits.length === 0)) {
    return (
        <div className="text-center text-reddit-text-secondary">
            <p className="font-bold text-lg text-white">No results found for "{query}"</p>
            <p>Try searching for something else.</p>
        </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-4">Search results for "{query}"</h1>
      <div className="bg-reddit-dark-soft border border-reddit-border rounded-md">
        <div className="flex border-b border-reddit-border">
          <TabButton tabName="posts" label="Posts" count={results.posts.length} />
          <TabButton tabName="comments" label="Comments" count={results.comments.length} />
          <TabButton tabName="communities" label="Communities" count={results.subreddits.length} />
        </div>
        <div className="p-4">
          {view === 'posts' && (
            <PostList
              posts={results.posts}
              onUpdatePost={handlePostUpdated}
              onDeletePost={handlePostDeleted}
              emptyMessage="No posts matched your search."
            />
          )}
          {view === 'comments' && (
            <div className="space-y-4">
              {results.comments.map(comment => <UserComment key={comment.id} comment={comment} />)}
            </div>
          )}
          {view === 'communities' && (
            <div className="space-y-2">
                {results.subreddits.map(sub => <SubredditListItem key={sub.id} subreddit={sub} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
