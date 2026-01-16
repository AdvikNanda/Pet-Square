import React from "react";
import { motion } from "framer-motion";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export default function SearchControls({ 
    radius, 
    onRadiusChange, 
    locationQuery, 
    onLocationQueryChange, 
    onSearch,
    isSearching 
}) {
    const radiusLabels = {
        5: "5 km",
        10: "10 km",
        25: "25 km",
        50: "50 km"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg p-6 mb-6"
        >
            <div className="space-y-6">
                {/* Manual Location Search */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Location
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Enter city or area..."
                                value={locationQuery}
                                onChange={(e) => onLocationQueryChange(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                                className="pl-10 rounded-full border-2 border-gray-200 focus:border-orange-400"
                            />
                        </div>
                        <Button
                            onClick={onSearch}
                            disabled={isSearching || !locationQuery.trim()}
                            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-full px-6"
                        >
                            <Search className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Radius Slider */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-medium text-gray-700">
                            Search Radius
                        </label>
                        <span className="text-sm font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                            {radiusLabels[radius]}
                        </span>
                    </div>
                    <Slider
                        value={[radius]}
                        onValueChange={(value) => onRadiusChange(value[0])}
                        min={5}
                        max={50}
                        step={5}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>5 km</span>
                        <span>50 km</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}