import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatWindow({ conversation, currentUser, onBack }) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const otherIdx = conversation.participants?.findIndex(p => p !== currentUser?.email);
  const otherUser = {
    email: conversation.participants?.[otherIdx],
    name: conversation.participant_names?.[otherIdx] || 'User'
  };

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', conversation.id],
    queryFn: () => base44.entities.Message.filter({ conversation_id: conversation.id }, 'created_date', 100),
    refetchInterval: 3000,
  });

  // Real-time subscription
  useEffect(() => {
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id === conversation.id) {
        queryClient.invalidateQueries({ queryKey: ['messages', conversation.id] });
      }
    });
    return unsubscribe;
  }, [conversation.id, queryClient]);

  // Mark messages as read
  useEffect(() => {
    const markAsRead = async () => {
      const unreadMessages = messages.filter(
        m => m.sender_email !== currentUser?.email && !m.read_by?.includes(currentUser?.email)
      );
      for (const msg of unreadMessages) {
        await base44.entities.Message.update(msg.id, {
          read_by: [...(msg.read_by || []), currentUser?.email]
        });
      }
      if (unreadMessages.length > 0) {
        const newUnreadCount = { ...conversation.unread_count, [currentUser?.email]: 0 };
        await base44.entities.Conversation.update(conversation.id, { unread_count: newUnreadCount });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    };
    if (messages.length > 0 && currentUser) markAsRead();
  }, [messages, currentUser, conversation]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      await base44.entities.Message.create({
        conversation_id: conversation.id,
        sender_email: currentUser.email,
        sender_name: currentUser.full_name,
        content,
        read_by: [currentUser.email]
      });
      const newUnreadCount = { 
        ...conversation.unread_count, 
        [otherUser.email]: (conversation.unread_count?.[otherUser.email] || 0) + 1 
      };
      await base44.entities.Conversation.update(conversation.id, {
        last_message: content,
        last_message_time: new Date().toISOString(),
        unread_count: newUnreadCount
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversation.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setNewMessage('');
    },
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-white">
        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-400 text-white">
            {otherUser.name?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-slate-800">{otherUser.name}</p>
          <p className="text-xs text-slate-400">Pet Parent</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            <p>No messages yet</p>
            <p className="text-sm">Say hello! 👋</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => {
              const isOwn = msg.sender_email === currentUser?.email;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] ${isOwn ? 'order-2' : ''}`}>
                    <div className={`px-4 py-2.5 rounded-2xl ${
                      isOwn 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-br-md' 
                        : 'bg-white text-slate-800 rounded-bl-md shadow-sm'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                    <p className={`text-xs text-slate-400 mt-1 ${isOwn ? 'text-right' : ''}`}>
                      {msg.created_date && format(new Date(msg.created_date), 'h:mm a')}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-slate-50 border-0 focus:ring-2 focus:ring-emerald-200"
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}