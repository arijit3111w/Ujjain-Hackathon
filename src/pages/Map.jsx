import React from 'react';
import MapView from '../components/MapView';

const Map = () => (
    <div
        style={{
            height: '80vh',
            // Use responsive margin for spacing on all screen sizes
            margin: '30px 16px', // 30px top/bottom, 16px left/right
            border: '3px solid #e5e7eb',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            background: '#fff',
            overflow: 'hidden',
            boxSizing: 'border-box',
        }}
    >
        <MapView />
    </div>
);

export default Map;