import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Globe, Navigation, Clock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CenterCard({ center, onGetDirections, index }) {
    const cardColors = [
        "from-orange-50 to-pink-50",
        "from-green-50 to-teal-50",
        "from-blue-50 to-cyan-50",
        "from-purple-50 to-pink-50"
    ];

    const accentColors = [
        "text-orange-600",
        "text-green-600",
        "text-blue-600",
        "text-purple-600"
    ];

    const buttonColors = [
        "from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600",
        "from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600",
        "from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
        "from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
    ];

    const colorIndex = index % 4;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
        >
            <Card className={`overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${cardColors[colorIndex]}`}>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <CardTitle className="text-xl font-bold text-gray-800 flex items-start gap-2">
                            <Heart className={`w-5 h-5 mt-1 ${accentColors[colorIndex]} fill-current`} />
                            <span>{center.name}</span>
                        </CardTitle>
                        {center.distance && (
                            <span className="text-sm font-semibold bg-white px-3 py-1 rounded-full text-gray-700 shadow-sm">
                                {center.distance}
                            </span>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-3">
                    {/* Address */}
                    <div className="flex items-start gap-3 text-gray-700">
                        <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-gray-500" />
                        <p className="text-sm leading-relaxed">{center.address}</p>
                    </div>

                    {/* Phone */}
                    {center.phone && (
                        <div className="flex items-center gap-3 text-gray-700">
                            <Phone className="w-4 h-4 flex-shrink-0 text-gray-500" />
                            <a 
                                href={`tel:${center.phone}`}
                                className="text-sm hover:underline"
                            >
                                {center.phone}
                            </a>
                        </div>
                    )}

                    {/* Website */}
                    {center.website && (
                        <div className="flex items-center gap-3 text-gray-700">
                            <Globe className="w-4 h-4 flex-shrink-0 text-gray-500" />
                            <a 
                                href={center.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm hover:underline truncate"
                            >
                                Visit Website
                            </a>
                        </div>
                    )}

                    {/* Hours */}
                    {center.hours && (
                        <div className="flex items-center gap-3 text-gray-700">
                            <Clock className="w-4 h-4 flex-shrink-0 text-gray-500" />
                            <p className="text-sm">{center.hours}</p>
                        </div>
                    )}

                    {/* Get Directions Button */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="pt-2"
                    >
                        <Button
                            onClick={() => onGetDirections(center)}
                            className={`w-full bg-gradient-to-r ${buttonColors[colorIndex]} text-white rounded-full py-5 shadow-md hover:shadow-lg transition-all`}
                        >
                            <Navigation className="w-4 h-4 mr-2" />
                            Get Directions
                        </Button>
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
}