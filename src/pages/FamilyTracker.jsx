import React from 'react';
import FamilyTracker from '../components/FamilyTracker';

const FamilyTrackerPage = () => (
    <div
        style={{
            height: '80vh',
            margin: '30px 16px',
            border: '3px solid #e5e7eb',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            background: '#fff',
            overflow: 'hidden',
            boxSizing: 'border-box',
        }}
    >
        <FamilyTracker />
    </div>
);

export default FamilyTrackerPage;

