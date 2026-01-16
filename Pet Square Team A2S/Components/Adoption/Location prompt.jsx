import React from "react";
import { motion } from "framer-motion";
import { MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LocationPrompt({ onEnableLocation, onSkip }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center py-12 px-6"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center"
            >
                <Heart className="w-10 h-10 text-white fill-white" />
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Find Love Nearby
            </h2>
            
            <p className="text-lg text-gray-600 mb-2">
                Your next best friend might be closer than you think.
            </p>
            
            <p className="text-sm text-gray-500 mb-8">
                We'll use your location to show you adoption centers in your area. 
                Your location is never stored or shared.
            </p>

            <div className="space-y-3">
                <Button
                    onClick={onEnableLocation}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                    <MapPin className="w-5 h-5 mr-2" />
                    Enable Location
                </Button>

                <Button
                    onClick={onSkip}
                    variant="ghost"
                    className="w-full text-gray-600 hover:text-gray-800"
                >
                    I'll enter my location manually
                </Button>
            </div>
        </motion.div>
    );
}