import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Heart, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import LocationPrompt from "../components/adoption/LocationPrompt";
import SearchControls from "../components/adoption/SearchControls";
import CenterCard from "../components/adoption/CenterCard";
import AdoptionMap from "../components/adoption/AdoptionMap";

export default function AdoptionCenters() {
    const [showLocationPrompt, setShowLocationPrompt] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [locationQuery, setLocationQuery] = useState("");
    const [radius, setRadius] = useState(10);
    const [centers, setCenters] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [currentLocationName, setCurrentLocationName] = useState("");

    const enableLocation = () => {
        setIsLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = [position.coords.latitude, position.coords.longitude];
                    setUserLocation(coords);
                    setShowLocationPrompt(false);
                    fetchAdoptionCenters(coords[0], coords[1], radius);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setShowLocationPrompt(false);
                    setIsLoading(false);
                }
            );
        }
    };

    const skipLocationPrompt = () => {
        setShowLocationPrompt(false);
    };

    const searchByLocation = async () => {
        if (!locationQuery.trim()) return;
        
        setIsLoading(true);
        try {
            // Use LLM to get coordinates for the location
            const locationData = await base44.integrations.Core.InvokeLLM({
                prompt: `What are the latitude and longitude coordinates for "${locationQuery}"? Return ONLY a JSON object with lat and lng as numbers.`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        lat: { type: "number" },
                        lng: { type: "number" }
                    }
                }
            });

            if (locationData.lat && locationData.lng) {
                const coords = [locationData.lat, locationData.lng];
                setUserLocation(coords);
                setCurrentLocationName(locationQuery);
                await fetchAdoptionCenters(locationData.lat, locationData.lng, radius);
            }
        } catch (error) {
            console.error("Error searching location:", error);
            setIsLoading(false);
        }
    };

    const fetchAdoptionCenters = async (lat, lng, radiusKm) => {
        setIsLoading(true);
        try {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Find real, verified animal adoption centers and shelters within ${radiusKm} km of coordinates ${lat}, ${lng}. 
                
                Return a JSON array of adoption centers with:
                - name: official name of the shelter/center
                - address: full street address
                - phone: contact phone number (if available)
                - website: website URL (if available)
                - hours: operating hours (if available)
                - lat: latitude coordinate (as number)
                - lng: longitude coordinate (as number)
                - distance: distance from search location in km (like "2.5 km")
                
                Return 5-10 REAL adoption centers only. Ensure coordinates are accurate.`,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        centers: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    address: { type: "string" },
                                    phone: { type: "string" },
                                    website: { type: "string" },
                                    hours: { type: "string" },
                                    lat: { type: "number" },
                                    lng: { type: "number" },
                                    distance: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            if (response.centers && Array.isArray(response.centers)) {
                setCenters(response.centers);
            }
        } catch (error) {
            console.error("Error fetching adoption centers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userLocation && !isLoading) {
            fetchAdoptionCenters(userLocation[0], userLocation[1], radius);
        }
    }, [radius]);

    const getDirections = (center) => {
        const destination = encodeURIComponent(`${center.lat},${center.lng}`);
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
            // Try to open in native maps app
            window.open(`https://maps.google.com/maps?daddr=${destination}`, '_blank');
        } else {
            // Open in Google Maps web
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center gap-3"
                    >
                        <div className="relative">
                            <Heart className="w-8 h-8 text-orange-500 fill-orange-500" />
                            <Sparkles className="w-4 h-4 text-pink-500 absolute -top-1 -right-1" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                            Find Nearby Adoption Centers
                        </h1>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center text-gray-600 mt-2"
                    >
                        Every visit brings a life closer to home 🏡
                    </motion.p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <AnimatePresence mode="wait">
                    {showLocationPrompt ? (
                        <LocationPrompt
                            onEnableLocation={enableLocation}
                            onSkip={skipLocationPrompt}
                        />
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            {/* Search Controls */}
                            <SearchControls
                                radius={radius}
                                onRadiusChange={setRadius}
                                locationQuery={locationQuery}
                                onLocationQueryChange={setLocationQuery}
                                onSearch={searchByLocation}
                                isSearching={isLoading}
                            />

                            {isLoading ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-20"
                                >
                                    <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                                    <p className="text-lg text-gray-600">Finding loving homes near you...</p>
                                    <p className="text-sm text-gray-500 mt-2">This might take a moment ✨</p>
                                </motion.div>
                            ) : centers.length > 0 ? (
                                <div className="grid lg:grid-cols-2 gap-6">
                                    {/* Map Section */}
                                    <div className="lg:sticky lg:top-32 h-[500px] lg:h-[600px]">
                                        <AdoptionMap
                                            centers={centers}
                                            userLocation={userLocation}
                                            onCenterClick={setSelectedCenter}
                                            selectedCenter={selectedCenter}
                                        />
                                    </div>

                                    {/* Results Section */}
                                    <div className="space-y-4">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-4 text-white text-center shadow-lg"
                                        >
                                            <p className="font-semibold">
                                                Found {centers.length} adoption {centers.length === 1 ? 'center' : 'centers'} 
                                                {currentLocationName && ` near ${currentLocationName}`}
                                            </p>
                                            <p className="text-sm opacity-90 mt-1">
                                                Your next best friend might be closer than you think 🐾
                                            </p>
                                        </motion.div>

                                        {centers.map((center, index) => (
                                            <CenterCard
                                                key={index}
                                                center={center}
                                                index={index}
                                                onGetDirections={getDirections}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : userLocation || currentLocationName ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-20"
                                >
                                    <Heart className="w-16 h-16 text-orange-300 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold text-gray-700 mb-2">
                                        Ready to find furry friends?
                                    </h3>
                                    <p className="text-gray-600">
                                        Adjust your search radius or try a different location
                                    </p>
                                </motion.div>
                            ) : null}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}