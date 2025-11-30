'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Search, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { matchesApi, chatApi } from '@/lib/api';
import { useToast } from '@/components/ui/toaster';
import { cn, getInitials, formatRelativeTime, truncate } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Match {
  id: string;
  matchedAt: string;
  partner: {
    id: string;
    profile: {
      id: string;
      name: string;
      age: number;
      profilePhoto: string | null;
    };
  };
  lastMessage?: {
    content: string;
    sentAt: string;
    senderId: string;
  };
}

export default function MessagesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      const response = await matchesApi.getMatches();
      if (response.success && response.data?.matches) {
        // Get last message for each match
        const matchesWithMessages = await Promise.all(
          response.data.matches.map(async (match: Match) => {
            try {
              const messagesResponse = await chatApi.getMessages(match.id, 1, 0);
              const lastMessage = messagesResponse.data?.messages?.[0];
              return { ...match, lastMessage };
            } catch {
              return match;
            }
          })
        );
        
        // Sort by last message date
        matchesWithMessages.sort((a, b) => {
          const dateA = a.lastMessage?.sentAt || a.matchedAt;
          const dateB = b.lastMessage?.sentAt || b.matchedAt;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
        
        setMatches(matchesWithMessages);
      }
    } catch (error: any) {
      toast({
        title: 'Failed to load conversations',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMatches = matches.filter((match) =>
    match.partner.profile.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <MessageCircle className="w-16 h-16 text-love-500 animate-pulse mb-4" />
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-love-500" />
            Messages
          </h1>
          <p className="text-muted-foreground">
            {matches.length} {matches.length === 1 ? 'conversation' : 'conversations'}
          </p>
        </div>

        {/* Search */}
        {matches.length > 0 && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Conversation List */}
        {filteredMatches.length > 0 ? (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredMatches.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/messages/${match.id}`}>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-card border hover:bg-muted/50 transition-colors cursor-pointer">
                      {/* Avatar */}
                      <Avatar className="w-14 h-14 border-2 border-love-200 dark:border-love-800">
                        <AvatarImage
                          src={match.partner.profile.profilePhoto ? `${API_URL}${match.partner.profile.profilePhoto}` : undefined}
                          alt={match.partner.profile.name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-love-100 to-coral-100 dark:from-love-900 dark:to-coral-900">
                          {getInitials(match.partner.profile.name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold truncate">
                            {match.partner.profile.name}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {match.lastMessage
                              ? formatRelativeTime(match.lastMessage.sentAt)
                              : formatRelativeTime(match.matchedAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {match.lastMessage
                            ? truncate(match.lastMessage.content, 50)
                            : 'Start a conversation!'}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-love-100 to-coral-100 dark:from-love-950 dark:to-coral-950 flex items-center justify-center">
              <MessageCircle className="w-12 h-12 text-love-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Match with someone to start chatting!'}
            </p>
            {!searchQuery && (
              <Button onClick={() => router.push('/discover')}>
                <Heart className="w-4 h-4 mr-2" />
                Find Matches
              </Button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

