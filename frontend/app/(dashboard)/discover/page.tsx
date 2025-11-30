'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from 'framer-motion';
import { Heart, X, RefreshCw, MapPin, Sliders, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { discoveryApi } from '@/lib/api';
import { useToast } from '@/components/ui/toaster';
import { useNotifications } from '@/lib/notification-context';
import { cn, getInitials } from '@/lib/utils';

interface Profile {
  id: string;
  name: string;
  age: number;
  bio: string;
  profilePhoto: string | null;
  gender: string;
  location: string | null;
  userId: string;
}

interface Filters {
  minAge: number;
  maxAge: number;
  maxDistance: number;
}

const SWIPE_THRESHOLD = 100;

export default function DiscoverPage() {
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    minAge: 18,
    maxAge: 50,
    maxDistance: 100,
  });
  const [showFilters, setShowFilters] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await discoveryApi.getProfiles({
        minAge: filters.minAge,
        maxAge: filters.maxAge,
        maxDistance: filters.maxDistance,
        limit: 20,
      });
      
      if (response.success && response.data?.profiles) {
        setProfiles(response.data.profiles);
        setCurrentIndex(0);
      }
    } catch (error: any) {
      toast({
        title: 'Failed to load profiles',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (isActionLoading || currentIndex >= profiles.length) return;

    const profile = profiles[currentIndex];
    setIsActionLoading(true);

    try {
      const response = await discoveryApi.swipe(profile.userId, direction);
      
      if (response.success) {
        if (response.data?.isMatch) {
          // It's a match!
          toast({
            title: "It's a Match! 🎉",
            description: `You and ${profile.name} liked each other!`,
            variant: 'love',
          });
          
          addNotification({
            type: 'match',
            title: "It's a Match! 💕",
            body: `You matched with ${profile.name}!`,
            data: response.data.match,
          });
        } else if (direction === 'right') {
          toast({
            title: 'Liked! ❤️',
            description: response.message,
          });
        }

        setCurrentIndex((prev) => prev + 1);
      }
    } catch (error: any) {
      toast({
        title: 'Action failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Heart className="w-16 h-16 text-love-500 animate-pulse mb-4" />
          <p className="text-muted-foreground">Finding your matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Discover</h1>
          <p className="text-muted-foreground">
            {profiles.length - currentIndex} profiles to discover
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchProfiles}
            disabled={isLoading}
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </Button>
          
          <Dialog open={showFilters} onOpenChange={setShowFilters}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Sliders className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Discovery Preferences</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div>
                  <Label className="mb-4 block">
                    Age Range: {filters.minAge} - {filters.maxAge}
                  </Label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <span className="text-xs text-muted-foreground mb-1 block">Min Age</span>
                      <Slider
                        value={[filters.minAge]}
                        onValueChange={([value]) =>
                          setFilters((prev) => ({ ...prev, minAge: value }))
                        }
                        min={18}
                        max={100}
                        step={1}
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs text-muted-foreground mb-1 block">Max Age</span>
                      <Slider
                        value={[filters.maxAge]}
                        onValueChange={([value]) =>
                          setFilters((prev) => ({ ...prev, maxAge: value }))
                        }
                        min={18}
                        max={100}
                        step={1}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="mb-4 block">
                    Maximum Distance: {filters.maxDistance} km
                  </Label>
                  <Slider
                    value={[filters.maxDistance]}
                    onValueChange={([value]) =>
                      setFilters((prev) => ({ ...prev, maxDistance: value }))
                    }
                    min={1}
                    max={500}
                    step={5}
                  />
                </div>
                
                <Button
                  className="w-full"
                  onClick={() => {
                    setShowFilters(false);
                    fetchProfiles();
                  }}
                >
                  Apply Filters
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Card Stack */}
      <div className="relative max-w-lg mx-auto">
        {currentIndex >= profiles.length ? (
          <div className="bg-card rounded-3xl border shadow-xl p-8 text-center min-h-[500px] flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-love-100 to-coral-100 dark:from-love-950 dark:to-coral-950 flex items-center justify-center mb-6">
              <Sparkles className="w-12 h-12 text-love-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No more profiles</h2>
            <p className="text-muted-foreground mb-6">
              Check back later or adjust your filters to see more people!
            </p>
            <Button onClick={fetchProfiles}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Profiles
            </Button>
          </div>
        ) : (
          <div className="relative h-[600px]">
            {/* Background card (next profile) */}
            {nextProfile && (
              <div className="absolute inset-0 scale-95 opacity-50">
                <ProfileCard profile={nextProfile} apiUrl={API_URL} />
              </div>
            )}
            
            {/* Current card */}
            <AnimatePresence mode="wait">
              {currentProfile && (
                <SwipeableCard
                  key={currentProfile.id}
                  profile={currentProfile}
                  apiUrl={API_URL}
                  onSwipe={handleSwipe}
                  disabled={isActionLoading}
                />
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Action Buttons */}
        {currentIndex < profiles.length && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              variant="outline"
              size="lg"
              className="w-16 h-16 rounded-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-white"
              onClick={() => handleSwipe('left')}
              disabled={isActionLoading}
            >
              <X className="w-8 h-8" />
            </Button>
            
            <Button
              size="lg"
              className="w-20 h-20 rounded-full bg-gradient-to-r from-love-500 to-coral-500 hover:from-love-600 hover:to-coral-600 shadow-xl shadow-love-500/30"
              onClick={() => handleSwipe('right')}
              disabled={isActionLoading}
            >
              <Heart className="w-10 h-10 fill-white" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileCard({ profile, apiUrl }: { profile: Profile; apiUrl: string }) {
  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden bg-card border shadow-xl">
      {/* Profile Image */}
      <div className="absolute inset-0">
        {profile.profilePhoto ? (
          <img
            src={`${apiUrl}${profile.profilePhoto}`}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-love-100 to-coral-100 dark:from-love-900 dark:to-coral-900 flex items-center justify-center">
            <Avatar className="w-32 h-32">
              <AvatarFallback className="text-4xl">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>
      
      {/* Profile Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h2 className="text-3xl font-bold mb-1">
          {profile.name}, {profile.age}
        </h2>
        
        {profile.location && (
          <div className="flex items-center gap-2 text-white/80 mb-3">
            <MapPin className="w-4 h-4" />
            <span>{profile.location}</span>
          </div>
        )}
        
        {profile.bio && (
          <p className="text-white/90 line-clamp-3">{profile.bio}</p>
        )}
      </div>
    </div>
  );
}

function SwipeableCard({
  profile,
  apiUrl,
  onSwipe,
  disabled,
}: {
  profile: Profile;
  apiUrl: string;
  onSwipe: (direction: 'left' | 'right') => void;
  disabled: boolean;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-30, 30]);
  const opacity = useTransform(x, [-300, -100, 0, 100, 300], [0, 1, 1, 1, 0]);
  
  // Indicator opacities
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (disabled) return;
    
    if (info.offset.x > SWIPE_THRESHOLD) {
      onSwipe('right');
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onSwipe('left');
    }
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing swipe-card"
      style={{ x, rotate, opacity }}
      drag={!disabled ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ 
        x: x.get() > 0 ? 300 : -300,
        opacity: 0,
        transition: { duration: 0.2 }
      }}
    >
      <ProfileCard profile={profile} apiUrl={apiUrl} />
      
      {/* Like indicator */}
      <motion.div
        className="absolute top-8 left-8 px-4 py-2 rounded-lg border-4 border-green-500 text-green-500 font-bold text-2xl rotate-[-20deg]"
        style={{ opacity: likeOpacity }}
      >
        LIKE
      </motion.div>
      
      {/* Nope indicator */}
      <motion.div
        className="absolute top-8 right-8 px-4 py-2 rounded-lg border-4 border-red-500 text-red-500 font-bold text-2xl rotate-[20deg]"
        style={{ opacity: nopeOpacity }}
      >
        NOPE
      </motion.div>
    </motion.div>
  );
}

