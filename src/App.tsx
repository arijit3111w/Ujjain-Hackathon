import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MapProvider } from './context/MapContext'; // 1. Import the MapProvider
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Map from './pages/Map';
import AlertsPanel from './components/AlertsPanel';
import About from './pages/About';
import ProfilePage from './pages/ProfilePage';
import VipSignup from './pages/VipSignup';
import VerifyAlertsPage from './pages/VerifyAlertsPage';
import AdminRoute from './components/AdminRoute';
import FamilyPage from './pages/FamilyPage';
import FamilyTrackerPage from './pages/FamilyTracker';

const AppContent = () => {
    const { isAuthReady } = useAuth();
    if (!isAuthReady) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/map" element={<Map />} />
                    <Route path="/alerts" element={<AlertsPanel />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/vip-signup" element={<VipSignup />} />
                    <Route path="/family" element={<FamilyPage />} />
                    <Route path="/family-tracker" element={<FamilyTrackerPage />} />
                    <Route
                        path="/verify-alerts" 
                        element={
                            <AdminRoute>
                                <VerifyAlertsPage />
                            </AdminRoute>
                        } 
                    />
                </Routes>
            </main>
            <Footer />
        </div>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                {/* 2. Wrap the AppContent with MapProvider */}
                <MapProvider>
                    <AppContent />
                </MapProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
