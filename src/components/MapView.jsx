import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { useMap } from '../context/MapContext';
import { db } from '../firebase/config';
import { collection, onSnapshot, doc, setDoc, query } from 'firebase/firestore';
import {
  Navigation, MapPin, Car, Users, AlertTriangle, LocateFixed, Route, List,
  ArrowUp, ArrowUpRight, ArrowRight, ArrowDownRight, ArrowDown, ArrowDownLeft,
  ArrowLeft, ArrowUpLeft, CornerDownLeft, CornerDownRight, RefreshCw, ChevronRight,
  RotateCcw, RotateCw, Crown, Shield, Clock, ChevronDown, ChevronUp, Settings, Bus
} from 'lucide-react';
import staticImportantLocationsData from '../data/importantLocations.json';
import shuttleServicesData from '../data/shuttleServices.json';
import RamGhatImage from '../assets/Ram_Ghat.jpg';
import MahakaleshwarTempleImage from '../assets/Mahakaleshwar_Temple.jpg';
import HarsiddhiTempleImage from '../assets/Harsiddhi_Temple.jpg';
import BhartrihariCavesImage from '../assets/Bhartrihari_Caves.webp';
import TriveniGhatImage from '../assets/Triveni_Ghat.webp';

const localImagesMap = {
  RamGhat: RamGhatImage,
    MahakaleshwarTemple: MahakaleshwarTempleImage,
    HarsiddhiTemple: HarsiddhiTempleImage,
    BhartrihariCaves: BhartrihariCavesImage,
    TriveniGhat: TriveniGhatImage

};

// Define potential crowd hotspot zones with a threshold for congestion
const dynamicCrowdHotspotsDefinitions = [
  {
    id: 'dynamic-hotspot-1',
    name: 'Ram Ghat Area (Dynamic)',
    coords: [23.1810, 75.7790],
    radius: 150,
    minPilgrims: 5,
  },
  {
    id: 'dynamic-hotspot-2',
    name: 'Mahakaleshwar Temple Entrance (Dynamic)',
    coords: [23.1780, 75.7865],
    radius: 100,
    minPilgrims: 3,
  },
];

// Define fixed dummy crowd hotspots for demonstration purposes.
const fixedDemoCrowdHotspots = [
  {
    id: 'fixed-demo-hotspot-1',
    name: 'Demo Area A',
    coords: [23.1750, 75.7820],
    radius: 80,
  },
  {
    id: 'fixed-demo-hotspot-2',
    name: 'Demo Area B',
    coords: [23.1830, 75.7890],
    radius: 120,
  },
];

// Fix default markers for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for user's current location
const userLocationIcon = L.divIcon({
  html: `<div style="background-color: #3B82F6; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-locate-fixed">
             <line x1="2" x2="5" y1="12" y2="12"></line>
             <line x1="19" x2="22" y1="12" y2="12"></line>
             <line x1="12" x2="12" y1="2" y2="5"></line>
             <line x1="12" x2="12" y1="19" y2="22"></line>
             <circle cx="12" cy="12" r="7"></circle>
             <circle cx="12" cy="12" r="3"></circle>
           </svg>
         </div>`,
  className: 'user-location-marker',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

const shuttleStopIcon = L.divIcon({
    html: `<div style="background-color: #9333ea; width: 25px; height: 25px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
             <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bus"><path d="M8 6v6"/><path d="M16 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
           </div>`,
    className: 'shuttle-stop-marker',
    iconSize: [25, 25],
    iconAnchor: [12, 12]
});

const MapView = () => {
  // Access authentication context
  const { userId, userRole, isAuthReady } = useAuth();

  // Access map context for VIP routes
  const {
    vipRouteDefinitions,
    vipRouteControls,
    vipRoutes,
    activeVipRoutesCount,
    handleVipRouteToggle,
    handleWaitingTimeChange,
    loadingVipRoutes
  } = useMap();

  // State for map data
  const [importantLocations] = useState(
      staticImportantLocationsData.map((loc, index) => {
        if (loc.imageKey && localImagesMap[loc.imageKey]) {
          return { ...loc, id: loc.id || index, imageUrl: localImagesMap[loc.imageKey] };
        }
        return { ...loc, id: loc.id || index };
      })
  );
  const [livePilgrimLocations, setLivePilgrimLocations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  // UI state
  const [dynamicRoute, setDynamicRoute] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [routeInstructions, setRouteInstructions] = useState([]);
  const [showInstructionsPanel, setShowInstructionsPanel] = useState(false);
  const [totalRouteDistance, setTotalRouteDistance] = useState(0);
  const [totalRouteDuration, setTotalRouteDuration] = useState(0);
  const [routingError, setRoutingError] = useState(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routeRequested, setRouteRequested] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showShuttleService, setShowShuttleService] = useState(false);
  const [loadingLiveLocations, setLoadingLiveLocations] = useState(true);
  const [geolocationError, setGeolocationError] = useState(null);

  // State for geolocation retry mechanism
  const [geolocationRetryCount, setGeolocationRetryCount] = useState(0);
  const GEOLOCATION_MAX_RETRIES = 3;
  const GEOLOCATION_RETRY_DELAY_MS = 5000;

  // State to hold active crowd alerts (dynamic heatmap areas)
  const [dynamicCrowdAlerts, setDynamicCrowdAlerts] = useState([]);

  // UI State for VIP controls
  const [showVipControls, setShowVipControls] = useState(false);

  const mapRef = useRef();

  // Ujjain coordinates (center of Simhastha)
  const center = [23.1793, 75.7849];

  // Access global __app_id
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

  // Helper function to validate coordinates
  const isValidLatLng = (lat, lng) => {
    return typeof lat === 'number' && typeof lng === 'number' &&
        !isNaN(lat) && !isNaN(lng) &&
        lat >= -90 && lat <= 90 &&
        lng >= -180 && lng <= 180;
  };

  // Fetch Live Pilgrim Locations from Firestore
  useEffect(() => {
    setLoadingLiveLocations(true);
    const liveLocationsCollectionRef = collection(db, `artifacts/${appId}/public/data/live_pilgrim_locations`);

    const unsubscribe = onSnapshot(liveLocationsCollectionRef, (snapshot) => {
      const fetchedLiveLocations = snapshot.docs.map(doc => {
        const data = doc.data();
        let latitude = data.latitude;
        let longitude = data.longitude;

        if (!isValidLatLng(latitude, longitude)) {
          console.warn(`Invalid or missing coordinates for live pilgrim ID: ${doc.id}. Data:`, data);
          return null;
        }

        return {
          id: doc.id,
          latitude: latitude,
          longitude: longitude,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : data.timestamp,
          userId: data.userId
        };
      }).filter(pilgrim => pilgrim !== null);

      setLivePilgrimLocations(fetchedLiveLocations);
      setLoadingLiveLocations(false);
    }, (error) => {
      console.error("Error fetching live pilgrim locations:", error);
      setLoadingLiveLocations(false);
    });

    return () => unsubscribe();
  }, [appId]);

  // Get and Update User's Live Geolocation
  useEffect(() => {
    if (!isAuthReady || !userId) {
      console.log("Auth not ready or userId not available for geolocation tracking.");
      return;
    }

    let watchId = null;

    const updateUserLocationInFirestore = async (position) => {
      const { latitude, longitude } = position.coords;

      if (!isValidLatLng(latitude, longitude)) {
        console.error("Attempted to update Firestore with invalid coordinates:", latitude, longitude);
        return;
      }

      const userLocationDocRef = doc(db, `artifacts/${appId}/public/data/live_pilgrim_locations`, userId);

      try {
        await setDoc(userLocationDocRef, {
          latitude,
          longitude,
          timestamp: new Date(),
          userId: userId
        });
      } catch (error) {
        console.error("Error updating user location in Firestore:", error);
      }
    };

    const successHandler = (position) => {
      const { latitude, longitude } = position.coords;

      if (isValidLatLng(latitude, longitude)) {
        setUserLocation([latitude, longitude]);
        setGeolocationError(null);
        setGeolocationRetryCount(0);
        updateUserLocationInFirestore(position);
      } else {
        setGeolocationError("Received invalid geolocation coordinates.");
        console.error("Received invalid geolocation coordinates:", latitude, longitude);
      }
    };

    const errorHandler = (error) => {
      let errorMessage = "An unknown geolocation error occurred.";

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Geolocation permission denied. Please enable location services for this site.";
          setGeolocationError(errorMessage);
          console.error("Geolocation error:", errorMessage, error);
          if (watchId) navigator.geolocation.clearWatch(watchId);
          return;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information is unavailable. Attempting to re-acquire...";
          break;
        case error.TIMEOUT:
          errorMessage = "The request to get user location timed out. Attempting to re-acquire...";
          break;
        default:
          errorMessage = `Geolocation error: ${error.message || error.code}. Attempting to re-acquire...`;
      }

      setGeolocationError(errorMessage);
      console.error("Geolocation error:", errorMessage, error);

      if (geolocationRetryCount < GEOLOCATION_MAX_RETRIES) {
        setGeolocationRetryCount(prev => prev + 1);
        console.log(`Retrying geolocation... Attempt ${geolocationRetryCount + 1}`);
        if (watchId) navigator.geolocation.clearWatch(watchId);
        setTimeout(startGeolocationWatch, GEOLOCATION_RETRY_DELAY_MS);
      } else {
        setGeolocationError("Failed to get location after multiple attempts. Please check your device's location settings.");
        console.error("Geolocation failed after max retries.");
        if (watchId) navigator.geolocation.clearWatch(watchId);
      }
    };

    const startGeolocationWatch = () => {
      if (!navigator.geolocation) {
        setGeolocationError("Geolocation is not supported by your browser.");
        console.error("Geolocation is not supported by your browser.");
        return;
      }

      watchId = navigator.geolocation.watchPosition(successHandler, errorHandler, {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 6000
      });

      console.log("Geolocation watch started.");
    };

    startGeolocationWatch();

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        console.log("Geolocation watch stopped during cleanup.");
      }
    };
  }, [isAuthReady, userId, appId, geolocationRetryCount]);

  // Dynamic Crowd Heatmap Calculation based on Live Pilgrim Locations
  useEffect(() => {
    if (!showHeatmap) {
      setDynamicCrowdAlerts([]);
      return;
    }

    const newDynamicCrowdAlerts = [];

    dynamicCrowdHotspotsDefinitions.forEach(hotspot => {
      let pilgrimsInArea = 0;

      livePilgrimLocations.forEach(pilgrim => {
        if (isValidLatLng(pilgrim.latitude, pilgrim.longitude)) {
          const distance = L.latLng(hotspot.coords[0], hotspot.coords[1])
              .distanceTo(L.latLng(pilgrim.latitude, pilgrim.longitude));

          if (distance <= hotspot.radius) {
            pilgrimsInArea++;
          }
        }
      });

      if (pilgrimsInArea >= hotspot.minPilgrims) {
        newDynamicCrowdAlerts.push({ ...hotspot, currentPilgrims: pilgrimsInArea });
      }
    });

    setDynamicCrowdAlerts(newDynamicCrowdAlerts);
  }, [livePilgrimLocations, showHeatmap]);

  // Helper to get Lucide icon based on OSRM maneuver
  const getManeuverIcon = useCallback((type, modifier) => {
    const iconProps = { className: "h-5 w-5 flex-shrink-0 text-gray-700" };

    switch (type) {
      case 'turn':
      case 'new name':
        if (modifier === 'left') return <ArrowLeft {...iconProps} />;
        if (modifier === 'sharp left') return <CornerDownLeft {...iconProps} />;
        if (modifier === 'slight left') return <ArrowUpLeft {...iconProps} />;
        if (modifier === 'right') return <ArrowRight {...iconProps} />;
        if (modifier === 'sharp right') return <CornerDownRight {...iconProps} />;
        if (modifier === 'slight right') return <ArrowUpRight {...iconProps} />;
        if (modifier === 'uturn') return <RotateCcw {...iconProps} />;
        return <ArrowUp {...iconProps} />;
      case 'continue':
        return <ArrowUp {...iconProps} />;
      case 'roundabout':
        return <RotateCw {...iconProps} />;
      case 'depart':
        return <MapPin {...iconProps} />;
      case 'arrive':
        return <MapPin {...iconProps} />;
      default:
        return <ArrowUp {...iconProps} />;
    }
  }, []);

  // Routing Engine Integration (OSRM)
  const fetchRoute = useCallback(async (startCoords, endCoords) => {
    setIsRouting(true);
    setRoutingError(null);
    setRouteInstructions([]);
    setTotalRouteDistance(0);
    setTotalRouteDuration(0);

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson&steps=true`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const routeCoordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

        setDynamicRoute(routeCoordinates);
        console.log("Route fetched successfully:", routeCoordinates);

        const instructions = route.legs[0].steps.map(step => {
          const formattedDistance = step.distance >= 1000
              ? `${(step.distance / 1000).toFixed(1)} km`
              : `${Math.round(step.distance)} m`;

          let instructionText = step.maneuver.instruction;

          if (step.maneuver.type === 'turn' || step.maneuver.type === 'new name') {
            const direction = step.maneuver.modifier ? step.maneuver.modifier.replace('slight ', 'slight ').replace('sharp ', 'sharp ') : '';
            instructionText = `Turn ${direction} onto ${step.name || 'road'}`;
            if (step.distance > 0) {
              instructionText += ` in ${formattedDistance}`;
            }
          } else if (step.maneuver.type === 'continue') {
            instructionText = `Continue ${step.name ? `onto ${step.name}` : 'straight'}`;
            if (step.distance > 0) {
              instructionText += ` for ${formattedDistance}`;
            }
          } else if (step.maneuver.type === 'depart') {
            instructionText = `Depart from ${step.name || 'current location'}`;
          } else if (step.maneuver.type === 'arrive') {
            instructionText = `Arrive at ${step.name || 'destination'}`;
          } else if (step.maneuver.type === 'roundabout') {
            instructionText = `Enter roundabout, take ${step.maneuver.exit === 1 ? '1st' : step.maneuver.exit === 2 ? '2nd' : step.maneuver.exit === 3 ? '3rd' : `${step.maneuver.exit}th`} exit`;
            if (step.name) instructionText += ` onto ${step.name}`;
          }

          return {
            instruction: instructionText,
            distance: step.distance,
            duration: step.duration,
            type: step.maneuver.type,
            modifier: step.maneuver.modifier
          };
        });

        setRouteInstructions(instructions);
        setShowInstructionsPanel(true);
        setTotalRouteDistance(route.distance / 1000);
        setTotalRouteDuration(route.duration / 60);

      } else {
        const errorMsg = data.code === 'NoRoute' ? 'No route found between these locations.' : `Routing error: ${data.message || 'Unknown error'}`;
        setRoutingError(errorMsg);
        setDynamicRoute(null);
        setRouteInstructions([]);
        setShowInstructionsPanel(false);
        setTotalRouteDistance(0);
        setTotalRouteDuration(0);
        console.error("Routing API error:", errorMsg, data);
      }

    } catch (error) {
      setRoutingError("Failed to fetch route. Please check your network connection.");
      setDynamicRoute(null);
      setRouteInstructions([]);
      setShowInstructionsPanel(false);
      setTotalRouteDistance(0);
      setTotalRouteDuration(0);
      console.error("Network error fetching route:", error);
    } finally {
      setIsRouting(false);
    }
  }, []);

  // Effect to trigger route calculation when userLocation or selectedDestination changes
  useEffect(() => {
    if (routeRequested && userLocation && selectedDestination && !isRouting) {
      fetchRoute(userLocation, selectedDestination.coords);
    } else if (!routeRequested) {
      setDynamicRoute(null);
      setRoutingError(null);
      setRouteInstructions([]);
      setShowInstructionsPanel(false);
      setTotalRouteDistance(0);
      setTotalRouteDuration(0);
    }
  }, [routeRequested, userLocation, selectedDestination, fetchRoute]);

  // Marker Icon Logic
  const getMarkerIcon = useCallback((type, vipAccess) => {
    const colors = {
      ghat: '#8B5CF6',
      temple: '#F97316',
      parking: '#059669',
      medical: '#DC2626'
    };

    const color = colors[type] || '#6B7280';
    const size = vipAccess && userRole === 'VIP' ? 40 : 30;

    return L.divIcon({
      html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
         <div style="color: white; font-size: 12px; font-weight: bold;">${type.charAt(0).toUpperCase()}</div>
       </div>`,
      className: 'custom-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }, [userRole]);

  // Filtered locations based on user role
  const filteredImportantLocations = userRole === 'VIP'
      ? importantLocations.filter(loc => isValidLatLng(loc.coords[0], loc.coords[1]))
      : importantLocations.filter(loc => !loc.vipAccess && isValidLatLng(loc.coords[0], loc.coords[1]));

  // Loading State and Error Display
  if (!isAuthReady || loadingLiveLocations || loadingVipRoutes) {
    return (
        <div className="flex items-center justify-center min-h-screen text-gray-600">
          Loading map data...
        </div>
    );
  }

  return (
      <div className="h-full w-full relative overflow-hidden">
        {/* Geolocation Error Message */}
        {geolocationError && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white p-3 rounded-lg shadow-lg flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>{geolocationError}</span>
            </div>
        )}

        {/* Routing Error Message */}
        {routingError && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white p-3 rounded-lg shadow-lg flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>{routingError}</span>
            </div>
        )}

        {/* VIP Routes Active Notification */}
        {activeVipRoutesCount > 0 && (
            <div className="absolute top-28 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white p-3 rounded-lg shadow-lg flex items-center space-x-2">
              <Crown className="h-5 w-5" />
              <span>{activeVipRoutesCount} VIP Route{activeVipRoutesCount > 1 ? 's' : ''} Active - Corridors Restricted</span>
            </div>
        )}

        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-40 space-y-2">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Map Controls</h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${userRole === 'VIP'
                  ? 'bg-orange-100 text-orange-700'
                  : userRole === 'admin'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-violet-100 text-violet-700'
              }`}>
                {userRole}
              </div>
            </div>
            <div className="space-y-2">
              <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showHeatmap
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <Users className="h-4 w-4" />
                <span>{showHeatmap ? 'Hide Crowd' : 'Show Crowd'}</span>
              </button>

              <button
                  onClick={() => setShowShuttleService(!showShuttleService)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showShuttleService
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <Bus className="h-4 w-4" />
                <span>{showShuttleService ? 'Hide Shuttles' : 'Show Shuttles'}</span>
              </button>

              {/* VIP Routes Control - Show only to admin users */}
              {userRole === 'admin' && (
                  <button
                      onClick={() => setShowVipControls(!showVipControls)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showVipControls
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span>VIP Route Controls</span>
                    </div>
                    {showVipControls ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
              )}

              {/* Toggle Instructions Panel Button */}
              {routeInstructions.length > 0 && (
                  <button
                      onClick={() => setShowInstructionsPanel(!showInstructionsPanel)}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showInstructionsPanel
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <List className="h-4 w-4" />
                    <span>{showInstructionsPanel ? 'Hide Directions' : 'Show Directions'}</span>
                  </button>
              )}
            </div>
          </div>

          {/* Individual VIP Route Controls Panel */}
          {userRole === 'admin' && showVipControls && (
              <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm max-h-96 overflow-y-auto">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-red-600" />
                  <span>VIP Route Management</span>
                </h4>
                <div className="space-y-4">
                  {vipRouteDefinitions.map((routeDef) => {
                    const control = vipRouteControls[routeDef.id];
                    return (
                        <div key={routeDef.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${control.active ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                              <span className="font-medium text-sm text-gray-900">{routeDef.shortName}</span>
                            </div>
                            <button
                                onClick={() => handleVipRouteToggle(routeDef.id)}
                                disabled={control.loading}
                                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${control.active
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                } ${control.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {control.loading ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                  control.active ? 'Deactivate' : 'Activate'
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{routeDef.description}</p>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <label className="text-xs text-gray-700">Wait Time:</label>
                            <input
                                type="number"
                                min="1"
                                max="120"
                                value={control.waitingTime}
                                onChange={(e) => handleWaitingTimeChange(routeDef.id, e.target.value)}
                                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-red-500"
                            />
                            <span className="text-xs text-gray-500">min</span>
                          </div>
                        </div>
                    );
                  })}
                </div>
                {activeVipRoutesCount > 0 && (
                    <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-700 font-medium">
                        {activeVipRoutesCount} route{activeVipRoutesCount > 1 ? 's' : ''} currently blocking traffic
                      </p>
                    </div>
                )}
              </div>
          )}

          {/* Turn-by-Turn Instructions Panel */}
          {showInstructionsPanel && routeInstructions.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm max-h-[calc(100vh-250px)] overflow-y-auto">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <Route className="h-5 w-5 text-blue-600" />
                  <span>Directions to {selectedDestination?.name}</span>
                </h4>
                {totalRouteDistance > 0 && (
                    <p className="text-sm text-gray-600 mb-3">
                      Total Distance: {totalRouteDistance.toFixed(2)} km <br />
                      Estimated Time: {totalRouteDuration.toFixed(0)} min
                    </p>
                )}
                <ul className="space-y-2 text-sm text-gray-700">
                  {routeInstructions.map((step, index) => (
                      <li key={index} className="flex items-start items-center">
                        <span className="mr-2 text-gray-500">{index + 1}.</span>
                        {getManeuverIcon(step.type, step.modifier)}
                        <div className="ml-2">
                          <p>{step.instruction}</p>
                          <p className="text-xs text-gray-500">
                            ({(step.distance / 1000).toFixed(2)} km, {Math.round(step.duration / 60)} min)
                          </p>
                        </div>
                      </li>
                  ))}
                </ul>
              </div>
          )}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-30">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Legend</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-violet-600"></div>
                <span>Ghats</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>Temples</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                <span>Parking</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <span>Medical</span>
              </div>
              {showHeatmap && (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 opacity-60"></div>
                    <span>Crowd Hotspots</span>
                  </div>
              )}
              {activeVipRoutesCount > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-1 bg-red-600"></div>
                    <span>VIP Routes (Restricted)</span>
                  </div>
              )}
              {showShuttleService && (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-1 border-t-2 border-dashed border-purple-600"></div>
                    <span>Shuttle Routes</span>
                  </div>
              )}
            </div>
          </div>
        </div>

        <MapContainer
            center={center}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
            className="z-0"
        >
          <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© OpenStreetMap contributors'
          />

          {/* Shuttle Service Routes and Markers */}
          {showShuttleService && shuttleServicesData.map(shuttle => (
              <React.Fragment key={shuttle.id}>
                <Polyline
                    positions={shuttle.route}
                    pathOptions={{ color: '#9333ea', weight: 5, opacity: 0.8, dashArray: '10, 10' }}
                >
                  <Popup>
                    <div className="max-w-xs">
                      <div className="flex items-center space-x-2 mb-2">
                        <Bus className="h-5 w-5 text-purple-600" />
                        <h4 className="font-semibold text-purple-800">{shuttle.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{shuttle.description}</p>
                      <div className="text-xs text-gray-500 mb-3 space-y-1">
                        <p><strong>Hours:</strong> {shuttle.operatingHours}</p>
                        <p><strong>Frequency:</strong> {shuttle.frequency}</p>
                        <p><strong>Fare:</strong> {shuttle.fare}</p>
                      </div>
                      <div className="border-t pt-2">
                        <h5 className="text-sm font-semibold text-gray-800 mb-1">Upcoming Departures</h5>
                        <ul className="text-xs text-gray-700 max-h-32 overflow-y-auto space-y-1">
                          {shuttle.schedule.map((trip, index) => (
                              <li key={index} className="flex justify-between items-center p-1 bg-gray-50 rounded">
                                <span>{trip.departure} → {trip.arrival}</span>
                                <span className={`font-medium ${trip.available > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                                  {trip.available} seats
                                </span>
                              </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Popup>
                </Polyline>
                <Marker position={shuttle.startLocation.coords} icon={shuttleStopIcon}>
                    <Popup>
                        <div className="font-semibold text-sm">Start: {shuttle.startLocation.name}</div>
                    </Popup>
                </Marker>
                <Marker position={shuttle.endLocation.coords} icon={shuttleStopIcon}>
                    <Popup>
                        <div className="font-semibold text-sm">End: {shuttle.endLocation.name}</div>
                    </Popup>
                </Marker>
              </React.Fragment>
          ))}

          {/* Important Location Markers */}
          {filteredImportantLocations.map((location) => (
              location.coords && (
                  <Marker
                      key={location.id}
                      position={location.coords}
                      icon={getMarkerIcon(location.type, location.vipAccess)}
                  >
                    <Popup>
                      <div style={{
                        padding: '0',
                        margin: '0',
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        width: '240px',
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        {location.imageUrl && (
                            <img
                                src={location.imageUrl}
                                alt={location.name}
                                style={{
                                  width: '100%',
                                  height: '120px',
                                  objectFit: 'cover',
                                  borderTopLeftRadius: '8px',
                                  borderTopRightRadius: '8px',
                                }}
                                className="popup-image"
                            />
                        )}
                        <div style={{ padding: '16px', textAlign: 'center' }}>
                          <h3 style={{
                            fontWeight: '600',
                            color: '#1a202c',
                            marginBottom: '8px',
                            fontSize: '1.125rem'
                          }}>{location.name}</h3>
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#4a5568',
                            marginTop: '4px'
                          }}>{location.description}</p>
                          {location.vipAccess && (
                              <div style={{
                                marginTop: '12px',
                                padding: '4px 8px',
                                backgroundColor: '#fffbeb',
                                color: '#c2410c',
                                fontSize: '0.75rem',
                                borderRadius: '9999px',
                                display: 'inline-block'
                              }}>
                                VIP Access
                              </div>
                          )}
                          <div style={{ marginTop: '16px' }}>
                            {userLocation ? (
                                <button
                                    onClick={() => {
                                      if (selectedDestination && selectedDestination.id === location.id) {
                                        setSelectedDestination(null);
                                        setRouteRequested(false);
                                      } else {
                                        setSelectedDestination(location);
                                        setRouteRequested(true);
                                      }
                                    }}
                                    style={{
                                      width: '100%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '8px',
                                      padding: '8px 12px',
                                      borderRadius: '8px',
                                      fontSize: '0.875rem',
                                      fontWeight: '500',
                                      transition: 'background-color 0.15s ease-in-out, color 0.15s ease-in-out',
                                      border: 'none',
                                      cursor: isRouting ? 'not-allowed' : 'pointer',
                                      opacity: isRouting ? 0.7 : 1,
                                      backgroundColor: selectedDestination && selectedDestination.id === location.id
                                          ? '#ede9fe'
                                          : '#f3f4f6',
                                      color: selectedDestination && selectedDestination.id === location.id
                                          ? '#7c3aed'
                                          : '#374151',
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!(selectedDestination && selectedDestination.id === location.id)) {
                                        e.currentTarget.style.backgroundColor = '#e5e7eb';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!(selectedDestination && selectedDestination.id === location.id)) {
                                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                                      }
                                    }}
                                    disabled={isRouting}
                                >
                                  {isRouting && selectedDestination?.id === location.id ? (
                                      <>
                                        <Route style={{ height: '1rem', width: '1rem' }} className="animate-spin" />
                                        <span>Routing...</span>
                                      </>
                                  ) : (
                                      <>
                                        <Route style={{ height: '1rem', width: '1rem' }} />
                                        <span>{selectedDestination && selectedDestination.id === location.id ? 'Hide Route' : 'Show Route'}</span>
                                      </>
                                  )}
                                </button>
                            ) : (
                                <p style={{
                                  fontSize: '0.75rem',
                                  color: '#6b7280',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <LocateFixed style={{ height: '0.75rem', width: '0.75rem', marginRight: '4px' }} />
                                  Get your location to show route
                                </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
              )
          ))}

          {/* User's Own Live Location Marker */}
          {userLocation && (
              <Marker position={userLocation} icon={userLocationIcon}>
                <Popup>Your current location</Popup>
              </Marker>
          )}

          {/* Dynamic Crowd Hotspot Circles */}
          {showHeatmap && dynamicCrowdAlerts.map(hotspot => (
              <Circle
                  key={hotspot.id}
                  center={hotspot.coords}
                  radius={hotspot.radius}
                  pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.3, weight: 2 }}
              >
                <Popup>
                  <h4 className="font-semibold">{hotspot.name}</h4>
                  <p className="text-sm text-gray-600">Live Crowd: {hotspot.currentPilgrims} pilgrims</p>
                </Popup>
              </Circle>
          ))}

          {/* Fixed Demo Crowd Hotspot Circles */}
          {showHeatmap && fixedDemoCrowdHotspots.map(hotspot => (
              <Circle
                  key={hotspot.id}
                  center={hotspot.coords}
                  radius={hotspot.radius}
                  pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.3, weight: 2 }}
              >
                <Popup>
                  <h4 className="font-semibold">{hotspot.name}</h4>
                  <p className="text-sm text-gray-600">Demonstration Hotspot</p>
                </Popup>
              </Circle>
          ))}

          {/* Individual VIP Routes Polylines */}
          {vipRoutes.map(route => (
              <Polyline
                  key={route.id}
                  positions={route.coordinates.map(p => [p.lat, p.lng])}
                  pathOptions={{
                    color: route.color,
                    weight: 6,
                    opacity: 0.8,
                    dashArray: '10, 5',
                  }}
              >
                <Popup>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Crown className="h-5 w-5 text-red-600" />
                      <h4 className="font-semibold text-red-600">{route.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{route.description}</p>
                    <div className="text-xs text-gray-500 mb-2">
                      <p>From: {route.startPoint.name}</p>
                      <p>To: {route.endPoint.name}</p>
                      {route.distance && <p>Distance: {route.distance.toFixed(2)} km</p>}
                    </div>
                    {route.waitingTime && (
                        <div className="mb-2 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs flex items-center justify-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Expected Wait: {route.waitingTime} min</span>
                        </div>
                    )}
                    <div className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                      🚫 RESTRICTED - VIP Only
                    </div>
                  </div>
                </Popup>
              </Polyline>
          ))}

          {/* Dynamic Route Polyline */}
          {dynamicRoute && dynamicRoute.length > 0 && (
              <Polyline
                  positions={dynamicRoute}
                  color="#007bff"
                  weight={5}
                  opacity={0.7}
              />
          )}
        </MapContainer>
      </div>
  );
};

export default MapView;

