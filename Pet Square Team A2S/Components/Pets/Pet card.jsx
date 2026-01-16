import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { MapPin, Heart, Sparkles, MessageCircle } from "lucide-react";
import KnowYourPetQuiz from './KnowYourPetQuiz';
import PetInsights from './PetInsights';

const speciesEmoji = {
  dog: '🐕',
  cat: '🐱',
  bird: '🐦',
  rabbit: '🐰',
  fish: '🐠',
  hamster: '🐹',
  reptile: '🦎',
  other: '🐾'
};

export default function PetCard({ pet, onClick, onQuizComplete }) {
  const [showQuiz, setShowQuiz] = useState(false);

  const handleQuizComplete = (results) => {
    setShowQuiz(false);
    if (onQuizComplete) {
      onQuizComplete();
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className="cursor-pointer"
      >
        <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white group">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={pet.photo_url || `https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=200&fit=crop`}
            alt={pet.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute top-3 right-3">
            <motion.div 
              whileHover={{ scale: 1.2 }}
              className="h-8 w-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm"
            >
              <Heart className="h-4 w-4 text-rose-500" />
            </motion.div>
          </div>
          <div className="absolute bottom-3 left-3">
            <span className="text-3xl">{speciesEmoji[pet.species] || '🐾'}</span>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-lg text-slate-800">{pet.name}</h3>
              <p className="text-sm text-slate-500">{pet.breed || pet.species}</p>
            </div>
            {pet.age && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-0">
                {pet.age}
              </Badge>
            )}
          </div>
          
          {pet.bio && (
            <p className="text-sm text-slate-600 line-clamp-2 mb-2">{pet.bio}</p>
          )}
          
          {pet.location && (
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
              <MapPin className="h-3 w-3" />
              {pet.location}
            </div>
          )}

          <div className="flex gap-2 mt-3">
            {!pet.quiz_completed ? (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQuiz(true);
                }}
                size="sm"
                variant="outline"
                className="flex-1 rounded-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Know Your Pet
              </Button>
            ) : null}
            <Button
              asChild
              size="sm"
              className="flex-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            >
              <Link to={createPageUrl('PetAssistant')}>
                <MessageCircle className="w-3 h-3 mr-1" />
                Ask Assistant
              </Link>
            </Button>
          </div>

          <PetInsights pet={pet} onRetakeQuiz={() => setShowQuiz(true)} />
        </CardContent>
      </Card>
    </motion.div>

    <Dialog open={showQuiz} onOpenChange={setShowQuiz}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <KnowYourPetQuiz
          pet={pet}
          onComplete={handleQuizComplete}
          onClose={() => setShowQuiz(false)}
        />
      </DialogContent>
    </Dialog>
    </>
  );
}