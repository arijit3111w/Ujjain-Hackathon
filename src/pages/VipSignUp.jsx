// src/pages/VipSignup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Key, Crown, User, CheckCircle, AlertCircle } from 'lucide-react';

// IMPORTANT: In a real app, this secret code should not be on the client.
// You would typically validate this on a server or using a Cloud Function.
const VIP_SECRET_CODE = 'KUMBH-VIP-2025';

const VipSignup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [vipCode, setVipCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        if (vipCode !== VIP_SECRET_CODE) {
            setMessage({ text: 'Invalid VIP Code. Access denied.', type: 'error' });
            setLoading(false);
            return;
        }

        try {
            await register(email, password, 'vip'); // Pass 'vip' as the role
            setMessage({ text: 'VIP account created successfully! Redirecting...', type: 'success' });
            setTimeout(() => {
                navigate('/profile');
            }, 2000);
        } catch (error) {
            setMessage({ text: error.message || 'Failed to create account.', type: 'error' });
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-gray-100 flex items-center justify-center p-4 font-inter">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-amber-500 to-amber-500 p-2 rounded-lg">
                            <Crown className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">VIP Account Registration</h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {message.text && (
                        <div className={`flex items-start space-x-3 px-4 py-3 rounded-lg text-sm ${
                            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                            {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                            <span>{message.text}</span>
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="relative"><Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="Enter your email" /></div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <div className="relative"><Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="Create a strong password" /></div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">VIP Code</label>
                        <div className="relative"><Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="text" value={vipCode} onChange={(e) => setVipCode(e.target.value)} required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="Enter your exclusive VIP code" /></div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-amber-500 text-white py-3 rounded-lg font-medium hover:from-amber-600 hover:to-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                        {loading ? 'Creating Account...' : 'Register as VIP'}
                        {!loading && <User className="h-5 w-5" />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VipSignup;