'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, MoreVertical, UserX, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { matchesApi, chatApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useNotifications } from '@/lib/notification-context';
import { useToast } from '@/components/ui/toaster';
import { cn, getInitials, formatTime } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  senderId: string;
  sentAt: string;
  isRead: boolean;
}

interface Match {
  id: string;
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
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { socket } = useNotifications();
  const { toast } = useToast();
  const matchId = params.matchId as string;

  const [match, setMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showUnmatch, setShowUnmatch] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    fetchMatch();
    fetchMessages();
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // WebSocket setup
  useEffect(() => {
    if (!socket || !matchId) return;

    // Join chat room
    socket.emit('joinChat', { matchId });

    // Listen for new messages
    const handleNewMessage = (data: { message: Message; matchId: string }) => {
      if (data.matchId === matchId) {
        setMessages((prev) => [...prev, data.message]);
        // Mark as read
        socket.emit('markAsRead', { matchId });
      }
    };

    // Listen for typing indicator
    const handleTyping = (data: { userId: string; matchId: string; isTyping: boolean }) => {
      if (data.matchId === matchId && data.userId !== user?.id) {
        setIsTyping(data.isTyping);
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('userTyping', handleTyping);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('userTyping', handleTyping);
      socket.emit('leaveChat', { matchId });
    };
  }, [socket, matchId, user?.id]);

  const fetchMatch = async () => {
    try {
      const response = await matchesApi.getMatch(matchId);
      if (response.success && response.data?.match) {
        setMatch(response.data.match);
      }
    } catch (error: any) {
      toast({
        title: 'Failed to load chat',
        description: error.message,
        variant: 'destructive',
      });
      router.push('/messages');
    }
  };

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await chatApi.getMessages(matchId, 100, 0);
      if (response.success && response.data?.messages) {
        setMessages(response.data.messages);
      }
    } catch (error: any) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    // Optimistic update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      senderId: user?.id || '',
      sentAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      if (socket) {
        // Send via WebSocket for real-time delivery
        socket.emit('sendMessage', { matchId, content: messageContent });
      } else {
        // Fallback to REST API
        const response = await chatApi.sendMessage(matchId, messageContent);
        if (response.success && response.data?.message) {
          // Replace optimistic message with real one
          setMessages((prev) =>
            prev.map((m) =>
              m.id === optimisticMessage.id ? response.data.message : m
            )
          );
        }
      }
    } catch (error: any) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleTypingStart = () => {
    if (socket) {
      socket.emit('typing', { matchId, isTyping: true });
    }
  };

  const handleTypingEnd = () => {
    if (socket) {
      socket.emit('typing', { matchId, isTyping: false });
    }
  };

  const handleUnmatch = async () => {
    try {
      await matchesApi.unmatch(matchId);
      toast({
        title: 'Unmatched',
        description: `You have unmatched with ${match?.partner.profile.name}`,
      });
      router.push('/messages');
    } catch (error: any) {
      toast({
        title: 'Failed to unmatch',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (isLoading && !match) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-love-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem-1.5rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-card">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/messages')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div
          className="flex items-center gap-3 flex-1 cursor-pointer"
          onClick={() => setShowProfile(true)}
        >
          <Avatar className="w-10 h-10 border-2 border-love-200 dark:border-love-800">
            <AvatarImage
              src={match?.partner.profile.profilePhoto ? `${API_URL}${match.partner.profile.profilePhoto}` : undefined}
              alt={match?.partner.profile.name}
            />
            <AvatarFallback className="bg-gradient-to-br from-love-100 to-coral-100 dark:from-love-900 dark:to-coral-900">
              {match?.partner.profile.name ? getInitials(match.partner.profile.name) : '?'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h2 className="font-semibold">{match?.partner.profile.name}</h2>
            {isTyping && (
              <p className="text-xs text-love-500 animate-pulse">typing...</p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowProfile(true)}>
              <Info className="w-4 h-4 mr-2" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setShowUnmatch(true)}
            >
              <UserX className="w-4 h-4 mr-2" />
              Unmatch
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4 max-w-2xl mx-auto">
          {/* Match notification */}
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-love-50 dark:bg-love-950 text-love-700 dark:text-love-300 text-sm">
              <span>💕</span>
              You matched with {match?.partner.profile.name}!
            </div>
          </div>

          <AnimatePresence>
            {messages.map((message, index) => {
              const isOwn = message.senderId === user?.id;
              const showAvatar =
                !isOwn &&
                (index === 0 || messages[index - 1].senderId !== message.senderId);

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex gap-2', isOwn && 'justify-end')}
                >
                  {!isOwn && showAvatar && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={match?.partner.profile.profilePhoto ? `${API_URL}${match.partner.profile.profilePhoto}` : undefined}
                      />
                      <AvatarFallback className="text-xs">
                        {match?.partner.profile.name ? getInitials(match.partner.profile.name) : '?'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {!isOwn && !showAvatar && <div className="w-8" />}

                  <div
                    className={cn(
                      'max-w-[70%] px-4 py-2 rounded-2xl',
                      isOwn
                        ? 'bg-gradient-to-r from-love-500 to-coral-500 text-white rounded-br-sm'
                        : 'bg-muted rounded-bl-sm'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <p
                      className={cn(
                        'text-[10px] mt-1',
                        isOwn ? 'text-white/70' : 'text-muted-foreground'
                      )}
                    >
                      {formatTime(message.sentAt)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t bg-card"
      >
        <div className="flex gap-2 max-w-2xl mx-auto">
          <Input
            ref={inputRef}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onFocus={handleTypingStart}
            onBlur={handleTypingEnd}
            className="flex-1"
            autoComplete="off"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="px-6"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>

      {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-love-200 dark:border-love-800">
              <AvatarImage
                src={match?.partner.profile.profilePhoto ? `${API_URL}${match.partner.profile.profilePhoto}` : undefined}
              />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-love-100 to-coral-100 dark:from-love-900 dark:to-coral-900">
                {match?.partner.profile.name ? getInitials(match.partner.profile.name) : '?'}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">
              {match?.partner.profile.name}, {match?.partner.profile.age}
            </h2>
            {match?.partner.profile.bio && (
              <p className="mt-4 text-muted-foreground">
                {match.partner.profile.bio}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Unmatch Dialog */}
      <Dialog open={showUnmatch} onOpenChange={setShowUnmatch}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unmatch with {match?.partner.profile.name}?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All messages will be deleted and you won't be able to chat with this person anymore.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnmatch(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleUnmatch}>
              Unmatch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

