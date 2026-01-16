import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const categoryColors = {
  meetup: "bg-blue-500",
  adoption: "bg-emerald-500",
  training: "bg-amber-500",
  health: "bg-rose-500",
  social: "bg-violet-500",
  volunteer: "bg-orange-500"
};

export default function EventCard({ event, onJoin }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white group">
        <div className="relative h-40 overflow-hidden">
          <img 
            src={event.image_url || `https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=200&fit=crop`}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <Badge className={`absolute top-3 left-3 ${categoryColors[event.category] || 'bg-slate-500'} text-white border-0`}>
            {event.category}
          </Badge>
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="font-bold text-white text-lg line-clamp-1">{event.title}</h3>
          </div>
        </div>
        
        <CardContent className="p-4 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="h-4 w-4 text-emerald-500" />
              <span>{event.date ? format(new Date(event.date), 'EEEE, MMM d') : 'Date TBD'}</span>
            </div>
            {event.time && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="h-4 w-4 text-emerald-500" />
                <span>{event.time}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4 text-emerald-500" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <Users className="h-4 w-4" />
              <span>{event.attendees_count || 0} going</span>
            </div>
            <Button 
              size="sm"
              onClick={() => onJoin?.(event)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full px-4"
            >
              Join
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}