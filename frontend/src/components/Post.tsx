import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Post as PostType, Comment as CommentType } from '../types';
import { updatePost, getCommentsByPostId } from '../services/api';
import VoteButtons from './VoteButtons';
import Comment from './Comment';
import LoadingSpinner from './LoadingSpinner';
import { CommentIcon } from './icons/CommentIcon';
import { ShareIcon } from './icons/ShareIcon';
import { SaveIcon } from './icons/SaveIcon';
import { EditIcon } from './icons/EditIcon';
import { timeAgo } from '../utils/time';

interface PostProps {
  post: PostType;
  onUpdatePost: (updatedPost: PostType) => void;
  isLink?: boolean;
}

const Post: React.FC<PostProps> = ({ post, onUpdatePost, isLink = true }) => {
  const [postData, setPostData] = useState(post);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  // Sync internal state with external props to prevent stale data
  useEffect(() => {
    setPostData(post);
  }, [post]);
  
  useEffect(() => {
    const fetchComments = async () => {
        if (isCommentsOpen && comments.length === 0 && !commentsLoading) {
            setCommentsLoading(true);
            setCommentsError(null);
            try {
                const fetchedComments = await getCommentsByPostId(postData.id, 'best');
                setComments(fetchedComments);
            } catch (error) {
                setCommentsError('Failed to load comments.');
                console.error(error);
            } finally {
                setCommentsLoading(false);
            }
        }
    };

    fetchComments();
  }, [isCommentsOpen, postData.id, comments.length, commentsLoading]);

  const handleUserLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleToggleComments = (e: React.MouseEvent) => {
    if (isLink) {
      e.preventDefault();
      e.stopPropagation();
      setIsCommentsOpen(prev => !prev);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Populate form with current data when edit mode starts
    setEditedTitle(postData.title);
    setEditedContent(postData.content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    setEditError(null);
    try {
      const updatedPost = await updatePost(postData.id, {
        title: editedTitle,
        content: editedContent,
      });
      onUpdatePost(updatedPost);
      setIsEditing(false);
    } catch (error) {
      setEditError('Failed to save post. Please try again.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const PostContent = () => (
    <>
      <div className="p-4">
        <div className="flex items-center text-xs text-reddit-text-secondary mb-2">
          <span className="font-bold text-reddit-text-primary">r/{postData.subreddit}</span>
          <span className="mx-1">•</span>
          <span>Posted by&nbsp;
            <Link 
              to={`/user/${postData.author.name}`} 
              className="hover:underline"
              onClick={handleUserLinkClick}
            >
              u/{postData.author.name}
            </Link>
          </span>
          <span className="mx-1">•</span>
          <span>{timeAgo(postData.createdAt)}</span>
        </div>
        <h2 className="text-xl font-bold text-reddit-text-primary mb-2">{postData.title}</h2>
        {postData.imageUrl && (
            <div className="my-3 max-h-96 overflow-hidden rounded-lg flex justify-center items-center bg-black">
                <img src={postData.imageUrl} alt={postData.title} className="max-h-96 object-contain" />
            </div>
        )}
        <p className="text-reddit-text-primary text-sm leading-relaxed">{postData.content}</p>
      </div>
      <div className="flex items-center space-x-4 p-4 pt-2 text-reddit-text-secondary font-bold text-sm">
        <button
          onClick={handleToggleComments}
          className={`flex items-center space-x-1 p-2 rounded ${isLink ? 'hover:bg-reddit-border' : 'cursor-default'}`}
        >
          <CommentIcon className="h-5 w-5" />
          <span>{postData.commentsCount} Comments</span>
        </button>
        <div className="flex items-center space-x-1 hover:bg-reddit-border p-2 rounded cursor-pointer">
          <ShareIcon className="h-5 w-5" />
          <span>Share</span>
        </div>
        <div className="flex items-center space-x-1 hover:bg-reddit-border p-2 rounded cursor-pointer">
          <SaveIcon className="h-5 w-5" />
          <span>Save</span>
        </div>
        {/* In a real app, we'd check if the current user is the author */}
        {postData.author.name === 'dev_user' && (
          <button onClick={handleEditClick} className="flex items-center space-x-1 hover:bg-reddit-border p-2 rounded">
            <EditIcon className="h-5 w-5" />
            <span>Edit</span>
          </button>
        )}
      </div>
    </>
  );

  const EditForm = () => (
    <div className="p-4 space-y-3">
        <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full bg-reddit-dark border border-reddit-border rounded-md py-2 px-3 text-reddit-text-primary focus:outline-none focus:ring-1 focus:ring-white"
        />
        <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={5}
            className="w-full bg-reddit-dark border border-reddit-border rounded-md py-2 px-3 text-reddit-text-primary focus:outline-none focus:ring-1 focus:ring-white"
        />
        {editError && <p className="text-sm text-reddit-orange">{editError}</p>}
        <div className="flex justify-end space-x-2">
            <button onClick={handleCancelEdit} className="text-reddit-text-secondary font-bold py-2 px-4 rounded-full hover:bg-reddit-border transition-colors">
                Cancel
            </button>
            <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="bg-reddit-blue text-white font-bold py-2 px-6 rounded-full hover:bg-opacity-80 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                {isSaving ? 'Saving...' : 'Save'}
            </button>
        </div>
    </div>
);

  return (
    <div className="bg-reddit-dark-soft border border-reddit-border rounded-md hover:border-gray-500 transition-colors duration-200">
      <div className="flex">
        <VoteButtons initialVotes={postData.votes} postId={postData.id} />
        <div className="w-full">
          {isEditing ? (
            <EditForm />
          ) : isLink ? (
            <Link to={`/post/${postData.id}`} className="block">
              <PostContent />
            </Link>
          ) : (
            <PostContent />
          )}
        </div>
      </div>
      {isCommentsOpen && (
        <div className="p-4 border-t border-reddit-border bg-reddit-dark">
          {commentsLoading && <LoadingSpinner />}
          {commentsError && <p className="text-reddit-orange text-center">{commentsError}</p>}
          {!commentsLoading && !commentsError && (
            comments.length > 0 ? (
              <div className="space-y-6">
                {comments.map(comment => (
                  <Comment key={comment.id} comment={comment} />
                ))}
              </div>
            ) : (
              <p className="text-reddit-text-secondary text-center italic">No comments yet.</p>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Post;