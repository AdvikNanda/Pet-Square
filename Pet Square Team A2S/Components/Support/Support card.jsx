import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, MessageCircle, AlertCircle, Search, HelpCircle, Home, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const typeConfig = {
  pet_sitting: { icon: Home, color: "bg-blue-100 text-blue-700", label: "Pet Sitting" },
  advice: { icon: HelpCircle, color: "bg-violet-100 text-violet-700", label: "Advice" },
  recommendation: { icon: HeartHandshake, color: "bg-emerald-100 text-emerald-700", label: "Recommendation" },
  emergency: { icon: AlertCircle, color: "bg-red-100 text-red-700", label: "Emergency" },
  lost_pet: { icon: Search, color: "bg-orange-100 text-orange-700", label: "Lost Pet" },
  found_pet: { icon: Search, color: "bg-green-100 text-green-700", label: "Found Pet" }
};

const statusColors = {
  open: "bg-emerald-500",
  in_progress: "bg-amber-500",
  resolved: "bg-slate-400"
};

export default function SupportCard({ request, onRespond }) {
  const config = typeConfig[request.type] || typeConfig.advice;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className={`h-12 w-12 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0`}>
              <Icon className="h-6 w-6" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-slate-800 line-clamp-1">{request.title}</h3>
                <Badge className={`${statusColors[request.status]} text-white border-0 text-xs`}>
                  {request.status?.replace('_', ' ')}
                </Badge>
              </div>
              
              <p className="text-sm text-slate-600 line-clamp-2 mb-2">{request.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-slate-400">
                {request.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {request.location}
                  </span>
                )}
                <span>{request.created_date ? format(new Date(request.created_date), 'MMM d') : 'Recently'}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              {request.responses_count || 0} responses
            </span>
            <Button 
              size="sm"
              variant="outline"
              onClick={() => onRespond?.(request)}
              className="rounded-full border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Respond
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}