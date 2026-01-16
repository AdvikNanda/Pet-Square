import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function ConversationList({ conversations, currentUser, selectedId, onSelect }) {
  const getOtherParticipant = (conv) => {
    const idx = conv.participants?.findIndex(p => p !== currentUser?.email);
    return {
      email: conv.participants?.[idx],
      name: conv.participant_names?.[idx] || 'User'
    };
  };

  const getUnreadCount = (conv) => {
    return conv.unread_count?.[currentUser?.email] || 0;
  };

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400">
        <p>No conversations yet</p>
        <p className="text-sm mt-1">Start chatting with other pet parents!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {conversations.map((conv) => {
        const other = getOtherParticipant(conv);
        const unread = getUnreadCount(conv);
        const isSelected = selectedId === conv.id;

        return (
          <motion.button
            key={conv.id}
            whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
            onClick={() => onSelect(conv)}
            className={`w-full p-4 flex items-center gap-3 text-left transition-colors ${
              isSelected ? 'bg-emerald-50' : ''
            }`}
          >
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-400 text-white font-medium">
                {other.name?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`font-medium truncate ${unread > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                  {other.name}
                </p>
                {conv.last_message_time && (
                  <span className="text-xs text-slate-400">
                    {format(new Date(conv.last_message_time), 'MMM d')}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className={`text-sm truncate ${unread > 0 ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                  {conv.last_message || 'No messages yet'}
                </p>
                {unread > 0 && (
                  <Badge className="bg-emerald-500 text-white text-xs ml-2">
                    {unread}
                  </Badge>
                )}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}