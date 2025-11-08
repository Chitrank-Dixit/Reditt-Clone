import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSubreddit } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const CreateSubredditPage: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect guest users away
    if (!user) {
        navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      setError('Name and description cannot be empty.');
      return;
    }
    if (/\s/.test(name)) {
        setError('Community name cannot contain spaces.');
        return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const newSubreddit = await createSubreddit({ name, description });
      navigate(`/r/${newSubreddit.name}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create community. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
      return null; // Render nothing while redirecting
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-reddit-dark-soft border border-reddit-border rounded-md p-6">
        <h1 className="text-xl font-bold text-white border-b border-reddit-border pb-4 mb-4">
          Create a community
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-reddit-text-primary mb-1">Name</label>
            <p className="text-xs text-reddit-text-secondary mb-2">Community names including capitalization cannot be changed.</p>
            <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-reddit-text-secondary">r/</span>
                <input
                  id="name"
                  type="text"
                  maxLength={21}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-reddit-dark border border-reddit-border rounded-md py-2 pl-7 pr-3 text-reddit-text-primary focus:outline-none focus:ring-1 focus:ring-white"
                  required
                />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-bold text-reddit-text-primary mb-1">Description</label>
            <p className="text-xs text-reddit-text-secondary mb-2">This is how new members come to understand your community.</p>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              className="w-full bg-reddit-dark border border-reddit-border rounded-md py-2 px-3 text-reddit-text-primary focus:outline-none focus:ring-1 focus:ring-white"
              required
            />
          </div>
          {error && <p className="text-reddit-orange text-sm text-center">{error}</p>}
          <div className="flex justify-end pt-4 border-t border-reddit-border">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-reddit-blue text-white font-bold py-2 px-6 rounded-full hover:bg-opacity-80 transition-colors duration-200 disabled:bg-gray-500"
            >
              {isSubmitting ? 'Creating...' : 'Create Community'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSubredditPage;