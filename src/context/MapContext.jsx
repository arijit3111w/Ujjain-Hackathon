import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const MapContext = createContext();

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};

// VIP route definitions - keeping them centralized
export const vipRouteDefinitions = [
  {
    id: 'vip-route-railway',
    name: 'Railway Station VIP Corridor',
    shortName: 'Railway Route',
    description: 'Dedicated VIP route from Ujjain Railway Station to Ram Ghat',
    category: 'transport',
    startPoint: {
      name: 'Ujjain Railway Station',
      coords: [23.178748186934527, 75.78077726776382]
    },
    endPoint: {
      name: 'Ram Ghat',
      coords: [23.188590, 75.764980]
    },
    color: '#DC2626', // red-600
    priority: 1
  },
  {
    id: 'vip-route-airport',
    name: 'Airport VIP Corridor',
    shortName: 'Airport Route',
    description: 'Dedicated VIP route from Indore Airport to Ram Ghat',
    category: 'transport',
    startPoint: {
      name: 'Indore Airport',
      coords: [22.72886556278097, 75.80378815227787]
    },
    endPoint: {
      name: 'Ram Ghat',
      coords: [23.188590, 75.764980]
    },
    color: '#DC2626', // red-600
    priority: 2
  },
  {
    id: 'vip-route-temple-ramghat',
    name: 'Temple VIP Corridor',
    shortName: 'Temple Route',
    description: 'Dedicated VIP route from Mahakaleshwar Temple to Ram Ghat',
    category: 'religious',
    startPoint: {
      name: 'Mahakaleshwar Temple',
      coords: [23.18278, 75.76833]
    },
    endPoint: {
      name: 'Ram Ghat',
      coords: [23.188590, 75.764980]
    },
    color: '#DC2626', // red-600
    priority: 3
  },
  {
    id: 'vip-route-ramghat-gyanganga',
    name: 'Ghat VIP Corridor',
    shortName: 'Ghat Route',
    description: 'Dedicated VIP route from Ram Ghat to Gyan Ganga Ghat',
    category: 'religious',
    startPoint: {
      name: 'Ram Ghat',
      coords: [23.188590, 75.764980]
    },
    endPoint: {
      name: 'Gyan Ganga Ghat',
      coords: [23.1902, 75.7653]
    },
    color: '#DC2626', // red-600
    priority: 4
  }
];

export const MapProvider = ({ children }) => {
  const { userId, userRole, isAuthReady } = useAuth();
  const [vipRouteControls, setVipRouteControls] = useState(
    vipRouteDefinitions.reduce((acc, route) => {
      acc[route.id] = {
        active: false,
        waitingTime: 15,
        loading: false
      };
      return acc;
    }, {})
  );
  const [vipRoutes, setVipRoutes] = useState([]);
  const [loadingVipRoutes, setLoadingVipRoutes] = useState(true);

  // Access global __app_id
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

  // Listen to VIP route controls from Firestore
  useEffect(() => {
    if (!isAuthReady) return;

    setLoadingVipRoutes(true);
    const vipRouteControlsRef = collection(db, `artifacts/${appId}/public/data/vip_route_controls`);
    const vipRouteControlsQuery = query(vipRouteControlsRef, orderBy('priority', 'asc'));

    const unsubscribeControls = onSnapshot(vipRouteControlsQuery, (snapshot) => {
      const firestoreControls = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        firestoreControls[doc.id] = {
          active: data.active || false,
          waitingTime: data.waitingTime || 15,
          loading: false
        };
      });

      // Merge with default controls, prioritizing Firestore data
      const mergedControls = { ...vipRouteControls };
      Object.keys(firestoreControls).forEach(routeId => {
        if (mergedControls[routeId]) {
          mergedControls[routeId] = {
            ...mergedControls[routeId],
            ...firestoreControls[routeId]
          };
        }
      });

      setVipRouteControls(mergedControls);
      setLoadingVipRoutes(false);
    }, (error) => {
      console.error("Error fetching VIP route controls:", error);
      setLoadingVipRoutes(false);
    });

    return () => unsubscribeControls();
  }, [isAuthReady, appId]);

  // Listen to active VIP routes from Firestore
  useEffect(() => {
    if (!isAuthReady) return;

    const vipRoutesRef = collection(db, `artifacts/${appId}/public/data/active_vip_routes`);
    const vipRoutesQuery = query(vipRoutesRef, orderBy('priority', 'asc'));

    const unsubscribeRoutes = onSnapshot(vipRoutesQuery, (snapshot) => {
      const activeRoutes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setVipRoutes(activeRoutes);
    }, (error) => {
      console.error("Error fetching active VIP routes:", error);
    });

    return () => unsubscribeRoutes();
  }, [isAuthReady, appId]);

  // Update VIP route control in Firestore
  const updateVipRouteControl = useCallback(async (routeId, updates) => {
    if (!isAuthReady || userRole !== 'admin') {
      console.warn("Unauthorized attempt to update VIP route control");
      return;
    }

    try {
      const routeControlRef = doc(db, `artifacts/${appId}/public/data/vip_route_controls`, routeId);
      const routeDef = vipRouteDefinitions.find(r => r.id === routeId);
      
      await setDoc(routeControlRef, {
        ...updates,
        routeId,
        priority: routeDef?.priority || 999,
        lastUpdated: new Date(),
        updatedBy: userId
      }, { merge: true });

      // Update local state optimistically
      setVipRouteControls(prev => ({
        ...prev,
        [routeId]: { ...prev[routeId], ...updates }
      }));

    } catch (error) {
      console.error("Error updating VIP route control:", error);
    }
  }, [isAuthReady, userRole, userId, appId]);

  // Fetch and store individual VIP route
  const fetchIndividualVipRoute = useCallback(async (routeId) => {
    const routeDef = vipRouteDefinitions.find(r => r.id === routeId);
    if (!routeDef) return null;

    // Set loading state
    await updateVipRouteControl(routeId, { 
      ...vipRouteControls[routeId], 
      loading: true 
    });

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${routeDef.startPoint.coords[1]},${routeDef.startPoint.coords[0]};${routeDef.endPoint.coords[1]},${routeDef.endPoint.coords[0]}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const routeCoordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

        const enrichedRoute = {
          ...routeDef,
          coordinates: routeCoordinates,
          distance: route.distance / 1000,
          duration: route.duration / 60,
          waitingTime: vipRouteControls[routeId].waitingTime,
          lastUpdated: new Date(),
          updatedBy: userId
        };

        // Store the active route in Firestore
        const activeRouteRef = doc(db, `artifacts/${appId}/public/data/active_vip_routes`, routeId);
        await setDoc(activeRouteRef, enrichedRoute);

        return enrichedRoute;
      }
    } catch (error) {
      console.error(`Error fetching VIP route ${routeDef.name}:`, error);
    } finally {
      // Clear loading state
      await updateVipRouteControl(routeId, { 
        ...vipRouteControls[routeId], 
        loading: false 
      });
    }

    return null;
  }, [vipRouteControls, updateVipRouteControl, userId, appId]);

  // Remove VIP route from active routes
  const removeVipRoute = useCallback(async (routeId) => {
    if (!isAuthReady || userRole !== 'admin') {
      console.warn("Unauthorized attempt to remove VIP route");
      return;
    }

    try {
      // Remove from Firestore active routes
      const activeRouteRef = doc(db, `artifacts/${appId}/public/data/active_vip_routes`, routeId);
      await setDoc(activeRouteRef, { deleted: true, deletedAt: new Date() });
      
      // Update control state
      await updateVipRouteControl(routeId, { active: false });

    } catch (error) {
      console.error("Error removing VIP route:", error);
    }
  }, [isAuthReady, userRole, updateVipRouteControl, appId]);

  // Handle individual VIP route toggle
  const handleVipRouteToggle = useCallback(async (routeId) => {
    if (!isAuthReady || userRole !== 'admin') {
      console.warn("Unauthorized attempt to toggle VIP route");
      return;
    }

    const currentState = vipRouteControls[routeId];

    if (currentState.active) {
      // Deactivate route
      await updateVipRouteControl(routeId, { active: false });
      await removeVipRoute(routeId);
    } else {
      // Activate route
      await updateVipRouteControl(routeId, { active: true });
      await fetchIndividualVipRoute(routeId);
    }
  }, [vipRouteControls, updateVipRouteControl, removeVipRoute, fetchIndividualVipRoute, isAuthReady, userRole]);

  // Handle waiting time change
  const handleWaitingTimeChange = useCallback(async (routeId, waitingTime) => {
    if (!isAuthReady || userRole !== 'admin') {
      console.warn("Unauthorized attempt to change waiting time");
      return;
    }

    const time = Math.max(1, Math.min(120, parseInt(waitingTime) || 15));
    await updateVipRouteControl(routeId, { 
      ...vipRouteControls[routeId], 
      waitingTime: time 
    });

    // Update existing active route if present
    const activeRoute = vipRoutes.find(route => route.id === routeId);
    if (activeRoute) {
      const activeRouteRef = doc(db, `artifacts/${appId}/public/data/active_vip_routes`, routeId);
      await setDoc(activeRouteRef, { 
        ...activeRoute, 
        waitingTime: time,
        lastUpdated: new Date(),
        updatedBy: userId
      }, { merge: true });
    }
  }, [vipRouteControls, updateVipRouteControl, vipRoutes, isAuthReady, userRole, userId, appId]);

  // Get count of active VIP routes
  const activeVipRoutesCount = Object.values(vipRouteControls).filter(control => control.active).length;

  const value = {
    // VIP Route Management
    vipRouteDefinitions,
    vipRouteControls,
    vipRoutes,
    loadingVipRoutes,
    activeVipRoutesCount,
    handleVipRouteToggle,
    handleWaitingTimeChange,
    fetchIndividualVipRoute,
    
    // State management
    updateVipRouteControl,
    removeVipRoute
  };

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};