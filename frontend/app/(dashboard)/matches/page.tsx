'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, UserX, Sparkles, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { matchesApi } from '@/lib/api';
import { useToast } from '@/components/ui/toaster';
import { cn, getInitials, formatRelativeTime } from '@/lib/utils';

interface Match {
  id: string;
  matchedAt: string;
  partner: {
    id: string;
    profile: {
      id: string;
      name: string;
      age: number;
      bio: string;
      profilePhoto: string | null;
    };
  };
  messages?: any[];
}

export default function MatchesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [unmatchDialog, setUnmatchDialog] = useState<{ open: boolean; match: Match | null }>({
    open: false,
    match: null,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      const response = await matchesApi.getMatches();
      if (response.success && response.data?.matches) {
        setMatches(response.data.matches);
      }
    } catch (error: any) {
      toast({
        title: 'Failed to load matches',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnmatch = async (match: Match) => {
    try {
      await matchesApi.unmatch(match.id);
      setMatches((prev) => prev.filter((m) => m.id !== match.id));
      setUnmatchDialog({ open: false, match: null });
      toast({
        title: 'Unmatched',
        description: `You have unmatched with ${match.partner.profile.name}`,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to unmatch',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredMatches = matches.filter((match) =>
    match.partner.profile.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Heart className="w-16 h-16 text-love-500 animate-pulse mb-4" />
          <p className="text-muted-foreground">Loading your matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-love-500 fill-love-500" />
            My Matches
          </h1>
          <p className="text-muted-foreground">
            {matches.length} {matches.length === 1 ? 'match' : 'matches'}
          </p>
        </div>

        {/* Search */}
        {matches.length > 0 && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Matches Grid */}
        {filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredMatches.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="bg-card rounded-2xl border shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Profile Image */}
                    <div className="relative aspect-square">
                      {match.partner.profile.profilePhoto ? (
                        <img
                          src={`${API_URL}${match.partner.profile.profilePhoto}`}
                          alt={match.partner.profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-love-100 to-coral-100 dark:from-love-900 dark:to-coral-900 flex items-center justify-center">
                          <Avatar className="w-24 h-24">
                            <AvatarFallback className="text-3xl">
                              {getInitials(match.partner.profile.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                      
                      {/* Match badge */}
                      <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-gradient-to-r from-love-500 to-coral-500 text-white text-xs font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Match
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold">
                        {match.partner.profile.name}, {match.partner.profile.age}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Matched {formatRelativeTime(match.matchedAt)}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => router.push(`/messages/${match.id}`)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:border-destructive"
                          onClick={() => setUnmatchDialog({ open: true, match })}
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-love-100 to-coral-100 dark:from-love-950 dark:to-coral-950 flex items-center justify-center">
              <Heart className="w-12 h-12 text-love-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {searchQuery ? 'No matches found' : 'No matches yet'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Start swiping to find your perfect match!'}
            </p>
            {!searchQuery && (
              <Button onClick={() => router.push('/discover')}>
                <Sparkles className="w-4 h-4 mr-2" />
                Start Discovering
              </Button>
            )}
          </div>
        )}
      </motion.div>

      {/* Unmatch Dialog */}
      <Dialog
        open={unmatchDialog.open}
        onOpenChange={(open) => setUnmatchDialog({ open, match: open ? unmatchDialog.match : null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unmatch with {unmatchDialog.match?.partner.profile.name}?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. You will no longer be able to chat with this person.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUnmatchDialog({ open: false, match: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => unmatchDialog.match && handleUnmatch(unmatchDialog.match)}
            >
              Unmatch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

