import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image, Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categories = [
  { value: 'general', label: '💬 General', color: 'bg-slate-100' },
  { value: 'health', label: '🏥 Health', color: 'bg-rose-100' },
  { value: 'training', label: '🎓 Training', color: 'bg-amber-100' },
  { value: 'adoption', label: '🏠 Adoption', color: 'bg-emerald-100' },
  { value: 'lost_found', label: '🔍 Lost & Found', color: 'bg-red-100' },
  { value: 'question', label: '❓ Question', color: 'bg-blue-100' },
  { value: 'tip', label: '💡 Tip', color: 'bg-violet-100' },
];

export default function CreatePostCard({ user, onSubmit }) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [imageUrl, setImageUrl] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    await onSubmit({
      content,
      category,
      image_url: imageUrl || null,
      author_name: user?.full_name || 'Pet Parent',
      author_avatar: user?.avatar_url,
      likes_count: 0,
      comments_count: 0
    });
    setContent('');
    setCategory('general');
    setImageUrl('');
    setIsExpanded(false);
    setIsSubmitting(false);
  };

  return (
    <Card className="border-0 shadow-sm bg-white overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-11 w-11 ring-2 ring-emerald-100">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-400 text-white font-medium">
              {user?.full_name?.[0]?.toUpperCase() || 'P'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Share something with the community..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              className="min-h-[44px] border-0 bg-slate-50 resize-none focus:ring-2 focus:ring-emerald-200 rounded-xl placeholder:text-slate-400"
              rows={isExpanded ? 3 : 1}
            />
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-3"
                >
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          category === cat.value 
                            ? 'bg-emerald-500 text-white shadow-sm' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-slate-500 hover:text-emerald-500">
                        <Image className="h-5 w-5 mr-1" />
                        Photo
                      </Button>
                    </div>
                    <Button 
                      onClick={handleSubmit}
                      disabled={!content.trim() || isSubmitting}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full px-5"
                    >
                      {isSubmitting ? (
                        <Sparkles className="h-4 w-4 animate-pulse" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Post
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}