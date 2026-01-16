import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { motion } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom paw marker icon
const createPawIcon = (color = "#FF8A65") => {
    return L.divIcon({
        className: "custom-paw-marker",
        html: `
            <div style="position: relative; width: 40px; height: 40px;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="${color}" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));">
                    <path d="M8.5 2C7.67157 2 7 2.67157 7 3.5V6.5C7 7.32843 7.67157 8 8.5 8C9.32843 8 10 7.32843 10 6.5V3.5C10 2.67157 9.32843 2 8.5 2Z"/>
                    <path d="M14 3.5C14 2.67157 14.6716 2 15.5 2C16.3284 2 17 2.67157 17 3.5V6.5C17 7.32843 16.3284 8 15.5 8C14.6716 8 14 7.32843 14 6.5V3.5Z"/>
                    <path d="M4.5 6C3.67157 6 3 6.67157 3 7.5V9.5C3 10.3284 3.67157 11 4.5 11C5.32843 11 6 10.3284 6 9.5V7.5C6 6.67157 5.32843 6 4.5 6Z"/>
                    <path d="M18 7.5C18 6.67157 18.6716 6 19.5 6C20.3284 6 21 6.67157 21 7.5V9.5C21 10.3284 20.3284 11 19.5 11C18.6716 11 18 10.3284 18 9.5V7.5Z"/>
                    <path d="M7 13C7 11.3431 8.34315 10 10 10H14C15.6569 10 17 11.3431 17 13V17C17 19.7614 14.7614 22 12 22C9.23858 22 7 19.7614 7 17V13Z"/>
                </svg>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
    });
};

function MapController({ center, zoom }) {
    const map = useMap();
    
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom, {
                duration: 1.5,
                easeLinearity: 0.25
            });
        }
    }, [center, zoom, map]);
    
    return null;
}

export default function AdoptionMap({ centers, userLocation, onCenterClick, selectedCenter }) {
    const mapRef = useRef(null);
    const defaultCenter = userLocation || [40.7128, -74.0060]; // Default to NYC
    const colors = ["#FF8A65", "#66BB6A", "#42A5F5", "#AB47BC"];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full rounded-3xl overflow-hidden shadow-2xl"
        >
            <MapContainer
                center={defaultCenter}
                zoom={12}
                className="w-full h-full"
                ref={mapRef}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapController 
                    center={selectedCenter ? [selectedCenter.lat, selectedCenter.lng] : (userLocation || defaultCenter)} 
                    zoom={selectedCenter ? 15 : 12} 
                />

                {/* User location marker */}
                {userLocation && (
                    <Marker
                        position={userLocation}
                        icon={L.divIcon({
                            className: "user-location-marker",
                            html: `
                                <div style="width: 20px; height: 20px; background: #4285F4; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
                            `,
                            iconSize: [20, 20],
                            iconAnchor: [10, 10],
                        })}
                    >
                        <Popup>Your Location</Popup>
                    </Marker>
                )}

                {/* Adoption center markers */}
                {centers.map((center, index) => (
                    <Marker
                        key={index}
                        position={[center.lat, center.lng]}
                        icon={createPawIcon(colors[index % colors.length])}
                        eventHandlers={{
                            click: () => onCenterClick(center),
                        }}
                    >
                        <Popup>
                            <div className="text-center p-2">
                                <h3 className="font-bold text-gray-800 mb-1">{center.name}</h3>
                                <p className="text-sm text-gray-600">{center.address}</p>
                                {center.distance && (
                                    <p className="text-xs text-orange-600 font-semibold mt-1">{center.distance}</p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </motion.div>
    );
}