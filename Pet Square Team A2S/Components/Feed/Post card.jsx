import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const categoryStyles = {
  general: "bg-slate-100 text-slate-700",
  health: "bg-rose-100 text-rose-700",
  training: "bg-amber-100 text-amber-700",
  adoption: "bg-emerald-100 text-emerald-700",
  lost_found: "bg-red-100 text-red-700",
  question: "bg-blue-100 text-blue-700",
  tip: "bg-violet-100 text-violet-700"
};

export default function PostCard({ post, onLike, onComment }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike?.(post.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 ring-2 ring-emerald-100">
                <AvatarImage src={post.author_avatar} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-400 text-white font-medium">
                  {post.author_name?.[0]?.toUpperCase() || 'P'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-slate-800">{post.author_name || 'Pet Parent'}</p>
                <p className="text-xs text-slate-400">
                  {post.created_date ? format(new Date(post.created_date), 'MMM d, h:mm a') : 'Just now'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${categoryStyles[post.category]} border-0 font-medium text-xs`}>
                {post.category?.replace('_', ' ')}
              </Badge>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 pb-3">
            <p className="text-slate-700 leading-relaxed">{post.content}</p>
          </div>

          {/* Image */}
          {post.image_url && (
            <div className="relative">
              <img 
                src={post.image_url} 
                alt="Post" 
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <div className="px-4 py-3 border-t border-slate-50 flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLike}
              className={`gap-2 ${isLiked ? 'text-rose-500' : 'text-slate-500'} hover:text-rose-500 hover:bg-rose-50`}
            >
              <motion.div
                animate={{ scale: isLiked ? [1, 1.3, 1] : 1 }}
                transition={{ duration: 0.2 }}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              </motion.div>
              <span className="text-sm font-medium">{likesCount}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onComment?.(post)}
              className="gap-2 text-slate-500 hover:text-blue-500 hover:bg-blue-50"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{post.comments_count || 0}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="gap-2 text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 ml-auto"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}