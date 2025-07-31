import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Menu, X, User, Settings, LogOut, ChevronDown, Crown, ShieldCheck, ShieldAlert, Users, ScrollText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import VipAuthModal from './VipAuthModal';
import { useTranslation } from 'react-i18next'; // 1. Import useTranslation
import logo from '../assets/logo.png'; // Assuming you have a logo image

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
        { name: t('Know-more'), href: '/tales', current: location.pathname === '/tales' },
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
            <nav className="bg-white border-b-4 border-kumbh-orange shadow-md font-inter">
                <div className="max-w-8xl px-3 sm:px-3 lg:my-2">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo and brand name - always left */}
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center space-x-3">
                                <img src={logo} alt="Logo" className="h-12 w-12" />
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">{t('kumbhShilp')}</h1>
                                    <p className="text-sm text-gray-600">{t('navigationPortal')}</p>
                                </div>
                            </Link>
                        </div>
                        {/* Desktop Navigation & Controls - always right */}
                        <div className="flex items-center">
                            <div className="hidden md:flex items-center space-x-8 mx-9">
                                {navigation.map((item) => (
                                    <Link key={item.name} to={item.href} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${item.current ? 'bg-amber-100 text-amber-600' : 'text-amber-600  hover:bg-gray-50'}`}>{item.name}</Link>
                                ))}
                            </div>
                            <div className="hidden md:flex items-center space-x-4 mx-9">
                                <button onClick={handleLanguageToggle} className="px-3 py-1 w-12 rounded-md bg-amber-100 text-amber-700 text-sm font-medium hover:bg-amber-200">
                                    {i18n.language === 'en' ? 'हिं' : 'EN'}
                                </button>
                                {showAuthenticatedUserInfo ? (
                                    <div className="relative" ref={userDropdownRef}>
                                        <button
                                            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-white transition-colors ${
                                                isAdmin ? 'bg-slate-700 hover:bg-slate-800' : isVip ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500' : 'bg-amber-600 hover:bg-amber-700'
                                            }`}
                                        >
                                            {isAdmin ? <ShieldCheck className="h-4 w-4" /> : isVip ? <Crown className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                            <span>{getDisplayName()}</span>
                                        </button>
                                        {isUserDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border">
                                                {isAdmin && (
                                                    <Link to="/verify-alerts" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-amber-600 hover:bg-gray-100">
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
                                    <div className="relative" ref={authDropdownRef}>
                                        <button onClick={() => setIsAuthDropdownOpen(!isAuthDropdownOpen)} className="flex items-center space-x-2 px-4 py-2 rounded-md bg-amber-600 text-white hover:bg-amber-700">
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
                            {/* Mobile menu button - always right */}
                            <div className="md:hidden flex items-center ml-2">
                                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-700 hover:text-amber-600">
                                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation - Slide in from right, half screen, visually appealing */}
                {isMenuOpen && (
                    <div className="absolute inset-0 z-50 flex justify-end md:hidden">
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setIsMenuOpen(false)}></div>
                        {/* Menu Panel */}
                        <div className="relative w-4/5 max-w-sm h-full bg-white shadow-2xl border-l border-kumbh-orange rounded-l-3xl flex flex-col px-6 py-8 animate-slide-in-right overflow-y-auto">
                            {/* Header */}
                            <div className="flex items-center mb-9">
                                <img src={logo} alt="Logo" className="h-10 w-10 rounded-full shadow-md mr-3" />
                                <div>
                                    <h2 className="text-lg font-bold text-kumbh-orange tracking-wide">{t('kumbhShilp')}</h2>
                                    <p className="text-xs text-amber-600">{t('navigationPortal')}</p>
                                </div>
                            </div>
                            {/* Navigation Links */}
                            <div className="flex flex-col mb-6">
                                {navigation.map((item, idx) => (
                                    <React.Fragment key={item.name}>
                                        <Link to={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-md text-base font-semibold transition-colors ${item.current ? 'text-amber-700 bg-amber-50 border-l-4 border-kumbh-orange' : 'text-amber-600 hover:text-kumbh-orange'}`} onClick={() => setIsMenuOpen(false)}>
                                            {item.name === t('home') && <MapPin className="h-4 w-4 text-kumbh-orange" />}
                                            {item.name === t('map') && <ShieldCheck className="h-4 w-4 text-blue-400" />}
                                            {item.name === t('alerts') && <ShieldAlert className="h-4 w-4 text-red-400" />}
                                            {item.name === t('about') && <User className="h-4 w-4 text-gray-400" />}
                                            {item.name === t('family') && <Users className="h-4 w-4 text-amber-400" />}
                                            {item.name === t('familyTracker') && <Settings className="h-4 w-4 text-green-400" />}
                                            {item.name === t('Know-more') && <ScrollText className="h-4 w-4 text-amber-800" />}
                                            <span>{item.name}</span>
                                        </Link>
                                        {idx < navigation.length - 1 && <hr className="border-t border-amber-100 mx-2" />}
                                    </React.Fragment>
                                ))}
                            </div>
                            <div className="border-t pt-6 mt-auto space-y-3">
                                {showAuthenticatedUserInfo ? (
                                    <>
                                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold shadow-sm ${
                                            isAdmin ? 'bg-slate-200 text-slate-800' : isVip ? 'bg-amber-100 text-amber-800' : 'bg-white text-gray-800'
                                        }`}>
                                            {isAdmin ? <ShieldCheck className="h-5 w-5 text-slate-700" /> : isVip ? <Crown className="h-5 w-5 text-amber-500" /> : <User className="h-5 w-5 text-gray-500" />}
                                            <span>{getDisplayName()}</span>
                                        </div>
                                        {isAdmin && (
                                            <Link to="/verify-alerts" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-amber-700 bg-amber-100 shadow-sm hover:bg-amber-200">
                                                <ShieldAlert className="h-5 w-5 text-amber-700" />
                                                <span>{t('verifyAlerts') || 'Verify Alerts'}</span>
                                            </Link>
                                        )}
                                        <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-gray-700 bg-white shadow-sm hover:bg-amber-100">
                                            <Settings className="h-5 w-5 text-gray-700" /> <span>{t('profile') || 'Profile'}</span>
                                        </Link>
                                        <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl bg-red-500 text-white text-base font-semibold shadow-sm hover:bg-red-600">
                                            <LogOut className="h-5 w-5" /> <span>{t('logout') || 'Logout'}</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => { setIsAuthModalOpen(true); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-base font-semibold text-gray-700 bg-white shadow-sm hover:bg-amber-100">
                                            <User className="h-5 w-5 text-amber-500" /> <span>{t('signIn') || 'Sign In'}</span>
                                        </button>
                                        <button onClick={() => { setIsVipAuthModalOpen(true); setIsMenuOpen(false); }} className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-base font-semibold text-gray-700 bg-white shadow-sm hover:bg-amber-100">
                                            <Crown className="h-5 w-5 text-amber-500" /> <span>{t('vipSignIn') || 'VIP Sign In'}</span>
                                        </button>
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