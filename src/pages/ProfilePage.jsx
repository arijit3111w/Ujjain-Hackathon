import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Home, Save, Loader2, AlertCircle, Crown } from 'lucide-react';

const ProfilePage = () => {
    const { currentUser, username, userAddress, userRole, updateProfile, isAuthReady } = useAuth();
    const [localUsername, setLocalUsername] = useState('');
    const [localAddress, setLocalAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (isAuthReady && currentUser && !currentUser.isAnonymous) {
            setLocalUsername(username || '');
            setLocalAddress(userAddress || '');
        } else if (isAuthReady && currentUser && currentUser.isAnonymous) {
            setLocalUsername('');
            setLocalAddress('');
            setMessage({ text: 'Please sign in to manage your profile.', type: 'info' });
        }
    }, [isAuthReady, currentUser, username, userAddress]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        if (!currentUser || currentUser.isAnonymous) {
            setMessage({ text: 'You must be logged in to update your profile.', type: 'error' });
            setLoading(false);
            return;
        }

        if (!localUsername.trim()) {
            setMessage({ text: 'Username cannot be empty.', type: 'error' });
            setLoading(false);
            return;
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(localUsername)) {
            setMessage({ text: 'Username can only contain letters, numbers, hyphens, and underscores.', type: 'error' });
            setLoading(false);
            return;
        }

        const profileData = {
            username: localUsername.trim(),
            address: localAddress.trim()
        };

        try {
            await updateProfile(profileData);
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
        } catch (error) {
            console.error("Failed to update profile:", error);
            setMessage({ text: `Failed to update profile: ${error.message}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthReady) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-600">
                Loading profile...
            </div>
        );
    }

    if (!currentUser || currentUser.isAnonymous) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4 bg-gray-100">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                    <User className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-6">Please log in with an email and password to manage your profile.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] bg-gray-100 flex items-center justify-center p-4 font-inter">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-amber-600 to-amber-500 p-2 rounded-lg">
                            <User className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Manage Profile</h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {message.text && (
                        <div className={`px-4 py-3 rounded-lg text-sm ${
                            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                            message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                            'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <div className="flex items-center space-x-2 text-gray-700 text-sm font-medium">
                        <Crown className="h-5 w-5 text-purple-600" />
                        <span>Role: <span className="font-semibold text-gray-900">{userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Pilgrim'}</span></span>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="email"
                                id="email"
                                value={currentUser?.email || ''}
                                readOnly
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                id="username"
                                value={localUsername}
                                onChange={(e) => setLocalUsername(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                                placeholder="Choose a unique username"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Only letters, numbers, hyphens, and underscores.</p>
                    </div>

                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <div className="relative">
                            <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <textarea
                                id="address"
                                value={localAddress}
                                onChange={(e) => setLocalAddress(e.target.value)}
                                rows="3"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors resize-y"
                                placeholder="Enter your address"
                            ></textarea>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white py-3 rounded-lg font-medium hover:from-amber-700 hover:to-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {loading ? 'Saving...' : 'Save Profile'}
                        {!loading && <Save className="h-5 w-5" />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
