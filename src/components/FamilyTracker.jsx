import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { 
    Users, AlertTriangle, LocateFixed, Route, Loader2, List,
    ArrowUp, ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight, 
    CornerDownLeft, CornerDownRight, RotateCcw, RotateCw, MapPin
} from 'lucide-react';

// --- LEAFLET ICON SETUP ---

// Fix for default Leaflet marker icons not showing up correctly.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for the current user's location.
const userLocationIcon = L.divIcon({
  html: `<div style="background-color: #3B82F6; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-locate-fixed">
            <line x1="2" x2="5" y1="12" y2="12"></line><line x1="19" x2="22" y1="12" y2="12"></line><line x1="12" x2="12" y1="2" y2="5"></line><line x1="12" x2="12" y1="19" y2="22"></line><circle cx="12" cy="12" r="7"></circle><circle cx="12" cy="12" r="3"></circle>
          </svg>
        </div>`,
  className: 'user-location-marker',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

// Custom icon for family members.
const familyMemberIcon = (username) => L.divIcon({
  html: `<div style="background-color: #8B5CF6; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; font-family: sans-serif;">
          ${username ? username.charAt(0).toUpperCase() : '?'}
        </div>`,
  className: 'family-member-marker',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});


// --- COMPONENT DEFINITION ---

const FamilyTracker = () => {
  // --- STATE AND HOOKS ---
  const { currentUser, userId, familyId, isAuthReady } = useAuth();
  const [userLocation, setUserLocation] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [familyMemberLocations, setFamilyMemberLocations] = useState([]);
  const [liveLocations, setLiveLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [geolocationError, setGeolocationError] = useState(null);
  const [mapCenter, setMapCenter] = useState([23.1793, 75.7849]);
  
  // --- MODIFIED: Added detailed routing state ---
  const [dynamicRoute, setDynamicRoute] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routingError, setRoutingError] = useState(null);
  const [routeInstructions, setRouteInstructions] = useState([]);
  const [showInstructionsPanel, setShowInstructionsPanel] = useState(false);
  const [totalRouteDistance, setTotalRouteDistance] = useState(0);
  const [totalRouteDuration, setTotalRouteDuration] = useState(0);

  // --- NEW: Added state for compass heading ---
  const [heading, setHeading] = useState(null);

  const mapRef = useRef();
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

  // --- HELPER FUNCTIONS ---
  const isValidLatLng = (lat, lng) => {
    return typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng) &&
           lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  const getManeuverIcon = useCallback((type, modifier) => {
    const iconProps = { className: "h-5 w-5 flex-shrink-0 text-gray-700" };
    switch (type) {
      case 'turn':
      case 'new name':
        if (modifier.includes('left')) return <ArrowLeft {...iconProps} />;
        if (modifier.includes('right')) return <ArrowRight {...iconProps} />;
        if (modifier.includes('uturn')) return <RotateCcw {...iconProps} />;
        return <ArrowUp {...iconProps} />;
      case 'continue':
        return <ArrowUp {...iconProps} />;
      case 'roundabout':
      case 'rotary':
        return <RotateCw {...iconProps} />;
      case 'depart':
      case 'arrive':
        return <MapPin {...iconProps} />;
      default:
        return <ArrowUp {...iconProps} />;
    }
  }, []);


  // --- DATA FETCHING AND PROCESSING EFFECTS ---

  // 1. Fetch all live locations from Firestore.
  useEffect(() => {
    const liveLocationsCollectionRef = collection(db, `artifacts/${appId}/public/data/live_pilgrim_locations`);
    const unsubscribe = onSnapshot(liveLocationsCollectionRef, (snapshot) => {
      const fetchedLocations = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(loc => isValidLatLng(loc.latitude, loc.longitude));
      setLiveLocations(fetchedLocations);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching live locations:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [appId]);

  // 2. Fetch the user's family member data if they are in a family.
  useEffect(() => {
    if (!familyId) {
      setFamilyMembers([]);
      return;
    }
    const familyDocRef = doc(db, `artifacts/${appId}/families`, familyId);
    const unsubscribe = onSnapshot(familyDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const membersData = docSnap.data().members || {};
        const otherMembers = Object.values(membersData).filter(member => member.uid !== userId);
        setFamilyMembers(otherMembers);
      } else {
        setFamilyMembers([]);
      }
    }, (error) => {
      console.error("Error fetching family data:", error);
    });
    return () => unsubscribe();
  }, [familyId, userId, appId]);

  // 3. Combine family member data with their live locations.
  useEffect(() => {
    if (familyMembers.length === 0 || liveLocations.length === 0) {
        setFamilyMemberLocations([]);
        return;
    }
    const locationsMap = new Map(liveLocations.map(loc => [loc.id, { latitude: loc.latitude, longitude: loc.longitude }]));
    const mergedMembers = familyMembers.map(member => {
        const location = locationsMap.get(member.uid);
        if (location) {
            return { 
                ...member,
                id: member.uid,
                coords: [location.latitude, location.longitude],
                name: member.username,
            };
        }
        return null;
    }).filter(Boolean);
    setFamilyMemberLocations(mergedMembers);
  }, [familyMembers, liveLocations]);

  // 4. Get and update the user's live geolocation.
  useEffect(() => {
    if (!isAuthReady) return;
    let watchId = null;
    const successHandler = (position) => {
      const { latitude, longitude } = position.coords;
      if (isValidLatLng(latitude, longitude)) {
        setUserLocation([latitude, longitude]);
        setGeolocationError(null);
      }
    };
    const errorHandler = (error) => {
        let message = "Could not get your location.";
        if (error.code === error.PERMISSION_DENIED) {
            message = "Location access denied. Please enable it in your browser settings.";
        }
        setGeolocationError(message);
    };
    if (!navigator.geolocation) {
      setGeolocationError("Geolocation is not supported by your browser.");
      return;
    }
    watchId = navigator.geolocation.watchPosition(successHandler, errorHandler, {
      enableHighAccuracy: true, timeout: 10000, maximumAge: 0
    });
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, [isAuthReady]);
  
  // --- NEW: Effect to get device orientation for the compass ---
  useEffect(() => {
    const handleOrientation = (event) => {
      // webkitCompassHeading is for iOS devices and is generally more reliable.
      const newHeading = event.webkitCompassHeading || Math.abs(event.alpha - 360);
      setHeading(newHeading);
    };

    // Check for browser support and add the event listener.
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    // Cleanup function to remove the listener when the component unmounts.
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // 5. Calculate the center of the map based on available locations.
  useEffect(() => {
    const allCoords = [];
    if (userLocation) {
        allCoords.push(userLocation);
    }
    familyMemberLocations.forEach(member => {
        allCoords.push(member.coords);
    });

    if (allCoords.length > 0 && mapRef.current) {
        const bounds = L.latLngBounds(allCoords);
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [userLocation, familyMemberLocations]);


  // --- MODIFIED: Updated Routing Logic ---

  const fetchRoute = useCallback(async (startCoords, endCoords) => {
    setIsRouting(true);
    setRoutingError(null);
    setDynamicRoute(null);
    setRouteInstructions([]);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson&steps=true`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.code === 'Ok' && data.routes?.length > 0) {
        const route = data.routes[0];
        setDynamicRoute(route.geometry.coordinates.map(c => [c[1], c[0]]));
        
        const instructions = route.legs[0].steps.map(step => {
            let instructionText = step.maneuver.instruction; // Fallback
            const direction = step.maneuver.modifier || '';
            const roadName = step.name ? `onto <strong>${step.name}</strong>` : '';
            
            switch(step.maneuver.type) {
                case 'turn': instructionText = `Turn ${direction} ${roadName}`; break;
                case 'new name': instructionText = `Continue ${roadName}`; break;
                case 'depart': instructionText = `Head ${direction} ${roadName}`; break;
                case 'arrive': instructionText = `You have arrived at your destination`; break;
                case 'merge': instructionText = `Merge ${direction} ${roadName}`; break;
                case 'ramp': case 'on ramp': case 'off ramp': instructionText = `Take the ramp ${direction} ${roadName}`; break;
                case 'fork': instructionText = `Keep ${direction} at the fork ${roadName}`; break;
                case 'end of road': instructionText = `Turn ${direction} at the end of the road ${roadName}`; break;
                case 'roundabout': instructionText = `At the roundabout, take the ${step.maneuver.exit} exit ${roadName}`; break;
                case 'rotary': instructionText = `Enter the rotary and take the ${step.maneuver.exit} exit ${roadName}`; break;
                case 'continue': instructionText = `Continue straight for ${Math.round(step.distance)} meters`; break;
                default: break; // Keep original instruction
            }

            return {
              instruction: instructionText.replace(/  +/g, ' ').trim(),
              distance: step.distance,
              type: step.maneuver.type,
              modifier: step.maneuver.modifier
            };
        });

        setRouteInstructions(instructions);
        setTotalRouteDistance(route.distance);
        setTotalRouteDuration(route.duration);
        setShowInstructionsPanel(true);

      } else {
        setRoutingError(data.message || 'No route could be found.');
      }
    } catch (error) {
      setRoutingError("Failed to fetch route. Please check your network connection.");
    } finally {
      setIsRouting(false);
    }
  }, []);
  
  useEffect(() => {
    if (selectedDestination && userLocation) {
      fetchRoute(userLocation, selectedDestination.coords);
    } else {
        setDynamicRoute(null);
        setRouteInstructions([]);
        setShowInstructionsPanel(false);
        setRoutingError(null);
    }
  }, [selectedDestination, userLocation, fetchRoute]);

  const handleDestinationSelect = (destination) => {
    if (selectedDestination && selectedDestination.id === destination.id) {
        setSelectedDestination(null);
    } else {
        setSelectedDestination(destination);
    }
  };

  // --- RENDER LOGIC ---

  if (!isAuthReady || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-4">
        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
        <p className="mt-4 text-lg text-gray-600">Loading Family Tracker...</p>
      </div>
    );
  }
  
  if (!currentUser || currentUser.isAnonymous || !familyId) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-4">
        <Users className="h-12 w-12 mx-auto text-gray-400" />
        <h2 className="mt-4 text-2xl font-bold">Family Not Found</h2>
        <p className="mt-2 text-gray-600">
          { !familyId ? "You must join or create a family to use the tracker." : "Please sign in to view your family." }
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen relative font-inter">
      {(geolocationError || routingError) && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-red-100 text-red-700 p-3 rounded-lg shadow-lg flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5" />
          <span>{geolocationError || routingError}</span>
        </div>
      )}

      {routeInstructions.length > 0 && (
        <div className="absolute top-4 right-4 z-[1000]">
            <button
                onClick={() => setShowInstructionsPanel(!showInstructionsPanel)}
                className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
                title={showInstructionsPanel ? "Hide Directions" : "Show Directions"}
            >
                <List className="h-6 w-6 text-gray-700" />
            </button>
        </div>
      )}
      
      {/* --- NEW: Compass UI Element --- */}
      {/* This will only render if the browser has provided a heading */}
      {heading !== null && (
        <div 
          className="absolute bottom-4 left-4 z-[1000] bg-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center transition-transform duration-200"
          style={{ transform: `rotate(${-heading}deg)` }}
          title={`Heading: ${Math.round(heading)}°`}
        >
          <ArrowUp className="w-8 h-8 text-red-600" />
        </div>
      )}

      {showInstructionsPanel && routeInstructions.length > 0 && (
        <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-sm w-full max-h-[calc(100vh-4rem)] overflow-y-auto">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                <Route className="h-5 w-5 text-violet-600" />
                <span>Directions to {selectedDestination?.name}</span>
            </h4>
            <p className="text-sm text-gray-600 mb-3 border-b pb-3">
                Total Distance: <strong>{(totalRouteDistance / 1000).toFixed(2)} km</strong>
                <br/>
                Estimated Time: <strong>{Math.round(totalRouteDuration / 60)} min</strong>
            </p>
            <ul className="space-y-3 text-sm text-gray-800 pt-2">
                {routeInstructions.map((step, index) => (
                    <li key={index} className="flex items-start space-x-3">
                        {getManeuverIcon(step.type, step.modifier)}
                        <div className="flex-1">
                            <p dangerouslySetInnerHTML={{ __html: step.instruction }}></p>
                            <p className="font-semibold text-gray-500 text-xs">
                                {step.distance > 0 ? `${Math.round(step.distance)} meters` : ''}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
      )}

      <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} ref={mapRef} className="z-0">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />

        {userLocation && (
          <Marker position={userLocation} icon={userLocationIcon}>
            <Popup>You are here.</Popup>
          </Marker>
        )}

        {familyMemberLocations.map((member) => (
          <Marker key={member.id} position={member.coords} icon={familyMemberIcon(member.username)}>
            <Popup>
                <div className="p-1 text-center">
                    <h3 className="font-bold text-base mb-2">{member.name}</h3>
                    {userLocation ? (
                        <button
                            onClick={() => handleDestinationSelect(member)}
                            disabled={isRouting}
                            className="w-full flex justify-center items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-violet-100 text-violet-700 hover:bg-violet-200 disabled:opacity-50"
                        >
                            {isRouting && selectedDestination?.id === member.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Route className="h-4 w-4" />}
                            {selectedDestination?.id === member.id ? 'Hide Route' : 'Show Route'}
                        </button>
                    ) : (
                         <p className="text-xs text-gray-500">Enable your location to see route.</p>
                    )}
                </div>
            </Popup>
          </Marker>
        ))}

        {dynamicRoute && <Polyline positions={dynamicRoute} color="#4f46e5" weight={5} opacity={0.8} />}
      </MapContainer>
    </div>
  );
};

export default FamilyTracker;