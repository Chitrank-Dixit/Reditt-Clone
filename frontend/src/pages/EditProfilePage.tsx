import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getUserByUsername, updateUserProfile } from '../services/api';
import type { ProfileUser } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const EditProfilePage: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    
    const [user, setUser] = useState<ProfileUser | null>(null);
    const [bio, setBio] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchUser = async () => {
            if (!username) {
                setError('Username is missing.');
                setLoading(false);
                return;
            }
            try {
                const userData = await getUserByUsername(username);
                setUser(userData);
                setBio(userData.bio || '');
            } catch (err) {
                setError('Failed to fetch user profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [username]);
    
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username) return;

        setSaving(true);
        setError(null);
        try {
            await updateUserProfile(username, { bio });
            navigate(`/user/${username}`);
        } catch (err) {
            setError('Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error || !user) {
        return <div className="text-center text-reddit-orange">{error || 'User not found.'}</div>;
    }

    return (
        <div className="max-w-2xl mx-auto bg-reddit-dark-soft border border-reddit-border rounded-lg p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Edit Profile</h1>
            <form onSubmit={handleSave} className="space-y-6">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-reddit-text-secondary mb-2">
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={user.name}
                        readOnly
                        className="w-full bg-reddit-dark border border-reddit-border rounded-md py-2 px-3 text-reddit-text-secondary cursor-not-allowed"
                    />
                    <p className="text-xs text-reddit-text-secondary mt-1">Usernames cannot be changed.</p>
                </div>

                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-reddit-text-secondary mb-2">
                        Bio
                    </label>
                    <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={5}
                        className="w-full bg-reddit-dark border border-reddit-border rounded-md py-2 px-3 text-reddit-text-primary focus:outline-none focus:ring-1 focus:ring-white"
                        placeholder="Tell us a little about yourself"
                    />
                </div>

                {error && <p className="text-sm text-reddit-orange">{error}</p>}
                
                <div className="flex items-center justify-end space-x-4">
                    <Link to={`/user/${username}`} className="text-reddit-text-secondary font-bold py-2 px-4 rounded-full hover:bg-reddit-border transition-colors">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-reddit-blue text-white font-bold py-2 px-6 rounded-full hover:bg-opacity-80 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfilePage;
