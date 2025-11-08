import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Comment as CommentType } from '../types';
import VoteButtons from './VoteButtons';
import { ReplyIcon } from './icons/ReplyIcon';
import { timeAgo } from '../utils/time';
import { replyToComment } from '../services/api';

interface CommentProps {
  comment: CommentType;
}

const Comment: React.FC<CommentProps> = ({ comment: initialComment }) => {
  const [comment, setComment] = useState(initialComment);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleReply = () => {
    setIsReplying(prev => !prev);
    setError(null);
    setReplyContent('');
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) {
      setError('Reply cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newReply = await replyToComment(comment.id, replyContent);
      setComment(prevComment => ({
        ...prevComment,
        replies: [...prevComment.replies, newReply]
      }));
      setIsReplying(false);
      setReplyContent('');
    } catch (err) {
      setError('Failed to submit reply. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <button onClick={handleToggleReply} className="flex items-center space-x-1 cursor-pointer hover:bg-reddit-border p-2 rounded">
             <ReplyIcon className="h-4 w-4" />
             <span>Reply</span>
          </button>
        </div>
        
        {isReplying && (
          <form onSubmit={handleReplySubmit} className="mt-3 ml-4 space-y-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Replying to ${comment.author.name}`}
              rows={3}
              className="w-full bg-reddit-dark border border-reddit-border rounded-md py-2 px-3 text-sm text-reddit-text-primary focus:outline-none focus:ring-1 focus:ring-white"
            />
            {error && <p className="text-xs text-reddit-orange">{error}</p>}
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={handleToggleReply} className="text-reddit-text-secondary font-bold text-xs py-2 px-3 rounded-full hover:bg-reddit-border transition-colors">
                  Cancel
              </button>
              <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-reddit-blue text-white font-bold text-xs py-2 px-4 rounded-full hover:bg-opacity-80 transition-colors disabled:bg-gray-500"
              >
                  {isSubmitting ? 'Replying...' : 'Reply'}
              </button>
            </div>
          </form>
        )}
        
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