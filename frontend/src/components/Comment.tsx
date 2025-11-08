import React from 'react';
import { Link } from 'react-router-dom';
import type { Comment as CommentType } from '../types';
import VoteButtons from './VoteButtons';
import { ReplyIcon } from './icons/ReplyIcon';
import { timeAgo } from '../utils/time';

interface CommentProps {
  comment: CommentType;
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
  return (
    <div className="flex space-x-3">
      <div className="flex flex-col items-center">
        {/* Placeholder for avatar */}
        <div className="w-8 h-8 bg-reddit-blue rounded-full"></div>
        <div className="w-px h-full bg-reddit-border my-2"></div>
      </div>
      <div className="flex-1">
        <div className="flex items-center text-xs mb-1">
          <Link to={`/user/${comment.author.name}`} className="font-bold text-white hover:underline">{comment.author.name}</Link>
          <span className="mx-2 text-reddit-text-secondary">•</span>
          <span className="text-reddit-text-secondary">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-reddit-text-primary mb-2">{comment.content}</p>
        <div className="flex items-center space-x-1 text-xs text-reddit-text-secondary font-bold">
          <VoteButtons initialVotes={comment.votes} commentId={comment.id} />
          <div className="flex items-center space-x-1 cursor-pointer hover:bg-reddit-border p-2 rounded">
             <ReplyIcon className="h-4 w-4" />
             <span>Reply</span>
          </div>
        </div>
        
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map(reply => (
              <Comment key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;