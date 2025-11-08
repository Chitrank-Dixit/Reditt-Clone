import React from 'react';
import { Link } from 'react-router-dom';
import type { Comment as CommentType } from '../types';
import { timeAgo } from '../utils/time';

interface UserCommentProps {
  comment: CommentType;
}

const UserComment: React.FC<UserCommentProps> = ({ comment }) => {
  return (
    <div className="p-3 bg-reddit-dark rounded-md border border-reddit-border">
      <div className="text-xs text-reddit-text-secondary mb-2">
        <Link to={`/user/${comment.author.name}`} className="font-bold text-white hover:underline">{comment.author.name}</Link>
        <span> commented on </span>
        <Link to={`/post/${comment.post?.id}`} className="font-bold text-white hover:underline truncate">
          {comment.post?.title || 'a post'}
        </Link>
        <span> • {timeAgo(comment.createdAt)}</span>
      </div>
      <div className="p-3 border-l-2 border-reddit-border">
        <p className="text-sm text-reddit-text-primary">
          {comment.content}
        </p>
      </div>
    </div>
  );
};

export default UserComment;
