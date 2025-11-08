import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Post as PostType } from '../types';
import VoteButtons from './VoteButtons';
import { CommentIcon } from './icons/CommentIcon';
import { ShareIcon } from './icons/ShareIcon';
import { SaveIcon } from './icons/SaveIcon';
import { timeAgo } from '../utils/time';

interface PostProps {
  post: PostType;
  isLink?: boolean;
}

const Post: React.FC<PostProps> = ({ post, isLink = true }) => {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const handleUserLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleToggleComments = (e: React.MouseEvent) => {
    // This button should only toggle when the post is a link in a feed.
    // On the detail page, comments are displayed separately.
    if (isLink) {
      e.preventDefault();
      e.stopPropagation();
      setIsCommentsOpen(prev => !prev);
    }
  };

  const PostContent = () => (
    <>
      <div className="p-4">
        <div className="flex items-center text-xs text-reddit-text-secondary mb-2">
          <span className="font-bold text-reddit-text-primary">r/{post.subreddit}</span>
          <span className="mx-1">•</span>
          <span>Posted by&nbsp;
            <Link 
              to={`/user/${post.author.name}`} 
              className="hover:underline"
              onClick={handleUserLinkClick}
            >
              u/{post.author.name}
            </Link>
          </span>
          <span className="mx-1">•</span>
          <span>{timeAgo(post.createdAt)}</span>
        </div>
        <h2 className="text-xl font-bold text-reddit-text-primary mb-2">{post.title}</h2>
        {post.imageUrl && (
            <div className="my-3 max-h-96 overflow-hidden rounded-lg flex justify-center items-center bg-black">
                <img src={post.imageUrl} alt={post.title} className="max-h-96 object-contain" />
            </div>
        )}
        <p className="text-reddit-text-primary text-sm leading-relaxed">{post.content}</p>
      </div>
      <div className="flex items-center space-x-4 p-4 pt-2 text-reddit-text-secondary font-bold text-sm">
        <button
          onClick={handleToggleComments}
          className={`flex items-center space-x-1 p-2 rounded ${isLink ? 'hover:bg-reddit-border' : 'cursor-default'}`}
        >
          <CommentIcon className="h-5 w-5" />
          <span>{post.commentsCount} Comments</span>
        </button>
        <div className="flex items-center space-x-1 hover:bg-reddit-border p-2 rounded">
          <ShareIcon className="h-5 w-5" />
          <span>Share</span>
        </div>
        <div className="flex items-center space-x-1 hover:bg-reddit-border p-2 rounded">
          <SaveIcon className="h-5 w-5" />
          <span>Save</span>
        </div>
      </div>
    </>
  );

  return (
    <div className="bg-reddit-dark-soft border border-reddit-border rounded-md hover:border-gray-500 transition-colors duration-200">
      <div className="flex">
        <VoteButtons initialVotes={post.votes} postId={post.id} />
        <div className="w-full">
          {isLink ? (
            <Link to={`/post/${post.id}`} className="block">
              <PostContent />
            </Link>
          ) : (
            <PostContent />
          )}
        </div>
      </div>
      {isCommentsOpen && (
        <div className="p-4 border-t border-reddit-border">
          <p className="text-reddit-text-secondary text-center italic">Comments placeholder...</p>
        </div>
      )}
    </div>
  );
};

export default Post;