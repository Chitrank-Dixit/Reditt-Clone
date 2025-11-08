import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Post as PostType, Comment as CommentType, UpdatePostPayload } from '../types';
import { getCommentsByPostId, updatePost } from '../services/api';
import VoteButtons from './VoteButtons';
import Comment from './Comment';
import LoadingSpinner from './LoadingSpinner';
import { CommentIcon } from './icons/CommentIcon';
import { ShareIcon } from './icons/ShareIcon';
import { SaveIcon } from './icons/SaveIcon';
import { useAuth } from '../hooks/useAuth';
import { EditIcon } from './icons/EditIcon';
import { DeleteIcon } from './icons/DeleteIcon';

interface PostProps {
  post: PostType;
  isLink?: boolean;
  onUpdatePost?: (updatedPost: PostType) => void;
  onDeletePost?: (postId: string) => void;
}

const Post: React.FC<PostProps> = ({ post: initialPost, isLink = true, onUpdatePost, onDeletePost }) => {
  const [post, setPost] = useState(initialPost);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(post.title);
  const [editedContent, setEditedContent] = useState(post.content);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  useEffect(() => {
    const fetchComments = async () => {
        if (isCommentsOpen && comments.length === 0 && !commentsLoading) {
            setCommentsLoading(true);
            setCommentsError(null);
            try {
                const fetchedComments = await getCommentsByPostId(post.id, 'best');
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
  }, [isCommentsOpen, post.id, comments.length, commentsLoading]);
  
  const handleToggleComments = (e: React.MouseEvent) => {
    if (isLink) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsCommentsOpen(prev => !prev);
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTitle(post.title);
    setEditedContent(post.content);
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    setEditError(null);
    try {
        const payload: UpdatePostPayload = { title: editedTitle, content: editedContent };
        const updatedPost = await updatePost(post.id, payload);
        if(onUpdatePost) {
            onUpdatePost(updatedPost);
        } else {
            setPost(updatedPost);
        }
        setIsEditing(false);
    } catch (err) {
        setEditError('Failed to save changes.');
        console.error(err);
    } finally {
        setIsSaving(false);
    }
  };

  const handleCommentDeleted = (deletedCommentId: string) => {
    const removeComment = (comments: CommentType[], idToRemove: string): CommentType[] => {
        return comments
            .filter(comment => comment.id !== idToRemove)
            .map(comment => ({
                ...comment,
                replies: removeComment(comment.replies, idToRemove)
            }));
    };
    setComments(prevComments => removeComment(prevComments, deletedCommentId));
    // Also update post's comment count locally for immediate feedback
    setPost(prevPost => ({
        ...prevPost,
        commentsCount: prevPost.commentsCount > 0 ? prevPost.commentsCount - 1 : 0
    }));
};

  const PostContent = () => (
    <>
      <div className="p-4">
        <div className="flex items-center text-xs text-reddit-text-secondary mb-2">
          <span className="font-bold text-reddit-text-primary">r/{post.subreddit}</span>
          <span className="mx-1">•</span>
          <span>Posted by <Link to={`/user/${post.author.name}`} onClick={(e) => e.stopPropagation()} className="hover:underline">u/{post.author.name}</Link></span>
        </div>
        {isEditing ? (
            <div className="space-y-2">
                <input 
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full text-xl font-bold bg-reddit-dark border border-reddit-border rounded py-1 px-2 text-reddit-text-primary"
                />
                <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={4}
                    className="w-full text-sm leading-relaxed bg-reddit-dark border border-reddit-border rounded py-1 px-2 text-reddit-text-primary"
                />
                {editError && <p className="text-xs text-reddit-orange">{editError}</p>}
            </div>
        ) : (
            <>
                <h2 className="text-xl font-bold text-reddit-text-primary mb-2">{post.title}</h2>
                {post.imageUrl && (
                    <div className="my-3 max-h-96 overflow-hidden rounded-lg flex justify-center items-center bg-black">
                        <img src={post.imageUrl} alt={post.title} className="max-h-96 object-contain" />
                    </div>
                )}
                <p className="text-reddit-text-primary text-sm leading-relaxed">{post.content}</p>
            </>
        )}
      </div>
      <div className="flex items-center space-x-1 p-4 pt-2 text-reddit-text-secondary font-bold text-sm">
        <button
          onClick={handleToggleComments}
          className="flex items-center space-x-1 hover:bg-reddit-border p-2 rounded"
        >
          <CommentIcon className="h-5 w-5" />
          <span>{post.commentsCount} Comments</span>
        </button>
        <div className="flex items-center space-x-1 hover:bg-reddit-border p-2 rounded cursor-pointer">
          <ShareIcon className="h-5 w-5" />
          <span>Share</span>
        </div>
        <div className="flex items-center space-x-1 hover:bg-reddit-border p-2 rounded cursor-pointer">
          <SaveIcon className="h-5 w-5" />
          <span>Save</span>
        </div>
        {user?.id === post.author.id && !isEditing && (
            <>
                <button onClick={handleEdit} className="flex items-center space-x-1 hover:bg-reddit-border p-2 rounded cursor-pointer">
                    <EditIcon className="h-4 w-4" />
                    <span>Edit</span>
                </button>
            </>
        )}
      </div>
      {isEditing && (
        <div className="flex justify-end space-x-2 pb-4 px-4">
            <button onClick={handleCancelEdit} className="text-reddit-text-secondary font-bold text-xs py-2 px-3 rounded-full hover:bg-reddit-border">Cancel</button>
            <button onClick={handleSaveEdit} disabled={isSaving} className="bg-reddit-blue text-white font-bold text-xs py-2 px-4 rounded-full hover:bg-opacity-80 disabled:bg-gray-500">
                {isSaving ? "Saving..." : "Save"}
            </button>
        </div>
      )}
    </>
  );

  return (
    <div className="bg-reddit-dark-soft border border-reddit-border rounded-md hover:border-gray-500 transition-colors duration-200">
        <div className="flex">
            <VoteButtons initialVotes={post.votes} postId={post.id} onUpdate={onUpdatePost ? (entity) => onUpdatePost(entity as PostType) : (entity) => setPost(entity as PostType)} />
            <div className="w-full">
                {isLink && !isEditing ? (
                <Link to={`/post/${post.id}`} className="block">
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
                                <Comment key={comment.id} comment={comment} onDelete={handleCommentDeleted} />
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