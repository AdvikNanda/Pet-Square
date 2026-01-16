import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import ConversationList from '@/components/messaging/ConversationList';
import ChatWindow from '@/components/messaging/ChatWindow';
import NewChatDialog from '@/components/messaging/NewChatDialog';
import EmptyState from '@/components/common/EmptyState';

export default function Messages() {
  const [user, setUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations', user?.email],
    queryFn: async () => {
      const all = await base44.entities.Conversation.list('-last_message_time', 100);
      return all.filter(c => c.participants?.includes(user?.email));
    },
    enabled: !!user?.email,
    refetchInterval: 5000,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user?.email) return;
    const unsubscribe = base44.entities.Conversation.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });
    return unsubscribe;
  }, [user?.email, queryClient]);

  const handleStartChat = async (targetUser) => {
    // Check if conversation already exists
    const existing = conversations.find(c => 
      c.participants?.includes(targetUser.email) && c.participants?.includes(user.email)
    );

    if (existing) {
      setSelectedConversation(existing);
      setIsNewChatOpen(false);
      return;
    }

    // Create new conversation
    const newConv = await base44.entities.Conversation.create({
      participants: [user.email, targetUser.email],
      participant_names: [user.full_name, targetUser.full_name],
      last_message: '',
      last_message_time: new Date().toISOString(),
      unread_count: { [user.email]: 0, [targetUser.email]: 0 }
    });

    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    setSelectedConversation(newConv);
    setIsNewChatOpen(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">Messages 💬</h1>
              <p className="text-white/80">Chat with fellow pet parents</p>
            </div>
            <Button
              onClick={() => setIsNewChatOpen(true)}
              className="bg-white text-emerald-600 hover:bg-emerald-50 rounded-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 250px)', minHeight: '500px' }}>
          <div className="flex h-full">
            {/* Conversation List */}
            <div className={`w-full md:w-80 border-r border-slate-100 overflow-y-auto ${
              selectedConversation ? 'hidden md:block' : ''
            }`}>
              <div className="p-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">Conversations</h2>
              </div>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
                </div>
              ) : (
                <ConversationList
                  conversations={conversations}
                  currentUser={user}
                  selectedId={selectedConversation?.id}
                  onSelect={setSelectedConversation}
                />
              )}
            </div>

            {/* Chat Window */}
            <div className={`flex-1 ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
              {selectedConversation ? (
                <div className="w-full">
                  <ChatWindow
                    conversation={selectedConversation}
                    currentUser={user}
                    onBack={() => setSelectedConversation(null)}
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <EmptyState
                    icon={MessageCircle}
                    title="Select a conversation"
                    description="Choose a chat or start a new one"
                    actionLabel="New Chat"
                    onAction={() => setIsNewChatOpen(true)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <NewChatDialog
        open={isNewChatOpen}
        onOpenChange={setIsNewChatOpen}
        currentUser={user}
        onStartChat={handleStartChat}
      />
    </div>
  );
}