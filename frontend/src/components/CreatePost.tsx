import React, { useState } from 'react';
import { createPost } from '../services/api';
import type { Post, NewPostPayload } from '../types';

interface CreatePostProps {
  onPostCreated: (newPost: Post) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subreddit, setSubreddit] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subreddit.trim()) {
      setError('Title and subreddit are required.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    const payload: NewPostPayload = { title, content, subreddit };

    try {
      const newPost = await createPost(payload);
      onPostCreated(newPost);
      // Reset form
      setTitle('');
      setContent('');
      setSubreddit('');
    } catch (err) {
      setError('Failed to create post. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-reddit-dark-soft border border-reddit-border rounded-md p-4 mb-4">
      <h2 className="text-lg font-bold text-reddit-text-primary mb-4">Create a Post</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Subreddit (e.g., reactjs)"
            value={subreddit}
            onChange={(e) => setSubreddit(e.target.value)}
            className="w-full bg-reddit-dark border border-reddit-border rounded-md py-2 px-3 text-reddit-text-primary focus:outline-none focus:ring-1 focus:ring-white"
            required
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-reddit-dark border border-reddit-border rounded-md py-2 px-3 text-reddit-text-primary focus:outline-none focus:ring-1 focus:ring-white"
            required
          />
        </div>
        <div>
          <textarea
            placeholder="Text (optional)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full bg-reddit-dark border border-reddit-border rounded-md py-2 px-3 text-reddit-text-primary focus:outline-none focus:ring-1 focus:ring-white"
          />
        </div>
        {error && <p className="text-reddit-orange text-sm">{error}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !title || !subreddit}
            className="bg-reddit-blue text-white font-bold py-2 px-6 rounded-full hover:bg-opacity-80 transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
