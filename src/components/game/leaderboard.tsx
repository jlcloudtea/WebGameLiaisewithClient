'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Crown, Users } from 'lucide-react';
import type { LeaderboardEntry } from '@/lib/game-types';

interface LeaderboardProps {
  currentTeamId?: string;
}

export default function Leaderboard({ currentTeamId }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-amber-600">{rank}</span>;
  };

  const getRankBg = (rank: number, isCurrentTeam: boolean) => {
    if (isCurrentTeam) return 'bg-amber-100 border-amber-300';
    if (rank === 1) return 'bg-yellow-50 border-yellow-200';
    if (rank === 2) return 'bg-gray-50 border-gray-200';
    if (rank === 3) return 'bg-amber-50 border-amber-200';
    return 'bg-white border-gray-200';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50">
          <Trophy className="w-4 h-4 mr-1.5" />
          Leaderboard
        </Button>
      </DialogTrigger>
      <DialogContent className="border-amber-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-amber-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Leaderboard
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-10 h-10 text-amber-300 mx-auto mb-2" />
            <p className="text-amber-600 text-sm">No teams have completed the game yet.</p>
            <p className="text-amber-500 text-xs mt-1">Be the first!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {entries.map((entry, i) => {
              const rank = i + 1;
              const isCurrentTeam = entry.teamId === currentTeamId;
              return (
                <motion.div
                  key={entry.teamId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${getRankBg(rank, isCurrentTeam)}`}
                >
                  <div className="shrink-0">{getRankIcon(rank)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${isCurrentTeam ? 'text-amber-900' : 'text-gray-800'}`}>
                      {entry.teamName}
                      {isCurrentTeam && (
                        <Badge variant="secondary" className="ml-2 text-xs bg-amber-200 text-amber-800">
                          You
                        </Badge>
                      )}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span className={`font-bold ${rank === 1 ? 'text-yellow-600' : 'text-amber-700'}`}>
                      {entry.score}
                    </span>
                    <span className="text-xs text-amber-500 ml-1">pts</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
