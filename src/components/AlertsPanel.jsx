// src/components/AlertsPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Info, MapPin, X, Loader2, Crown, ShieldCheck, CheckCircle } from 'lucide-react';
import { rtdb } from '../firebase/config';
import { ref, onValue, push, set, remove, query, orderByChild, equalTo } from 'firebase/database';
import { useAuth } from '../context/AuthContext';

const AlertsPanel = () => {
    // ✅ ADDED: Get username from the context
    const { userId, currentUser, userRole, username, isAuthReady } = useAuth();
    const [alerts, setAlerts] = useState([]);
    const [newAlert, setNewAlert] = useState('');
    const [alertType, setAlertType] = useState('info');
    const [isPostingAlert, setIsPostingAlert] = useState(false);
    const [alertPostError, setAlertPostError] = useState(null);
    const [alertPostSuccess, setAlertPostSuccess] = useState(false);
    const [lastAlertTimestamp, setLastAlertTimestamp] = useState(0);
    const COOLDOWN_PERIOD_MS = 10000;
    const MAP_ALERT_EXPIRY_MS = 2 * 60 * 1000;

    const expiryTimeoutsRef = useRef({});

    useEffect(() => {
        if (!isAuthReady) return;
        
        const alertsQuery = query(ref(rtdb, 'alerts'), orderByChild('verified'), equalTo(true));

        const unsubscribe = onValue(alertsQuery, (snapshot) => {
            const data = snapshot.val();
            const now = Date.now();
            const newTimeouts = { ...expiryTimeoutsRef.current };

            if (data) {
                const alertsList = Object.entries(data).map(([key, value]) => {
                    if (value.type === 'map-alert' && value.expiryTimestamp) {
                        if (value.expiryTimestamp <= now) {
                            if (userId && (value.postedByUserId === userId || userRole === 'admin')) {
                                remove(ref(rtdb, `alerts/${key}`));
                            }
                            return null;
                        }
                        if (!newTimeouts[key]) {
                             const timeRemaining = value.expiryTimestamp - now;
                             newTimeouts[key] = setTimeout(() => {
                                 if (userId && (value.postedByUserId === userId || userRole === 'admin')) {
                                     remove(ref(rtdb, `alerts/${key}`));
                                 }
                             }, timeRemaining);
                        }
                    }
                    return { id: key, ...value };
                }).filter(alert => alert !== null);
                
                setAlerts(alertsList.sort((a, b) => b.timestamp - a.timestamp));
            } else {
                setAlerts([]);
            }
            expiryTimeoutsRef.current = newTimeouts;
        });
        
        return () => {
            unsubscribe();
            Object.values(expiryTimeoutsRef.current).forEach(clearTimeout);
            expiryTimeoutsRef.current = {};
        };
    }, [isAuthReady, userId, userRole]);

    const addAlert = async () => {
        setAlertPostError(null);
        setAlertPostSuccess(false);
        if (!newAlert.trim()) { setAlertPostError("Alert message cannot be empty."); return; }
        const now = Date.now();
        if (now - lastAlertTimestamp < COOLDOWN_PERIOD_MS) { setAlertPostError(`Please wait ${Math.ceil((COOLDOWN_PERIOD_MS - (now - lastAlertTimestamp)) / 1000)} seconds.`); return; }
        if (!userId || !currentUser || currentUser.isAnonymous) { setAlertPostError("You must be logged in to post alerts."); return; }
        
        setIsPostingAlert(true);
        try {
            const newAlertRef = push(ref(rtdb, 'alerts'));
            // ✅ CHANGED: Add postedByUsername to the alert data
            const alertData = {
                message: newAlert.trim(),
                type: alertType,
                timestamp: now,
                postedByUserId: userId,
                postedByUserEmail: currentUser.email || 'Guest',
                postedByUsername: username || currentUser.email.split('@')[0], // Use username, fallback to part of email
                postedByUserRole: userRole || 'pilgrim',
                verified: userRole === 'admin',
            };

            if (alertType === 'map-alert') {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
                }).catch(() => null);
                if (!position) { setAlertPostError("Could not get your location."); setIsPostingAlert(false); return; }
                alertData.latitude = position.coords.latitude;
                alertData.longitude = position.coords.longitude;
                alertData.expiryTimestamp = now + MAP_ALERT_EXPIRY_MS;
            }

            await set(newAlertRef, alertData);
            setNewAlert('');
            setAlertType('info');
            setLastAlertTimestamp(Date.now());
            if (userRole !== 'admin') setAlertPostSuccess(true);
        } catch (error) {
            setAlertPostError(`Failed to post alert: ${error.message}.`);
        } finally {
            setIsPostingAlert(false);
        }
    };

    const dismissAlert = (alertId) => {
        if (expiryTimeoutsRef.current[alertId]) {
            clearTimeout(expiryTimeoutsRef.current[alertId]);
            delete expiryTimeoutsRef.current[alertId];
        }
        remove(ref(rtdb, `alerts/${alertId}`)).catch(err => {
            console.error("Failed to dismiss alert:", err);
            setAlertPostError("You do not have permission to delete this alert.");
        });
    };
    
    const getAlertIcon = (alert) => {
        if (alert.postedByUserRole === 'admin') return <ShieldCheck className="h-5 w-5 text-slate-600" />;
        if (alert.postedByUserRole === 'vip') return <Crown className="h-5 w-5 text-amber-600" />;
        switch (alert.type) {
            case 'warning': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
            case 'map-alert': return <MapPin className="h-5 w-5 text-purple-600" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getAlertStyle = (alert) => {
        if (alert.postedByUserRole === 'admin') return 'bg-slate-100 border-slate-300 text-slate-800';
        if (alert.postedByUserRole === 'vip') return 'bg-amber-50 border-amber-200 text-amber-800';
        switch (alert.type) {
            case 'warning': return 'bg-orange-50 border-orange-200 text-orange-800';
            case 'map-alert': return 'bg-purple-50 border-purple-200 text-purple-800';
            default: return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    if (!isAuthReady) return <div className="flex items-center justify-center min-h-screen text-gray-600">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 font-inter">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Alerts & Announcements</h1>
                    <p className="text-gray-600">Stay updated with real-time, verified information.</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit an Alert for Review</h2>
                    {alertPostError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{alertPostError}</div>}
                    {alertPostSuccess && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5" />
                            <span>Your alert has been submitted for verification. Thank you!</span>
                        </div>
                    )}
                    <div className="space-y-4">
                        <select value={alertType} onChange={(e) => setAlertType(e.target.value)} disabled={isPostingAlert || !userId || currentUser?.isAnonymous} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="info">Information</option>
                            <option value="warning">Warning</option>
                            <option value="map-alert">Map Alert</option>
                        </select>
                        <textarea value={newAlert} onChange={(e) => setNewAlert(e.target.value)} rows={3} placeholder="Enter your alert message..." disabled={isPostingAlert || !userId || currentUser?.isAnonymous} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        <button onClick={addAlert} disabled={isPostingAlert || !userId || currentUser?.isAnonymous} className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 flex items-center justify-center disabled:opacity-50">
                            {isPostingAlert ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit for Review'}
                        </button>
                        {(!userId || currentUser?.isAnonymous) && <p className="text-sm text-red-500 mt-2">You must be logged in to submit an alert.</p>}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Verified Alerts</h2>
                    {alerts.length === 0 ? (
                        <div className="text-center py-8"><Info className="h-10 w-10 text-gray-400 mx-auto mb-3" /><h3 className="text-md font-medium">No verified alerts</h3><p className="text-sm text-gray-500">Check back later.</p></div>
                    ) : (
                        <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                            {alerts.map((alert) => (
                                <div key={`board-item-${alert.id}`} className={`border rounded-lg p-4 ${getAlertStyle(alert)}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3 flex-grow">
                                            {getAlertIcon(alert)}
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <p className="font-semibold">{alert.message}</p>
                                                    {alert.postedByUserRole === 'admin' && <span className="text-xs font-bold text-white bg-slate-600 px-2 py-0.5 rounded-full">ADMIN</span>}
                                                </div>
                                                <p className="text-sm opacity-75">
                                                    {new Date(alert.timestamp).toLocaleString()}
                                                    {/* ✅ CHANGED: Display username instead of email */}
                                                    {alert.postedByUsername && <span className="ml-2 text-xs opacity-80">(by {alert.postedByUsername})</span>}
                                                    {alert.type === 'map-alert' && alert.expiryTimestamp && <span className="ml-2 text-xs font-bold text-red-700">(Expires in {Math.ceil((alert.expiryTimestamp - Date.now()) / 60000)} min)</span>}
                                                </p>
                                            </div>
                                        </div>
                                        {(userRole === 'admin' || (userId && alert.postedByUserId === userId)) && (
                                            <button onClick={() => dismissAlert(alert.id)} className="p-1 hover:bg-black/10 rounded-lg transition-colors flex-shrink-0" title="Dismiss alert">
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AlertsPanel;