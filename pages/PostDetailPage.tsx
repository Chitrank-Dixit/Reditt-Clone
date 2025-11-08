
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Post as PostType, Comment as CommentType } from '../types';
import { getPostById, getCommentsByPostId } from '../services/api';
import Post from '../components/Post';
import Comment from '../components/Comment';
import LoadingSpinner from '../components/LoadingSpinner';

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<PostType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPostData = async () => {
      if (!postId) {
        setError("Post ID is missing.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [fetchedPost, fetchedComments] = await Promise.all([
          getPostById(postId),
          getCommentsByPostId(postId),
        ]);
        setPost(fetchedPost);
        setComments(fetchedComments);
      } catch (err) {
        setError('Failed to fetch post details. It might not exist.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [postId]);

  if (loading) {
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
      <Post post={post} isLink={false} />
      <div className="mt-6 bg-reddit-dark-soft border border-reddit-border rounded-md p-4">
        <h3 className="text-lg font-bold text-white mb-4">Comments ({post.commentsCount})</h3>
        <div className="space-y-6">
          {comments.map(comment => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
