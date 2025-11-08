import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Comment as CommentType } from '../types';
import VoteButtons from './VoteButtons';
import { ReplyIcon } from './icons/ReplyIcon';
import { timeAgo } from '../utils/time';
import { replyToComment, updateComment, deleteComment } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { EditIcon } from './icons/EditIcon';
import { DeleteIcon } from './icons/DeleteIcon';

interface CommentProps {
  comment: CommentType;
  onDelete?: (commentId: string) => void;
}

const Comment: React.FC<CommentProps> = ({ comment: initialComment, onDelete }) => {
  const [comment, setComment] = useState(initialComment);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);

  const { user } = useAuth();
  
  const isAuthor = user?.id === comment.author.id;

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

  const handleEdit = () => {
    setEditedContent(comment.content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSaveEdit = async () => {
    if (editedContent.trim() === '') {
        setError('Comment cannot be empty.');
        return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
        const updatedComment = await updateComment(comment.id, editedContent);
        setComment(updatedComment);
        setIsEditing(false);
    } catch (err) {
        setError('Failed to save changes.');
        console.error(err);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
        try {
            await deleteComment(comment.id);
            if (onDelete) {
                onDelete(comment.id);
            }
        } catch (err) {
            setError('Failed to delete comment.');
            console.error(err);
        }
    }
  };

  const handleReplyDeleted = (deletedReplyId: string) => {
    setComment(prevComment => ({
        ...prevComment,
        replies: prevComment.replies.filter(reply => reply.id !== deletedReplyId)
    }));
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

        {isEditing ? (
            <div className="space-y-2 my-2">
                <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={3}
                    className="w-full bg-reddit-dark border border-reddit-border rounded-md py-2 px-3 text-sm text-reddit-text-primary focus:outline-none focus:ring-1 focus:ring-white"
                />
                <div className="flex justify-end space-x-2">
                    <button onClick={handleCancelEdit} className="text-reddit-text-secondary font-bold text-xs py-2 px-3 rounded-full hover:bg-reddit-border">Cancel</button>
                    <button onClick={handleSaveEdit} disabled={isSubmitting} className="bg-reddit-blue text-white font-bold text-xs py-2 px-4 rounded-full hover:bg-opacity-80 disabled:bg-gray-500">
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        ) : (
            <p className="text-sm text-reddit-text-primary mb-2">{comment.content}</p>
        )}
        
        <div className="flex items-center space-x-1 text-xs text-reddit-text-secondary font-bold">
          <VoteButtons initialVotes={comment.votes} commentId={comment.id} />
          {user && (
            <button onClick={handleToggleReply} className="flex items-center space-x-1 cursor-pointer hover:bg-reddit-border p-2 rounded">
              <ReplyIcon className="h-4 w-4" />
              <span>Reply</span>
            </button>
          )}
           {isAuthor && !isEditing && (
            <>
                <button onClick={handleEdit} className="flex items-center space-x-1 cursor-pointer hover:bg-reddit-border p-2 rounded">
                    <EditIcon className="h-4 w-4" />
                    <span>Edit</span>
                </button>
                <button onClick={handleDelete} className="flex items-center space-x-1 cursor-pointer hover:bg-reddit-border p-2 rounded text-reddit-orange">
                    <DeleteIcon className="h-4 w-4" />
                    <span>Delete</span>
                </button>
            </>
           )}
        </div>
        
        {error && <p className="text-xs text-reddit-orange mt-2">{error}</p>}
        
        {user && isReplying && (
          <form onSubmit={handleReplySubmit} className="mt-3 ml-4 space-y-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Replying to ${comment.author.name}`}
              rows={3}
              className="w-full bg-reddit-dark border border-reddit-border rounded-md py-2 px-3 text-sm text-reddit-text-primary focus:outline-none focus:ring-1 focus:ring-white"
            />
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
              <Comment key={reply.id} comment={reply} onDelete={handleReplyDeleted} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;