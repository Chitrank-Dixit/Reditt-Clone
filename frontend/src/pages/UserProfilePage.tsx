import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import type { Post, Comment as CommentType, ProfileUser } from '../types';
import { getPostsByUsername, getCommentsByUsername, getUserByUsername, uploadAvatar, updateUserProfile } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PostList from '../components/PostList';
import UserComment from '../components/UserComment';
import SortBar from '../components/SortBar';
import { UserIcon } from '../components/icons/UserIcon';
import { CakeIcon } from '../components/icons/CakeIcon';
import { CameraIcon } from '../components/icons/CameraIcon';
import { EditIcon } from '../components/icons/EditIcon';
import { KarmaIcon } from '../components/icons/KarmaIcon';

type View = 'posts' | 'comments';

const UserProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  
  // State for user profile data
  const [userProfile, setUserProfile] = useState<ProfileUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // State for user content (posts/comments)
  const [view, setView] = useState<View>('posts');
  const [sort, setSort] = useState('new');
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentError, setContentError] = useState<string | null>(null);

  const [avatarUploadLoading, setAvatarUploadLoading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);


  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) return;
      try {
        setProfileLoading(true);
        setProfileError(null);
        const profileData = await getUserByUsername(username);
        setUserProfile(profileData);
      } catch (err) {
        console.error(err);
        setProfileError(`User ${username} not found.`);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchUserProfile();
  }, [username]);

  // Fetch user content data
  useEffect(() => {
    const fetchContent = async () => {
      if (!username) return;
      try {
        setContentLoading(true);
        setContentError(null);
        if (view === 'posts') {
          const userPosts = await getPostsByUsername(username, sort);
          setPosts(userPosts);
        } else {
          const userComments = await getCommentsByUsername(username);
          setComments(userComments);
        }
      } catch (err) {
        console.error(err);
        setContentError(`Failed to fetch ${view} for ${username}.`);
      } finally {
        setContentLoading(false);
      }
    };

    fetchContent();
  }, [username, view, sort]);

  const handlePostUpdated = (updatedPost: Post) => {
    setPosts(prevPosts =>
      prevPosts.map(p => (p.id === updatedPost.id ? updatedPost : p))
    );
  };

  const handleAvatarClick = () => {
    setAvatarError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && username) {
      setAvatarUploadLoading(true);
      setAvatarError(null);
      try {
        // Using the backend endpoint now
        const formData = new FormData();
        formData.append('avatar', file);
        const { avatarUrl } = await uploadAvatar(username, file);
        setUserProfile(prev => prev ? { ...prev, avatarUrl } : null);
      } catch (error) {
        console.error("Failed to upload avatar", error);
        setAvatarError("Failed to upload avatar. Please try again.");
      } finally {
        setAvatarUploadLoading(false);
      }
    }
  };

    const handleEditBioClick = () => {
        setEditedBio(userProfile?.bio || '');
        setIsEditingBio(true);
        setBioError(null);
    };

    const handleCancelEditBio = () => {
        setIsEditingBio(false);
    };

    const handleSaveBio = async () => {
        if (!username || !userProfile) return;
        setIsSavingBio(true);
        setBioError(null);
        try {
            const updatedUser = await updateUserProfile(username, { bio: editedBio });
            setUserProfile(updatedUser);
            setIsEditingBio(false);
        } catch (error) {
            console.error("Failed to save bio", error);
            setBioError("Failed to save bio. Please try again.");
        } finally {
            setIsSavingBio(false);
        }
    };

  const TabButton: React.FC<{ tabName: View; label: string }> = ({ tabName, label }) => (
    <button
      onClick={() => setView(tabName)}
      className={`py-2 px-4 font-bold text-sm border-b-2 transition-colors duration-200 ${
        view === tabName
          ? 'text-white border-reddit-blue'
          : 'text-reddit-text-secondary border-transparent hover:text-white hover:border-reddit-text-secondary'
      }`}
    >
      {label}
    </button>
  );

  const ProfileSidebar: React.FC<{ user: ProfileUser }> = ({ user }) => (
     <div className="bg-reddit-dark-soft border border-reddit-border rounded-md p-4 sticky top-20 flex flex-col items-center">
        <div className="relative group mb-4">
            <button onClick={handleAvatarClick} disabled={avatarUploadLoading} className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-reddit-dark-soft focus:ring-reddit-blue">
                {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={`${user.name}'s avatar`} className="w-24 h-24 rounded-full object-cover" />
                ) : (
                    <UserIcon className="w-24 h-24 text-reddit-text-secondary" />
                )}
                 <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-opacity duration-200">
                    {!avatarUploadLoading && <CameraIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100" />}
                    {avatarUploadLoading && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>}
                 </div>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>
       
        <h2 className="text-xl font-bold text-white mb-4">u/{user.name}</h2>
        
        {avatarError && <p className="text-sm text-reddit-orange mb-4 text-center">{avatarError}</p>}
        
        <div className="w-full text-left">
             <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-xs uppercase text-reddit-text-secondary">About</h3>
                {!isEditingBio && (
                    <button onClick={handleEditBioClick} className="text-reddit-text-secondary hover:text-white p-1 rounded-full">
                        <EditIcon className="h-4 w-4" />
                    </button>
                )}
            </div>

            {isEditingBio ? (
                <div className="space-y-2">
                    <textarea
                        value={editedBio}
                        onChange={(e) => setEditedBio(e.target.value)}
                        rows={4}
                        className="w-full bg-reddit-dark border border-reddit-border rounded-md py-2 px-3 text-sm text-reddit-text-primary focus:outline-none focus:ring-1 focus:ring-white"
                        placeholder="Tell us a little about yourself"
                    />
                    {bioError && <p className="text-xs text-reddit-orange">{bioError}</p>}
                    <div className="flex justify-end space-x-2">
                        <button onClick={handleCancelEditBio} className="text-reddit-text-secondary font-bold py-1 px-3 text-xs rounded-full hover:bg-reddit-border">
                            Cancel
                        </button>
                        <button onClick={handleSaveBio} disabled={isSavingBio} className="bg-reddit-blue text-white font-bold py-1 px-4 text-xs rounded-full hover:bg-opacity-80 disabled:bg-gray-500">
                            {isSavingBio ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-reddit-text-primary">{user.bio || 'No bio provided.'}</p>
            )}
            
            <div className="grid grid-cols-2 gap-4 mt-4 border-t border-reddit-border pt-4">
                <div className="flex items-center space-x-2 text-sm text-reddit-text-secondary">
                    <KarmaIcon className="h-5 w-5" />
                    <div>
                        <p className="font-bold text-white">{user.karma.toLocaleString()}</p>
                        <p className="text-xs">Karma</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-reddit-text-secondary">
                    <CakeIcon className="h-5 w-5" />
                    <div>
                        <p className="font-bold text-white">{new Date(user.joinDate).toLocaleString('en-US', { year: 'numeric', month: 'long' })}</p>
                        <p className="text-xs">Cake day</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <div className="bg-reddit-dark-soft border border-reddit-border rounded-md">
            <div className="flex border-b border-reddit-border">
                <TabButton tabName="posts" label="Posts" />
                <TabButton tabName="comments" label="Comments" />
            </div>
             <div className="p-4">
                {contentLoading && <LoadingSpinner />}
                {contentError && <div className="text-reddit-orange text-center">{contentError}</div>}
                {!contentLoading && !contentError && (
                    view === 'posts' ? (
                    <div className="space-y-4">
                        <SortBar currentSort={sort} onSortChange={setSort} />
                        <PostList posts={posts} onUpdatePost={handlePostUpdated} emptyMessage={`u/${username} hasn't posted anything yet.`} />
                    </div>
                    ) : (
                    <div className="space-y-4">
                        {comments.length > 0 ? (
                        comments.map(comment => <UserComment key={comment.id} comment={comment} />)
                        ) : (
                        <p className="text-reddit-text-secondary text-center p-8">u/${username} hasn't commented on anything yet.</p>
                        )}
                    </div>
                    )
                )}
            </div>
        </div>
      </div>
      <div className="hidden md:block">
        {profileLoading && <LoadingSpinner />}
        {profileError && <div className="text-reddit-orange text-center p-4 bg-reddit-dark-soft rounded">{profileError}</div>}
        {userProfile && <ProfileSidebar user={userProfile} />}
      </div>
    </div>
  );
};

export default UserProfilePage;