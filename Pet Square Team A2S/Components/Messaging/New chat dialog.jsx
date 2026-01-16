import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function NewChatDialog({ open, onOpenChange, currentUser, onStartChat }) {
  const [search, setSearch] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    enabled: open,
  });

  const filteredUsers = users.filter(u => 
    u.email !== currentUser?.email && 
    (u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
     u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>
        
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-full bg-slate-50 border-0"
          />
        </div>

        <div className="mt-4 max-h-72 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-slate-400 py-8">
              {search ? 'No users found' : 'No other users yet'}
            </p>
          ) : (
            <div className="space-y-1">
              {filteredUsers.map((user) => (
                <motion.button
                  key={user.id}
                  whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                  onClick={() => onStartChat(user)}
                  className="w-full p-3 flex items-center gap-3 rounded-xl text-left transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-400 text-white">
                      {user.full_name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-slate-800">{user.full_name || 'User'}</p>
                    <p className="text-sm text-slate-400">{user.email}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}