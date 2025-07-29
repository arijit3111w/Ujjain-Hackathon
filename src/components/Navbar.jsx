import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Menu, X, User, Settings, LogOut, ChevronDown, Crown, ShieldCheck, ShieldAlert } from 'lucide-react'; 
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import VipAuthModal from './VipAuthModal';
import { useTranslation } from 'react-i18next'; // 1. Import useTranslation

const Navbar = () => {
    const { t, i18n } = useTranslation(); // 2. Initialize the hook
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isVipAuthModalOpen, setIsVipAuthModalOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
    // const [language, setLanguage] = useState('EN'); // 3. REMOVE old language state
    const location = useLocation();

    const userDropdownRef = useRef(null);
    const authDropdownRef = useRef(null);
    
    const { currentUser, logout, username, userRole, isAuthReady } = useAuth();

    const showAuthenticatedUserInfo = isAuthReady && currentUser && !currentUser.isAnonymous;
    const isAdmin = showAuthenticatedUserInfo && userRole === 'admin';
    const isVip = showAuthenticatedUserInfo && userRole === 'vip';

    const baseNavigation = [
        { name: t('home'), href: '/', current: location.pathname === '/' },
        { name: t('map'), href: '/map', current: location.pathname === '/map' },
        { name: t('alerts'), href: '/alerts', current: location.pathname === '/alerts' },
        { name: t('about'), href: '/about', current: location.pathname === '/about' },
    ];

    const navigation = showAuthenticatedUserInfo 
        ? [
              ...baseNavigation.slice(0, 3), 
              { name: t('family'), href: '/family', current: location.pathname === '/family' },
              { name: t('familyTracker'), href: '/family-tracker', current: location.pathname === '/family-tracker' },
              ...baseNavigation.slice(3)
          ]
        : baseNavigation;
    
    // 4. New handler to change language
    const handleLanguageToggle = () => {
        const newLang = i18n.language === 'en' ? 'hi' : 'en';
        i18n.changeLanguage(newLang);
    };

    const getDisplayName = () => {
        if (!currentUser) return '';
        if (currentUser.isAnonymous) return 'Anonymous User';
        if (username) return username;
        return currentUser.email || 'Logged In User';
    };

    const useOutsideAlerter = (ref, close) => {
        useEffect(() => {
            const handleClickOutside = (event) => {
                if (ref.current && !ref.current.contains(event.target)) close();
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, [ref, close]);
    };

    useOutsideAlerter(userDropdownRef, () => setIsUserDropdownOpen(false));
    useOutsideAlerter(authDropdownRef, () => setIsAuthDropdownOpen(false));

    const handleLogout = () => {
        logout();
        setIsUserDropdownOpen(false);
        setIsMenuOpen(false);
    };

    return (
        <>
            <nav className="bg-white shadow-lg border-b-4 border-violet-500 font-inter">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        {/* Logo and brand name */}
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center space-x-3">
                                <div className="bg-gradient-to-r from-violet-600 to-orange-500 p-2 rounded-lg">
                                    <MapPin className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    {/* USE t() function for translation */}
                                    <h1 className="text-xl font-bold text-gray-900">{t('kumbhShilp')}</h1>
                                    <p className="text-sm text-gray-600">{t('navigationPortal')}</p>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Navigation links */}
                        <div className="hidden md:flex items-center space-x-8">
                           {navigation.map((item) => ( <Link key={item.name} to={item.href} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${item.current ? 'bg-violet-100 text-violet-700' : 'text-gray-700 hover:text-violet-600 hover:bg-gray-50' }`} > {item.name} </Link> ))}
                        </div>

                        {/* Desktop Auth & Controls */}
                        <div className="hidden md:flex items-center space-x-4">
                            <button onClick={handleLanguageToggle} className="px-3 py-1 w-12 rounded-md bg-orange-100 text-orange-700 text-sm font-medium hover:bg-orange-200">
                                {i18n.language === 'en' ? 'हिं' : 'EN'}
                            </button>

                            {showAuthenticatedUserInfo ? (
                                // Authenticated User Dropdown
                                <div className="relative" ref={userDropdownRef}>
                                    <button
                                        onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-white transition-colors ${
                                            isAdmin ? 'bg-slate-700 hover:bg-slate-800' : isVip ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500' : 'bg-violet-600 hover:bg-violet-700'
                                        }`}
                                    >
                                        {isAdmin ? <ShieldCheck className="h-4 w-4" /> : isVip ? <Crown className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                        <span>{getDisplayName()}</span>
                                    </button>
                                    {isUserDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border">
                                            {isAdmin && (
                                                <Link to="/verify-alerts" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-violet-600 hover:bg-gray-100">
                                                    <ShieldAlert className="h-4 w-4" /><span>{t('verifyAlerts')}</span>
                                                </Link>
                                            )}
                                            <Link to="/profile" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                <Settings className="h-4 w-4" /><span>{t('profile')}</span>
                                            </Link>
                                            <button onClick={handleLogout} className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                <LogOut className="h-4 w-4" /><span>{t('logout')}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Auth Dropdown for non-logged-in users
                                <div className="relative" ref={authDropdownRef}>
                                    <button onClick={() => setIsAuthDropdownOpen(!isAuthDropdownOpen)} className="flex items-center space-x-2 px-4 py-2 rounded-md bg-violet-600 text-white hover:bg-violet-700">
                                        <User className="h-4 w-4" /><span>{t('login')}</span><ChevronDown className="h-4 w-4" />
                                    </button>
                                    {isAuthDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border">
                                            <button onClick={() => { setIsAuthModalOpen(true); setIsAuthDropdownOpen(false); }} className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                <User className="h-4 w-4" /><span>{t('signIn')}</span>
                                            </button>
                                            <button onClick={() => { setIsVipAuthModalOpen(true); setIsAuthDropdownOpen(false); }} className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                <Crown className="h-4 w-4 text-amber-500" /><span>{t('vipSignIn')}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                         {/* Mobile menu button */}
                        <div className="md:hidden flex items-center">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-700 hover:text-violet-600">
                                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden border-t bg-white">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navigation.map((item) => ( <Link key={item.name} to={item.href} className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${item.current ? 'bg-violet-100 text-violet-700' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setIsMenuOpen(false)} > {item.name} </Link> ))}
                            <div className="border-t pt-4 mt-4 space-y-2">
                                {showAuthenticatedUserInfo ? (
                                    <>
                                        <div className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-semibold ${
                                            isAdmin ? 'bg-slate-200 text-slate-800' : isVip ? 'bg-amber-100 text-amber-800' : 'text-gray-800'
                                        }`}>
                                            {isAdmin ? <ShieldCheck className="h-5 w-5" /> : isVip ? <Crown className="h-5 w-5" /> : null}
                                            <span>{getDisplayName()}</span>
                                        </div>
                                        {isAdmin && (
                                            <Link to="/verify-alerts" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-violet-600 hover:bg-gray-50">
                                                <ShieldAlert className="h-5 w-5" />
                                                <span>Verify Alerts</span>
                                            </Link>
                                        )}
                                        <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"> <Settings className="h-5 w-5" /> <span>Profile</span> </Link>
                                        <button onClick={handleLogout} className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md bg-red-500 text-white text-base font-medium"> <LogOut className="h-5 w-5" /> <span>Logout</span> </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => { setIsAuthModalOpen(true); setIsMenuOpen(false); }} className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"> <User className="h-5 w-5" /> <span>Sign In</span> </button>
                                        <button onClick={() => { setIsVipAuthModalOpen(true); setIsMenuOpen(false); }} className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"> <Crown className="h-5 w-5 text-amber-500" /> <span>VIP Sign In</span> </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            <VipAuthModal isOpen={isVipAuthModalOpen} onClose={() => setIsVipAuthModalOpen(false)} />
        </>
    );
};

export default Navbar;