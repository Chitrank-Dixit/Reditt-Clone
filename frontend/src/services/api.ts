import type { Post, Comment, NewPostPayload, ProfileUser, UpdatePostPayload } from '../types';

const API_BASE_URL = '/api';

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${url}`, options);
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        // You could attach more info to the error object here
        // error.info = await res.json();
        // error.status = res.status;
        throw error;
    }
    return res.json();
}

export const getPosts = (sort: string): Promise<Post[]> => {
    return fetcher<Post[]>(`/posts?sort=${sort}`);
};

export const getPostById = (postId: string): Promise<Post> => {
    return fetcher<Post>(`/posts/${postId}`);
};

export const getCommentsByPostId = (postId: string, sort: string): Promise<Comment[]> => {
    return fetcher<Comment[]>(`/posts/${postId}/comments?sort=${sort}`);
};

export const createPost = (postData: NewPostPayload): Promise<Post> => {
  return fetcher<Post>('/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });
};

export const updatePost = (postId: string, postData: UpdatePostPayload): Promise<Post> => {
  return fetcher<Post>(`/posts/${postId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });
};

export const voteOnEntity = (
    id: string,
    entityType: 'post' | 'comment',
    vote: 'up' | 'down'
): Promise<Post | Comment> => {
    const url = entityType === 'post' ? `/posts/${id}/vote` : `/comments/${id}/vote`;
    return fetcher<Post | Comment>(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote }),
    });
};

export const getPostsByUsername = (username: string, sort: string): Promise<Post[]> => {
    return fetcher<Post[]>(`/users/${username}/posts?sort=${sort}`);
};

export const getCommentsByUsername = (username: string): Promise<Comment[]> => {
    return fetcher<Comment[]>(`/users/${username}/comments`);
};

export const getUserByUsername = (username: string): Promise<ProfileUser> => {
    return fetcher<ProfileUser>(`/users/${username}`);
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// MOCK API for avatar upload to satisfy user request
export const uploadAvatar = async (username: string, file: File): Promise<{ avatarUrl: string }> => {
    console.log(`[MOCK] Uploading avatar for user: ${username}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // To test failure, use a file with "fail" in its name
    if (file.name.includes('fail')) {
        return Promise.reject(new Error('Mock upload failed'));
    }

    const base64Avatar = await fileToBase64(file);
    return { avatarUrl: base64Avatar };
};

export const updateUserProfile = (username: string, data: { bio: string }): Promise<ProfileUser> => {
    return fetcher<ProfileUser>(`/users/${username}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
};