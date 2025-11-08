import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserByUsername, updateUserProfile } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const EditProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!username) {
        setError('Username not found.');
        setIsLoading(false);
        return;
      }
      try {
        const user = await getUserByUsername(username);
        setBio(user.bio || '');
      } catch (err) {
        setError('Failed to fetch user profile.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [username]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    setIsSaving(true);
    setError(null);
    try {
      await updateUserProfile(username, { bio });
      navigate(`/user/${username}`);
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/user/${username}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-reddit-dark-soft border border-reddit-border rounded-md p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Edit Profile</h1>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-reddit-text-secondary mb-2">
            Display Name (Username)
          </label>
          <input
            id="displayName"
            type="text"
            value={username}
            readOnly
            className="w-full bg-reddit-dark border border-reddit-border rounded-md py-2 px-3 text-reddit-text-secondary focus:outline-none cursor-not-allowed"
          />
           <p className="text-xs text-reddit-text-secondary mt-1">Usernames cannot be changed.</p>
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-reddit-text-secondary mb-2">
            About (Bio)
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full bg-reddit-dark border border-reddit-border rounded-md py-2 px-3 text-reddit-text-primary focus:outline-none focus:ring-1 focus:ring-white"
            placeholder="A little about yourself"
          />
        </div>
        
        {error && <p className="text-sm text-reddit-orange">{error}</p>}

        <div className="flex justify-end items-center space-x-4 pt-4">
           <button
            type="button"
            onClick={handleCancel}
            className="text-reddit-text-secondary font-bold py-2 px-4 rounded-full hover:bg-reddit-border transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="bg-reddit-blue text-white font-bold py-2 px-6 rounded-full hover:bg-opacity-80 transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfilePage;
