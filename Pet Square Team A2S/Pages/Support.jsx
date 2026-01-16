import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, HelpCircle, Loader2, Search, AlertCircle, Home, HeartHandshake } from 'lucide-react';
import SupportCard from '@/components/support/SupportCard';
import EmptyState from '@/components/common/EmptyState';

const requestTypes = [
  { value: 'pet_sitting', label: '🏠 Pet Sitting', description: 'Need someone to watch your pet' },
  { value: 'advice', label: '💭 Advice', description: 'Looking for guidance or tips' },
  { value: 'recommendation', label: '⭐ Recommendation', description: 'Vet, groomer, or product suggestions' },
  { value: 'emergency', label: '🚨 Emergency', description: 'Urgent help needed' },
  { value: 'lost_pet', label: '🔍 Lost Pet', description: 'Help find a missing pet' },
  { value: 'found_pet', label: '✅ Found Pet', description: 'Report a found pet' },
];

export default function Support() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('open');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'advice',
    location: ''
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: allRequests = [], isLoading } = useQuery({
    queryKey: ['supportRequests'],
    queryFn: () => base44.entities.SupportRequest.list('-created_date', 100),
  });

  const createRequestMutation = useMutation({
    mutationFn: (request) => base44.entities.SupportRequest.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportRequests'] });
      setIsDialogOpen(false);
      setFormData({ title: '', description: '', type: 'advice', location: '' });
    },
  });

  const openRequests = allRequests.filter(r => r.status === 'open');
  const inProgressRequests = allRequests.filter(r => r.status === 'in_progress');
  const resolvedRequests = allRequests.filter(r => r.status === 'resolved');

  const handleSubmit = (e) => {
    e.preventDefault();
    createRequestMutation.mutate({
      ...formData,
      author_name: user?.full_name,
      status: 'open',
      responses_count: 0
    });
  };

  const getTabContent = (requests) => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
        </div>
      );
    }

    if (requests.length === 0) {
      return (
        <EmptyState
          icon={HelpCircle}
          title="No requests here"
          description="All caught up! No support requests in this category."
        />
      );
    }

    return (
      <div className="space-y-4">
        {requests.map((request, index) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <SupportCard request={request} />
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Community Support 💛</h1>
              <p className="text-white/80">Ask for help or lend a paw to fellow pet parents</p>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-white text-emerald-600 hover:bg-emerald-50 rounded-full px-6"
            >
              <Plus className="h-5 w-5 mr-2" />
              Ask for Help
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-emerald-600">{openRequests.length}</div>
            <div className="text-xs text-slate-500">Need Help</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-amber-600">{inProgressRequests.length}</div>
            <div className="text-xs text-slate-500">In Progress</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-slate-600">{resolvedRequests.length}</div>
            <div className="text-xs text-slate-500">Resolved</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white shadow-sm rounded-xl p-1 mb-6">
            <TabsTrigger value="open" className="rounded-lg">
              🆘 Open ({openRequests.length})
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="rounded-lg">
              ⏳ In Progress ({inProgressRequests.length})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="rounded-lg">
              ✅ Resolved ({resolvedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open">{getTabContent(openRequests)}</TabsContent>
          <TabsContent value="in_progress">{getTabContent(inProgressRequests)}</TabsContent>
          <TabsContent value="resolved">{getTabContent(resolvedRequests)}</TabsContent>
        </Tabs>
      </div>

      {/* Create Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Ask for Help 🆘</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>What do you need help with? *</Label>
              <Input
                placeholder="Brief title for your request"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Type of Help</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {requestTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                placeholder="Your general area"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Details</Label>
              <Textarea
                placeholder="Provide more details about what you need..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!formData.title || createRequestMutation.isPending}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                {createRequestMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Submit Request'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}