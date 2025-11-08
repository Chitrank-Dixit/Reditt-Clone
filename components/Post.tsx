
import React from 'react';
import { Link } from 'react-router-dom';
import type { Post as PostType } from '../types';
import VoteButtons from './VoteButtons';
import { CommentIcon } from './icons/CommentIcon';
import { ShareIcon } from './icons/ShareIcon';
import { SaveIcon } from './icons/SaveIcon';

interface PostProps {
  post: PostType;
  isLink?: boolean;
}

const Post: React.FC<PostProps> = ({ post, isLink = true }) => {
  const PostContent = () => (
    <>
      <div className="p-4">
        <div className="flex items-center text-xs text-reddit-text-secondary mb-2">
          <span className="font-bold text-reddit-text-primary">r/{post.subreddit}</span>
          <span className="mx-1">•</span>
          <span>Posted by u/{post.author.name}</span>
          <span className="mx-1">•</span>
          <span>{post.createdAt}</span>
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
        <div className="flex items-center space-x-1 hover:bg-reddit-border p-2 rounded">
          <CommentIcon className="h-5 w-5" />
          <span>{post.commentsCount} Comments</span>
        </div>
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
    <div className="flex bg-reddit-dark-soft border border-reddit-border rounded-md hover:border-gray-500 transition-colors duration-200">
      <VoteButtons initialVotes={post.votes} />
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
  );
};

export default Post;
