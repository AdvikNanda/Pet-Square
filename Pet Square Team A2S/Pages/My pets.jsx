import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, PawPrint, Loader2 } from 'lucide-react';
import PetCard from '@/components/pets/PetCard';
import EmptyState from '@/components/common/EmptyState';

const speciesOptions = [
  { value: 'dog', label: '🐕 Dog' },
  { value: 'cat', label: '🐱 Cat' },
  { value: 'bird', label: '🐦 Bird' },
  { value: 'rabbit', label: '🐰 Rabbit' },
  { value: 'fish', label: '🐠 Fish' },
  { value: 'hamster', label: '🐹 Hamster' },
  { value: 'reptile', label: '🦎 Reptile' },
  { value: 'other', label: '🐾 Other' },
];

export default function MyPets() {
  const [user, setUser] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    age: '',
    bio: '',
    photo_url: '',
    location: ''
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: pets = [], isLoading } = useQuery({
    queryKey: ['myPets', user?.email],
    queryFn: () => base44.entities.Pet.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const createPetMutation = useMutation({
    mutationFn: (pet) => base44.entities.Pet.create(pet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPets'] });
      setIsDialogOpen(false);
      setFormData({ name: '', species: 'dog', breed: '', age: '', bio: '', photo_url: '', location: '' });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createPetMutation.mutate({
      ...formData,
      location: formData.location || user?.location
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">My Pets 🐾</h1>
              <p className="text-white/80">Manage your furry family members</p>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-white text-violet-600 hover:bg-violet-50 rounded-full px-6"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Pet
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
          </div>
        ) : pets.length === 0 ? (
          <EmptyState
            icon={PawPrint}
            title="No pets added yet"
            description="Add your first pet to get started!"
            actionLabel="Add Your Pet"
            onAction={() => setIsDialogOpen(true)}
          />
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {pets.map((pet) => (
                <PetCard 
                  key={pet.id} 
                  pet={pet}
                  onQuizComplete={() => queryClient.invalidateQueries({ queryKey: ['myPets'] })}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Add Pet Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Add New Pet 🐾</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Pet Name *</Label>
              <Input
                placeholder="What's your pet's name?"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Species *</Label>
                <Select
                  value={formData.species}
                  onValueChange={(value) => setFormData({ ...formData, species: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {speciesOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Age</Label>
                <Input
                  placeholder="e.g., 2 years"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Breed</Label>
              <Input
                placeholder="e.g., Golden Retriever"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Photo URL</Label>
              <Input
                placeholder="https://..."
                value={formData.photo_url}
                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                placeholder="City, Country"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                placeholder="Tell us about your pet..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
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
                disabled={!formData.name || createPetMutation.isPending}
                className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
              >
                {createPetMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Add Pet'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}