import React, { useState, useEffect } from 'react';
import { joinSubreddit, leaveSubreddit } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { Subreddit } from '../types';

interface JoinLeaveButtonProps {
  subreddit: Subreddit;
  onUpdate: (updatedSubreddit: Subreddit) => void;
}

const JoinLeaveButton: React.FC<JoinLeaveButtonProps> = ({ subreddit, onUpdate }) => {
  // FIX: Destructure isMemberOf and fetchUserProfile from useAuth
  const { user, isMemberOf, fetchUserProfile } = useAuth();
  const [isMember, setIsMember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (user && subreddit) {
      setIsMember(isMemberOf(subreddit.id));
    } else {
      setIsMember(false);
    }
  }, [user, subreddit, isMemberOf]);

  const handleToggleMembership = async () => {
    if (!user || !subreddit) return;

    setIsLoading(true);
    const wasMember = isMember;
    
    // Optimistic UI update
    setIsMember(!wasMember);
    onUpdate({
        ...subreddit,
        memberCount: wasMember ? subreddit.memberCount - 1 : subreddit.memberCount + 1,
    });


    try {
      const updatedSubreddit = wasMember 
        ? await leaveSubreddit(subreddit.id) 
        : await joinSubreddit(subreddit.id);
      
      onUpdate(updatedSubreddit);
      await fetchUserProfile(); // Refresh user profile in context

    } catch (error) {
      console.error('Failed to update membership:', error);
      // Revert UI on failure
      setIsMember(wasMember);
       onUpdate({
        ...subreddit,
        // Revert member count too
        memberCount: subreddit.memberCount,
    });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null; // Don't show the button for guests
  }

  return (
    <button
      onClick={handleToggleMembership}
      disabled={isLoading}
      className={`font-bold py-2 px-6 rounded-full w-28 text-center transition-colors duration-200 ${
        isMember
          ? 'bg-reddit-dark-soft border border-reddit-border text-reddit-text-secondary hover:bg-reddit-border'
          : 'bg-reddit-blue text-white hover:bg-opacity-80'
      }`}
    >
      {isLoading ? '...' : isMember ? 'Joined' : 'Join'}
    </button>
  );
};

export default JoinLeaveButton;
