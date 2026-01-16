import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Newspaper, Calendar, Heart, HelpCircle, Loader2 } from 'lucide-react';
import PostCard from '@/components/feed/PostCard';
import CreatePostCard from '@/components/feed/CreatePostCard';
import EventCard from '@/components/events/EventCard';
import SupportCard from '@/components/support/SupportCard';
import EmptyState from '@/components/common/EmptyState';
import CategoryFilter from '@/components/common/CategoryFilter';

const postCategories = [
  { value: 'all', label: 'All', icon: '✨' },
  { value: 'general', label: 'General', icon: '💬' },
  { value: 'health', label: 'Health', icon: '🏥' },
  { value: 'training', label: 'Training', icon: '🎓' },
  { value: 'question', label: 'Questions', icon: '❓' },
  { value: 'tip', label: 'Tips', icon: '💡' },
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [postFilter, setPostFilter] = useState('all');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 50),
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-date', 10),
  });

  const { data: supportRequests = [], isLoading: supportLoading } = useQuery({
    queryKey: ['supportRequests'],
    queryFn: () => base44.entities.SupportRequest.filter({ status: 'open' }, '-created_date', 10),
  });

  const createPostMutation = useMutation({
    mutationFn: (post) => base44.entities.Post.create(post),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  });

  const filteredPosts = postFilter === 'all' 
    ? posts 
    : posts.filter(p => p.category === postFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200')] bg-cover bg-center opacity-20" />
        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="inline-block text-5xl mb-4">🐾</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">PetSquare</h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              The digital town square for pet parents. Connect, share, and support each other.
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-emerald-50 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl">
              <TabsTrigger value="feed" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Newspaper className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Feed</span>
              </TabsTrigger>
              <TabsTrigger value="events" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Events</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <HelpCircle className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Support</span>
              </TabsTrigger>
              <TabsTrigger value="adoption" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Heart className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Adopt</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === 'feed' && (
                <motion.div
                  key="feed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <CreatePostCard user={user} onSubmit={createPostMutation.mutateAsync} />
                  <CategoryFilter 
                    categories={postCategories} 
                    selected={postFilter} 
                    onChange={setPostFilter} 
                  />
                  
                  {postsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <EmptyState 
                      icon={Newspaper}
                      title="No posts yet"
                      description="Be the first to share something with the community!"
                    />
                  ) : (
                    <div className="space-y-4">
                      {filteredPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'events' && (
                <motion.div
                  key="events"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {eventsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                    </div>
                  ) : events.length === 0 ? (
                    <EmptyState 
                      icon={Calendar}
                      title="No upcoming events"
                      description="Check back soon for pet meetups and activities!"
                    />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'support' && (
                <motion.div
                  key="support"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-emerald-500">
                    <h3 className="font-semibold text-slate-800">Community Support</h3>
                    <p className="text-sm text-slate-500">Help fellow pet parents with advice, recommendations, or assistance.</p>
                  </div>
                  
                  {supportLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                    </div>
                  ) : supportRequests.length === 0 ? (
                    <EmptyState 
                      icon={HelpCircle}
                      title="No support requests"
                      description="Everyone's doing great! Check back if someone needs help."
                    />
                  ) : (
                    <div className="space-y-3">
                      {supportRequests.map((request) => (
                        <SupportCard key={request.id} request={request} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'adoption' && (
                <motion.div
                  key="adoption"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white mb-6">
                    <h2 className="text-2xl font-bold mb-2">🏠 Find Your Forever Friend</h2>
                    <p className="text-white/90">Browse pets looking for loving homes or post adoption listings.</p>
                  </div>
                  <EmptyState 
                    icon={Heart}
                    title="No adoption listings yet"
                    description="Check back soon for pets looking for forever homes."
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4">Community Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                  <div className="text-2xl font-bold text-emerald-600">{posts.length}</div>
                  <div className="text-xs text-slate-500">Posts</div>
                </div>
                <div className="text-center p-3 bg-teal-50 rounded-xl">
                  <div className="text-2xl font-bold text-teal-600">{events.length}</div>
                  <div className="text-xs text-slate-500">Events</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">{supportRequests.length}</div>
                  <div className="text-xs text-slate-500">Help Requests</div>
                </div>
                <div className="text-center p-3 bg-lime-50 rounded-xl">
                  <div className="text-2xl font-bold text-lime-600">∞</div>
                  <div className="text-xs text-slate-500">Happy Pets</div>
                </div>
              </div>
            </div>

            {/* Upcoming Events Preview */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4">Upcoming Events</h3>
              {events.slice(0, 3).map((event) => (
                <div key={event.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-800 truncate">{event.title}</p>
                    <p className="text-xs text-slate-400">{event.location}</p>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No events scheduled</p>
              )}
            </div>

            {/* Community Guidelines */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
              <h3 className="font-semibold mb-3">Community Guidelines 💛</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Be kind and supportive</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Share helpful tips & experiences</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Respect all pets and their parents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Report any concerns</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}