// src/pages/VerifyAlertsPage.jsx
import React, { useState, useEffect } from 'react';
import { rtdb } from '../firebase/config';
import { ref, onValue, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { Check, X, ShieldAlert, Clock } from 'lucide-react';

const VerifyAlertsPage = () => {
    const [unverifiedAlerts, setUnverifiedAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unverifiedQuery = query(ref(rtdb, 'alerts'), orderByChild('verified'), equalTo(false));
        const unsubscribe = onValue(unverifiedQuery, (snapshot) => {
            const data = snapshot.val();
            const alertsList = data ? Object.entries(data).map(([key, value]) => ({ id: key, ...value })) : [];
            setUnverifiedAlerts(alertsList.sort((a, b) => a.timestamp - b.timestamp));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleApprove = (alertId) => {
        const alertRef = ref(rtdb, `alerts/${alertId}`);
        update(alertRef, { verified: true }).catch(err => console.error("Failed to approve alert:", err));
    };

    const handleDeny = (alertId) => {
        const alertRef = ref(rtdb, `alerts/${alertId}`);
        remove(alertRef).catch(err => console.error("Failed to deny alert:", err));
    };

    if (loading) {
        return <div className="text-center py-10">Loading alerts for verification...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-10">
            <div className="max-w-5xl mx-auto px-4">
                <div className="flex items-center space-x-3 mb-6">
                    <ShieldAlert className="h-8 w-8 text-amber-600" />
                    <h1 className="text-3xl font-bold text-gray-900">Verify User Alerts</h1>
                </div>
                <div className="bg-white rounded-lg shadow-md border border-gray-200">
                    {unverifiedAlerts.length === 0 ? (
                        <div className="text-center p-12 text-gray-500">
                            <Check className="h-12 w-12 mx-auto mb-4 text-green-500" />
                            <h2 className="text-xl font-semibold">All alerts are verified.</h2>
                            <p>Great job, the queue is empty!</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {unverifiedAlerts.map(alert => (
                                <li key={alert.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between space-y-3 md:space-y-0">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">{alert.message}</p>
                                        <div className="text-sm text-gray-500 flex items-center space-x-4 mt-1">
                                            <span><strong className="font-medium">By:</strong> {alert.postedByUserEmail}</span>
                                            <span className="flex items-center"><Clock className="h-4 w-4 mr-1" /> {new Date(alert.timestamp).toLocaleString()}</span>
                                            <span><strong className="font-medium">Type:</strong> {alert.type}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 flex-shrink-0">
                                        <button onClick={() => handleApprove(alert.id)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                                            <Check className="h-5 w-5" />
                                            <span>Approve</span>
                                        </button>
                                        <button onClick={() => handleDeny(alert.id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                                            <X className="h-5 w-5" />
                                            <span>Deny</span>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyAlertsPage;