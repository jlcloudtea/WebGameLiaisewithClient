'use client';

import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, AlertTriangle, User, Bot } from 'lucide-react';
import type { ClientMessage } from '@/lib/game-types';

interface ChatPanelProps {
  messages: ClientMessage[];
  currentRound: number;
}

export default function ChatPanel({ messages, currentRound }: ChatPanelProps) {
  const [reply, setReply] = useState('');
  const [replies, setReplies] = useState<{ round: number; text: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Build chat history from messages and replies (derived, no setState in effect)
  const chatHistory = useMemo(() => {
    const roundMessages = messages.filter((m) => m.round <= currentRound);
    const clientEntries = roundMessages.map((m) => ({
      id: `client-${m.id}`,
      sender: 'client' as const,
      text: m.content,
      isTrap: m.isVerbalTrap,
    }));

    const replyEntries = replies
      .filter((r) => r.round <= currentRound)
      .map((r, i) => ({
        id: `reply-${i}`,
        sender: 'team' as const,
        text: r.text,
        isTrap: false,
      }));

    return [...clientEntries, ...replyEntries].sort((a, b) => {
      // Keep order: client messages first by round, then replies by round
      return a.id.localeCompare(b.id);
    });
  }, [messages, currentRound, replies]);

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setReplies((prev) => [...prev, { round: currentRound, text: reply.trim() }]);
    setReply('');
    // Scroll to bottom after reply
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  return (
    <Card className="h-full flex flex-col border-amber-200 bg-white/90 backdrop-blur-sm shadow-lg">
      <div className="px-4 py-3 border-b border-amber-200 bg-amber-50/80 rounded-t-xl">
        <h2 className="font-semibold text-amber-900 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Client Communication
        </h2>
        <p className="text-xs text-amber-600 mt-0.5">Round {currentRound} — Read carefully for verbal traps!</p>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {chatHistory.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: msg.sender === 'client' ? -20 : 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`flex ${msg.sender === 'team' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end gap-2 max-w-[85%] ${msg.sender === 'team' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === 'client' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {msg.sender === 'client' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className="relative">
                    {msg.isTrap && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-1"
                      >
                        <Badge
                          variant="destructive"
                          className="text-xs animate-pulse"
                        >
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Verbal Trap!
                        </Badge>
                      </motion.div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.sender === 'client'
                          ? msg.isTrap
                            ? 'bg-red-50 border border-red-200 text-red-900'
                            : 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {msg.isTrap && (
                        <motion.div
                          className="absolute inset-0 rounded-2xl bg-red-400/20"
                          initial={{ opacity: 1 }}
                          animate={{ opacity: 0 }}
                          transition={{ duration: 1.5, repeat: 1 }}
                        />
                      )}
                      {msg.text}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <form onSubmit={handleReply} className="p-3 border-t border-amber-200 bg-amber-50/50 rounded-b-xl">
        <div className="flex gap-2">
          <Input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type a reply (roleplay)..."
            className="border-amber-200 focus:border-amber-500 focus:ring-amber-500 text-sm bg-white"
          />
          <Button
            type="submit"
            size="icon"
            className="bg-amber-500 hover:bg-amber-600 text-white shrink-0"
            disabled={!reply.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}
