// src/components/VipAuthModal.jsx
import React, { useState } from 'react';
import { X, Lock, Mail, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const VipAuthModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            onClose();
            setEmail('');
            setPassword('');
        } catch (error) {
            setError(error.message || "Failed to sign in. Please check your credentials.");
        }
        setLoading(false);
    };

    const handleApplyClick = () => {
        onClose(); // Close the modal before navigating
        navigate('/vip-signup');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-2 rounded-lg">
                            <Crown className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">VIP Sign In</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors" placeholder="Enter your VIP email"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors" placeholder="Enter your password"/>
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                    <div className="text-center">
                        <button type="button" onClick={handleApplyClick} className="text-violet-600 hover:text-violet-700 text-sm font-medium transition-colors">
                            Need a VIP account? Apply Here
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VipAuthModal;