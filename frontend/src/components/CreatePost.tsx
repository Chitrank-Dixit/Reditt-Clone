import React, { useState } from 'react';
import { createPost } from '../services/api';
import type { Post, NewPostPayload } from '../types';

interface CreatePostProps {
  onPostCreated: (newPost: Post) => void;
}

type PostType = 'text' | 'link';

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const [postType, setPostType] = useState<PostType>('text');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subreddit, setSubreddit] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const resetForm = () => {
      setTitle('');
      setContent('');
      setSubreddit('');
      setImageUrl('');
      setLinkUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subreddit.trim() || (postType === 'link' && !linkUrl.trim())) {
      setError('Title, subreddit, and a valid link (for link posts) are required.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    const payload: NewPostPayload = { 
        title, 
        subreddit, 
        postType,
        ...(postType === 'text' && { content, imageUrl }),
        ...(postType === 'link' && { linkUrl })
    };

    try {
      const newPost = await createPost(payload);
      onPostCreated(newPost);
      resetForm();
    } catch (err) {
      setError('Failed to create post. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const TabButton: React.FC<{ type: PostType; label: string }> = ({ type, label }) => (
      <button
          type="button"
          onClick={() => setPostType(type)}
          className={`w-full py-2 px-4 font-bold rounded-t-md ${postType === type ? 'bg-reddit-dark-soft text-reddit-blue' : 'bg-reddit-dark text-reddit-text-secondary hover:bg-reddit-border'}`}
      >
          {label}
      </button>
  )

  return (
    <div className="border border-reddit-border rounded-md mb-4">
      <div className="flex">
        <TabButton type="text" label="Text Post" />
        <TabButton type="link" label="Link Post" />
      </div>
      <div className="bg-reddit-dark-soft p-4">
        <h2 className="text-lg font-bold text-reddit-text-primary mb-4">Create a {postType === 'text' ? 'Text' : 'Link'} Post</h2>
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

          {postType === 'text' && (
              <>
                <div>
                  <input
                    type="text"
                    placeholder="Image URL (optional)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-reddit-dark border border-reddit-border rounded-md py-2 px-3 text-reddit-text-primary focus:outline-none focus:ring-1 focus:ring-white"
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
              </>
          )}
          {postType === 'link' && (
              <div>
                  <input
                      type="url"
                      placeholder="URL"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="w-full bg-reddit-dark border border-reddit-border rounded-md py-2 px-3 text-reddit-text-primary focus:outline-none focus:ring-1 focus:ring-white"
                      required
                  />
              </div>
          )}

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
    </div>
  );
};

export default CreatePost;