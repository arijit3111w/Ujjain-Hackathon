// This file centralizes the definitions for VIP routes.
export const vipRouteDefinations = [
    {
        id: 'vip-route-railway',
        name: 'Railway Station VIP Corridor',
        shortName: 'Railway Route',
        description: 'Dedicated VIP route from Ujjain Railway Station to Ram Ghat',
        category: 'transport',
        startPoint: { name: 'Ujjain Railway Station', coords: [23.1787, 75.7807] },
        endPoint: { name: 'Ram Ghat', coords: [23.1885, 75.7649] },
        color: '#DC2626', // red-600
        priority: 1
    },
    {
        id: 'vip-route-airport',
        name: 'Airport VIP Corridor', 
        shortName: 'Airport Route',
        description: 'Dedicated VIP route from Indore Airport to Ram Ghat',
        category: 'transport',
        startPoint: { name: 'Indore Airport', coords: [22.7288, 75.8037] },
        endPoint: { name: 'Ram Ghat', coords: [23.1885, 75.7649] },
        color: '#DC2626', // red-600
        priority: 2
    },
    {
        id: 'vip-route-temple-ramghat',
        name: 'Temple VIP Corridor',
        shortName: 'Temple Route',
        description: 'Dedicated VIP route from Mahakaleshwar Temple to Ram Ghat',
        category: 'religious',
        startPoint: { name: 'Mahakaleshwar Temple', coords: [23.1827, 75.7683] },
        endPoint: { name: 'Ram Ghat', coords: [23.1885, 75.7649] },
        color: '#DC2626', // red-600
        priority: 3
    },
    {
        id: 'vip-route-ramghat-gyanganga',
        name: 'Ghat VIP Corridor',
        shortName: 'Ghat Route',
        description: 'Dedicated VIP route from Ram Ghat to Gyan Ganga Ghat',
        category: 'religious',
        startPoint: { name: 'Ram Ghat', coords: [23.1885, 75.7649] },
        endPoint: { name: 'Gyan Ganga Ghat', coords: [23.1902, 75.7653] },
        color: '#DC2626', // red-600
        priority: 4
    }
];
