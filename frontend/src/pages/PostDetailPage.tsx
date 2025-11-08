import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Post as PostType, Comment as CommentType } from '../types';
import { getPostById, getCommentsByPostId, deletePost } from '../services/api';
import Post from '../components/Post';
import Comment from '../components/Comment';
import LoadingSpinner from '../components/LoadingSpinner';
import CommentSortBar from '../components/CommentSortBar';

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentSort, setCommentSort] = useState('best');

  useEffect(() => {
    const fetchPostData = async () => {
      if (!postId) {
        setError("Post ID is missing.");
        setLoadingPost(false);
        return;
      }
      try {
        setLoadingPost(true);
        const fetchedPost = await getPostById(postId);
        setPost(fetchedPost);
      } catch (err) {
        setError('Failed to fetch post details. It might not exist.');
        console.error(err);
      } finally {
        setLoadingPost(false);
      }
    };

    fetchPostData();
  }, [postId]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!postId) return;
      try {
        setLoadingComments(true);
        const fetchedComments = await getCommentsByPostId(postId, commentSort);
        setComments(fetchedComments);
      } catch (err) {
        console.error('Failed to fetch comments:', err);
        // Optionally set a comment-specific error state here
      } finally {
        setLoadingComments(false);
      }
    };
    
    fetchComments();
  }, [postId, commentSort]);

  const handlePostUpdate = (updatedPost: PostType) => {
    setPost(updatedPost);
  };

  const handlePostDelete = (deletedPostId: string) => {
    console.log(`Post ${deletedPostId} deleted, navigating home.`);
    navigate('/');
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
    
    // Update post's comment count locally
    if (post) {
        setPost({
            ...post,
            commentsCount: post.commentsCount > 0 ? post.commentsCount - 1 : 0
        });
    }
  };

  if (loadingPost) {
    return <LoadingSpinner />;
  }

  if (error || !post) {
    return (
      <div className="text-center text-reddit-orange">
        <p>{error || 'Post not found.'}</p>
        <Link to="/" className="text-reddit-blue hover:underline mt-4 block">Go back home</Link>
      </div>
    );
  }

  return (
    <div>
      <Post post={post} onUpdatePost={handlePostUpdate} onDeletePost={handlePostDelete} isLink={false} />
      <div className="mt-6 bg-reddit-dark-soft border border-reddit-border rounded-md p-4">
        <h3 className="text-lg font-bold text-white mb-4">Comments ({post.commentsCount})</h3>
        
        <CommentSortBar currentSort={commentSort} onSortChange={setCommentSort} />

        {loadingComments ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-6">
            {comments.length > 0 ? comments.map(comment => (
              <Comment key={comment.id} comment={comment} onDelete={handleCommentDeleted} />
            )) : (
              <p className="text-reddit-text-secondary text-center py-4">No comments yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetailPage;