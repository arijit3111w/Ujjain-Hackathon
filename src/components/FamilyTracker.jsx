import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import {
    Users, AlertTriangle, LocateFixed, Route, Loader2, List,
    ArrowUp, ArrowLeft, ArrowRight, CornerDownLeft, CornerDownRight,
    RotateCcw, RotateCw, MapPin, Locate, ChevronDown, ChevronUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// --- (No changes to Leaflet Icon setup) ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

const familyMemberIcon = (username, isActive = false) => L.divIcon({
    html: `<div style="
          background-color: ${isActive ? '#ec4899' : '#8B5CF6'}; 
          width: ${isActive ? '38px' : '30px'}; 
          height: ${isActive ? '38px' : '30px'}; 
          border-radius: 50%; 
          border: 3px solid white; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.4); 
          display: flex; align-items: center; justify-content: center; 
          color: white; font-weight: bold; 
          font-size: ${isActive ? '18px' : '14px'}; 
          font-family: sans-serif;
          transition: all 0.2s ease-in-out;
          ">
          ${username ? username.charAt(0).toUpperCase() : '?'}
        </div>`,
    className: 'family-member-marker',
    iconSize: [isActive ? 38 : 30, isActive ? 38 : 30],
    iconAnchor: [isActive ? 19 : 15, isActive ? 19 : 15]
});


const FamilyTracker = () => {
    const { currentUser, userId, familyId, isAuthReady } = useAuth();
    const [userLocation, setUserLocation] = useState(null);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [familyMemberLocations, setFamilyMemberLocations] = useState([]);
    const [liveLocations, setLiveLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [geolocationError, setGeolocationError] = useState(null);
    const [mapCenter, setMapCenter] = useState([20.2961, 85.8245]);

    const [dynamicRoute, setDynamicRoute] = useState(null);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [isRouting, setIsRouting] = useState(false);
    const [routingError, setRoutingError] = useState(null);
    const [routeInstructions, setRouteInstructions] = useState([]);
    const [showInstructionsPanel, setShowInstructionsPanel] = useState(true);
    const [totalRouteDistance, setTotalRouteDistance] = useState(0);
    const [totalRouteDuration, setTotalRouteDuration] = useState(0);

    const [heading, setHeading] = useState(null);
    const [isPanelExpanded, setIsPanelExpanded] = useState(false);

    const mapRef = useRef();
    const routeIntervalRef = useRef(null);
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    const isValidLatLng = (lat, lng) => {
        return typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng) &&
            lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    };

    const getManeuverIcon = useCallback((type, modifier) => {
        const iconProps = { className: "h-6 w-6 flex-shrink-0 text-violet-600" };
        switch (type) {
            case 'turn':
                if (modifier.includes('sharp left')) return <CornerDownLeft {...iconProps} />;
                if (modifier.includes('left')) return <ArrowLeft {...iconProps} />;
                if (modifier.includes('sharp right')) return <CornerDownRight {...iconProps} />;
                if (modifier.includes('right')) return <ArrowRight {...iconProps} />;
                if (modifier.includes('uturn')) return <RotateCcw {...iconProps} />;
                return <ArrowUp {...iconProps} />;
            case 'depart': return <LocateFixed {...iconProps} />;
            case 'arrive': return <MapPin {...iconProps} />;
            case 'continue': return <ArrowUp {...iconProps} />;
            case 'roundabout': case 'rotary': return <RotateCw {...iconProps} />;
            default: return <ArrowUp {...iconProps} />;
        }
    }, []);

    useEffect(() => {
        const liveLocationsCollectionRef = collection(db, `artifacts/${appId}/public/data/live_pilgrim_locations`);
        const unsubscribe = onSnapshot(liveLocationsCollectionRef, (snapshot) => {
            const fetchedLocations = snapshot.docs
                .map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date()
                    };
                })
                .filter(loc => isValidLatLng(loc.latitude, loc.longitude));
            setLiveLocations(fetchedLocations);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching live locations:", error);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [appId]);

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
            } else { setFamilyMembers([]); }
        }, (error) => { console.error("Error fetching family data:", error); });
        return () => unsubscribe();
    }, [familyId, userId, appId]);

    useEffect(() => {
        if (familyMembers.length === 0 || liveLocations.length === 0) {
            setFamilyMemberLocations([]);
            return;
        }
        const locationsMap = new Map(liveLocations.map(loc => [loc.id, { latitude: loc.latitude, longitude: loc.longitude, timestamp: loc.timestamp }]));
        const mergedMembers = familyMembers.map(member => {
            const location = locationsMap.get(member.uid);
            if (location) {
                return {
                    ...member,
                    id: member.uid,
                    coords: [location.latitude, location.longitude],
                    name: member.username,
                    lastSeen: formatDistanceToNow(location.timestamp, { addSuffix: true }),
                };
            }
            return null;
        }).filter(Boolean);
        setFamilyMemberLocations(mergedMembers);
    }, [familyMembers, liveLocations]);

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

    useEffect(() => {
        const handleOrientation = (event) => {
            const newHeading = event.webkitCompassHeading || Math.abs(event.alpha - 360);
            setHeading(newHeading);
        };
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', handleOrientation);
        }
        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, []);

    const recenterMap = useCallback(() => {
        if (!mapRef.current) return;
        const allCoords = [];
        if (userLocation) {
            allCoords.push(userLocation);
        }
        familyMemberLocations.forEach(member => {
            allCoords.push(member.coords);
        });

        if (allCoords.length > 0) {
            const bounds = L.latLngBounds(allCoords);
            mapRef.current.flyToBounds(bounds, { padding: [50, 50], duration: 1 });
        }
    }, [userLocation, familyMemberLocations]);

    const fetchRoute = useCallback(async (startCoords, endCoords, isSilent = false) => {
        if (!isSilent) setIsRouting(true);
        setRoutingError(null);
        try {
            const url = `https://router.project-osrm.org/route/v1/walking/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson&steps=true`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.code === 'Ok' && data.routes?.length > 0) {
                const route = data.routes[0];
                setDynamicRoute(route.geometry.coordinates.map(c => [c[1], c[0]]));

                if (!isSilent) {
                    const instructions = route.legs[0].steps.map(step => {
                        let text = step.maneuver.instruction;
                        const type = step.maneuver.type;
                        const modifier = step.maneuver.modifier || '';
                        const roadName = step.name ? `onto <strong>${step.name}</strong>` : '';

                        if (type === 'depart') { text = `Head ${modifier}`; }
                        else if (type === 'arrive') { text = `You will arrive at your destination`; }
                        else if (type === 'turn' || type === 'fork' || type === 'end of road') { text = `Turn ${modifier} ${roadName}`; }
                        else if (type === 'continue') { text = `Continue ${roadName}`; }
                        else if (type === 'roundabout') { text = `At the roundabout, take the ${step.maneuver.exit || ''} exit ${roadName}`; }

                        return {
                            instruction: text.replace(/  +/g, ' ').trim(),
                            distance: step.distance,
                            type: step.maneuver.type,
                            modifier: step.maneuver.modifier,
                        };
                    });
                    setRouteInstructions(instructions);
                }
                setTotalRouteDistance(route.distance);
                setTotalRouteDuration(route.duration);
            } else {
                setRoutingError(data.message || 'No route could be found.');
            }
        } catch (error) {
            setRoutingError("Failed to fetch route.");
        } finally {
            if (!isSilent) setIsRouting(false);
        }
    }, []);

    const handleDestinationSelect = (destination) => {
        if (selectedDestination && selectedDestination.id === destination.id) {
            setSelectedDestination(null);
        } else {
            setSelectedDestination(destination);
            setIsPanelExpanded(false);
        }
    };

    useEffect(() => {
        clearInterval(routeIntervalRef.current);
        if (selectedDestination && userLocation) {
            fetchRoute(userLocation, selectedDestination.coords, false);
            routeIntervalRef.current = setInterval(() => {
                fetchRoute(userLocation, selectedDestination.coords, true);
            }, 15000);
        } else {
            setDynamicRoute(null);
            setRouteInstructions([]);
            setRoutingError(null);
        }
        return () => clearInterval(routeIntervalRef.current);
    }, [selectedDestination, userLocation, fetchRoute]);

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
                    {!familyId ? "You must join or create a family to use the tracker." : "Please sign in to view your family."}
                </p>
            </div>
        );
    }

    return (
        <div className="h-full w-full relative font-inter overflow-hidden">
            {(geolocationError || routingError) && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-red-100 text-red-700 p-3 rounded-lg shadow-lg flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>{geolocationError || routingError}</span>
                </div>
            )}

            <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end space-y-2">
                <button onClick={recenterMap} className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-100 transition-colors" title="Recenter Map">
                    <Locate className="h-6 w-6 text-gray-700" />
                </button>

                {routeInstructions.length > 0 && (
                    <button onClick={() => setShowInstructionsPanel(!showInstructionsPanel)} className="hidden md:flex bg-white p-3 rounded-lg shadow-lg hover:bg-gray-100 transition-colors" title={showInstructionsPanel ? "Hide Directions" : "Show Directions"}>
                        <List className="h-6 w-6 text-gray-700" />
                    </button>
                )}

                {heading !== null && (
                    <div className="bg-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center transition-transform duration-200" style={{ transform: `rotate(${-heading}deg)` }} title={`Heading: ${Math.round(heading)}°`}>
                        <ArrowUp className="w-8 h-8 text-red-600" />
                    </div>
                )}
            </div>

            {routeInstructions.length > 0 && (
                <div className={`
                absolute bg-white shadow-xl
                transition-all duration-300 ease-in-out z-[1000]
                flex flex-col
                
                ${/* --- Mobile: Bottom Sheet Layout --- */''}
                left-0 right-0 bottom-0 rounded-t-2xl
                ${isPanelExpanded ? 'translate-y-0 max-h-[60vh]' : 'translate-y-[calc(100%-92px)]'}
                
                ${/* --- Desktop: Left Panel Layout (below zoom) --- */''}
                md:rounded-lg md:max-w-sm md:w-full
                md:left-4 md:right-auto md:bottom-4
                md:top-24
                md:translate-y-0 md:max-h-none
                ${showInstructionsPanel ? 'md:flex' : 'md:hidden'}
            `}>
                    <div onClick={() => setIsPanelExpanded(!isPanelExpanded)} className="p-4 flex-shrink-0 border-b cursor-pointer md:cursor-auto">
                        <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mb-3 md:hidden"></div>
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                                    <Route className="h-5 w-5 text-violet-600" />
                                    <span>Directions to {selectedDestination?.name}</span>
                                </h4>
                                <p className="text-sm text-gray-600">
                                    <strong className="text-violet-600">{(totalRouteDistance / 1000).toFixed(2)} km</strong>
                                    <span className="mx-1 text-gray-300">|</span>
                                    <strong>{Math.round(totalRouteDuration / 60)} min</strong>
                                </p>
                            </div>
                            <div className="md:hidden text-gray-500">
                                {isPanelExpanded ? <ChevronDown /> : <ChevronUp />}
                            </div>
                        </div>
                    </div>
                    <ul className="flex-1 p-2 overflow-y-auto">
                        {routeInstructions.map((step, index) => {
                            const distanceStr = step.distance > 1000 ? `${(step.distance / 1000).toFixed(1)} km` : `${Math.round(step.distance)} m`;
                            return (
                                <li key={index} className="flex items-center p-2 space-x-3 border-b last:border-b-0">
                                    {getManeuverIcon(step.type, step.modifier)}
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800" dangerouslySetInnerHTML={{ __html: step.instruction }}></p>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-500 whitespace-nowrap">{distanceStr}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} ref={mapRef} className="z-0">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />

                {userLocation && ( <Marker position={userLocation} icon={userLocationIcon}><Popup>You are here.</Popup></Marker> )}

                {familyMemberLocations.map((member) => (
                    <Marker key={member.id} position={member.coords} icon={familyMemberIcon(member.username, selectedDestination?.id === member.id)}>
                        <Popup>
                            <div className="p-1 text-center w-40">
                                <h3 className="font-bold text-base mb-1">{member.name}</h3>
                                <p className="text-xs text-gray-500 mb-2">Last seen: {member.lastSeen}</p>
                                {userLocation ? (
                                    <button onClick={() => handleDestinationSelect(member)} disabled={isRouting} className="w-full flex justify-center items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-violet-100 text-violet-700 hover:bg-violet-200 disabled:opacity-50">
                                        {isRouting && selectedDestination?.id === member.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Route className="h-4 w-4" />}
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
}; // <-- THIS IS THE FIX: Added the missing closing brace and semicolon.

export default FamilyTracker;