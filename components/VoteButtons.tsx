
import React, { useState } from 'react';
import { UpvoteIcon, DownvoteIcon } from './icons/VoteIcons';

interface VoteButtonsProps {
  initialVotes: number;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({ initialVotes }) => {
  const [votes, setVotes] = useState(initialVotes);
  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);

  const handleUpvote = () => {
    if (voteStatus === 'up') {
      setVotes(votes - 1);
      setVoteStatus(null);
    } else {
      setVotes(voteStatus === 'down' ? votes + 2 : votes + 1);
      setVoteStatus('up');
    }
  };

  const handleDownvote = () => {
    if (voteStatus === 'down') {
      setVotes(votes + 1);
      setVoteStatus(null);
    } else {
      setVotes(voteStatus === 'up' ? votes - 2 : votes - 1);
      setVoteStatus('down');
    }
  };
  
  const formatVotes = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num;
  }

  return (
    <div className="flex flex-col items-center p-2 bg-reddit-dark-soft bg-opacity-50 space-y-1">
      <button onClick={handleUpvote} className={`p-1 rounded ${voteStatus === 'up' ? 'text-reddit-orange' : 'text-reddit-text-secondary hover:bg-reddit-border'}`}>
        <UpvoteIcon className="h-6 w-6" />
      </button>
      <span className={`font-bold text-sm ${voteStatus === 'up' ? 'text-reddit-orange' : voteStatus === 'down' ? 'text-reddit-blue' : 'text-white'}`}>
        {formatVotes(votes)}
      </span>
      <button onClick={handleDownvote} className={`p-1 rounded ${voteStatus === 'down' ? 'text-reddit-blue' : 'text-reddit-text-secondary hover:bg-reddit-border'}`}>
        <DownvoteIcon className="h-6 w-6" />
      </button>
    </div>
  );
};

export default VoteButtons;
