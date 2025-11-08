import type { Post, Comment, NewPostPayload, ProfileUser, UpdatePostPayload, Subreddit } from '../types';

const API_BASE_URL = '/api';

async function fetcher<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });
    
    if (!res.ok) {
        const errorData = await res.json();
        const error = new Error(errorData.message || 'An error occurred while fetching the data.');
        throw error;
    }
    
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return res.json();
    } else {
        return undefined as T;
    }
}

// Auth
export const register = (userData: any): Promise<{ token: string }> => {
  return fetcher<{ token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const login = (credentials: any): Promise<{ token: string }> => {
  return fetcher<{ token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};


// Posts
export const getPosts = (sort: string): Promise<Post[]> => {
    return fetcher<Post[]>(`/posts?sort=${sort}`);
};

export const getPostById = (postId: string): Promise<Post> => {
    return fetcher<Post>(`/posts/${postId}`);
};

export const createPost = (postData: NewPostPayload): Promise<Post> => {
  return fetcher<Post>('/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
};

export const updatePost = (postId: string, postData: UpdatePostPayload): Promise<Post> => {
  return fetcher<Post>(`/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(postData),
  });
};

export const deletePost = (postId: string): Promise<void> => {
    return fetcher<void>(`/posts/${postId}`, {
        method: 'DELETE',
    });
};


// Comments
export const getCommentsByPostId = (postId: string, sort: string): Promise<Comment[]> => {
    return fetcher<Comment[]>(`/posts/${postId}/comments?sort=${sort}`);
};

export const replyToComment = (commentId: string, content: string): Promise<Comment> => {
    return fetcher<Comment>(`/comments/${commentId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ content }),
    });
};

export const updateComment = (commentId: string, content: string): Promise<Comment> => {
    return fetcher<Comment>(`/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
    });
};

export const deleteComment = (commentId: string): Promise<void> => {
    return fetcher<void>(`/comments/${commentId}`, {
        method: 'DELETE',
    });
};

// Voting
export const voteOnEntity = (
    id: string,
    entityType: 'post' | 'comment',
    vote: 'up' | 'down'
): Promise<Post | Comment> => {
    const url = entityType === 'post' ? `/posts/${id}/vote` : `/comments/${id}/vote`;
    return fetcher<Post | Comment>(url, {
        method: 'POST',
        body: JSON.stringify({ vote }),
    });
};

// Users
export const getPostsByUsername = (username: string, sort: string): Promise<Post[]> => {
    return fetcher<Post[]>(`/users/${username}/posts?sort=${sort}`);
};

export const getCommentsByUsername = (username: string): Promise<Comment[]> => {
    return fetcher<Comment[]>(`/users/${username}/comments`);
};

export const getUserByUsername = (username: string): Promise<ProfileUser> => {
    return fetcher<ProfileUser>(`/users/${username}`);
};

export const updateUserProfile = (username: string, data: { bio: string }): Promise<ProfileUser> => {
    return fetcher<ProfileUser>(`/users/${username}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

export const uploadAvatar = async (username: string, file: File): Promise<{ avatarUrl: string }> => {
    const base64Avatar = await fileToBase64(file);
    return fetcher<{ avatarUrl: string }>(`/users/${username}/avatar`, {
        method: 'POST',
        body: JSON.stringify({ avatarUrl: base64Avatar }),
    });
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// Subreddits
export const getSubredditByName = (name: string): Promise<Subreddit> => {
    return fetcher<Subreddit>(`/subreddits/${name}`);
};

export const getSubredditPosts = (name: string): Promise<Post[]> => {
    return fetcher<Post[]>(`/subreddits/${name}/posts`);
};

export const joinSubreddit = (id: string): Promise<Subreddit> => {
    return fetcher<Subreddit>(`/subreddits/${id}/join`, { method: 'POST' });
};

export const leaveSubreddit = (id: string): Promise<Subreddit> => {
    return fetcher<Subreddit>(`/subreddits/${id}/leave`, { method: 'POST' });
};

export const createSubreddit = (data: { name: string, description: string }): Promise<Subreddit> => {
    return fetcher<Subreddit>('/subreddits/create', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};