import React, { useState, useEffect } from 'react';
import { UpvoteIcon, DownvoteIcon } from './icons/VoteIcons';
import { voteOnEntity } from '../services/api';
import type { Post, Comment as CommentType } from '../types';

interface VoteButtonsProps {
  initialVotes: number;
  postId?: string;
  commentId?: string;
  onUpdate?: (updatedEntity: Post | CommentType) => void;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({ initialVotes, postId, commentId, onUpdate }) => {
  const [votes, setVotes] = useState(initialVotes);
  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    setVotes(initialVotes);
  }, [initialVotes]);

  const handleVote = async (newStatus: 'up' | 'down') => {
    const oldVotes = votes;
    const oldVoteStatus = voteStatus;

    let newVoteCount = oldVotes;
    if (newStatus === voteStatus) { // Undoing vote
      newVoteCount = newStatus === 'up' ? oldVotes - 1 : oldVotes + 1;
      setVoteStatus(null);
    } else { // New vote or changing vote
        if (voteStatus === 'up') newVoteCount -=1;
        if (voteStatus === 'down') newVoteCount +=1;
        
        if (newStatus === 'up') newVoteCount +=1;
        if (newStatus === 'down') newVoteCount -=1;

        setVoteStatus(newStatus);
    }
    setVotes(newVoteCount);

    try {
      const entityId = postId || commentId;
      if (!entityId) throw new Error("No ID provided for voting");
      
      const entityType = postId ? 'post' : 'comment';
      const updatedEntity = await voteOnEntity(entityId, entityType, newStatus);
      if (onUpdate) {
        onUpdate(updatedEntity);
      }
    } catch (error) {
      console.error('Failed to vote:', error);
      // Revert optimistic update on failure
      setVotes(oldVotes);
      setVoteStatus(oldVoteStatus);
    }
  };

  const formatVotes = (num: number) => {
    if (num >= 10000) {
        return (num / 1000).toFixed(0) + 'k';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num;
  }

  return (
    <div className="flex flex-col items-center p-2 bg-reddit-dark-soft bg-opacity-50 space-y-1">
      <button onClick={() => handleVote('up')} className={`p-1 rounded ${voteStatus === 'up' ? 'text-reddit-orange' : 'text-reddit-text-secondary hover:bg-reddit-border'}`}>
        <UpvoteIcon className="h-6 w-6" />
      </button>
      <span className={`font-bold text-sm ${voteStatus === 'up' ? 'text-reddit-orange' : voteStatus === 'down' ? 'text-reddit-blue' : 'text-white'}`}>
        {formatVotes(votes)}
      </span>
      <button onClick={() => handleVote('down')} className={`p-1 rounded ${voteStatus === 'down' ? 'text-reddit-blue' : 'text-reddit-text-secondary hover:bg-reddit-border'}`}>
        <DownvoteIcon className="h-6 w-6" />
      </button>
    </div>
  );
};

export default VoteButtons;