'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Trophy,
  Star,
  RotateCcw,
  CheckCircle2,
  XCircle,
  MinusCircle,
  FileText,
  TrendingUp,
} from 'lucide-react';
import type { PlayerDocument } from '@/lib/game-types';
import { TOTAL_ROUNDS } from '@/lib/game-types';

interface GameOverScreenProps {
  score: number;
  documents: PlayerDocument[];
  teamName: string;
  leaderboardPosition: number;
  onPlayAgain: () => void;
}

export default function GameOverScreen({
  score,
  documents,
  teamName,
  leaderboardPosition,
  onPlayAgain,
}: GameOverScreenProps) {
  const [displayedScore, setDisplayedScore] = useState(0);

  // Animated score counter
  useEffect(() => {
    const duration = 2000;
    const startTime = Date.now();
    const startScore = 0;
    const endScore = score;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedScore(Math.round(startScore + (endScore - startScore) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  // Max possible: R1=10, R2=5, R3=20, R4=15, R5=15 = 65 total
  const maxPossibleScore = 65;

  const getRoundIcon = (doc: PlayerDocument) => {
    if (doc.scoreEarned > 0) return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (doc.scoreEarned === 0) return <MinusCircle className="w-5 h-5 text-amber-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getScoreBadge = (earned: number) => {
    if (earned > 0) return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Good</Badge>;
    if (earned === 0) return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Partial</Badge>;
    return <Badge className="bg-red-100 text-red-700 border-red-200">Penalty</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Big Score Display */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white mb-4 shadow-xl"
          >
            <Trophy className="w-12 h-12" />
          </motion.div>

          <h1 className="text-4xl font-bold text-amber-900 mb-2">Game Over!</h1>
          <p className="text-amber-600 mb-4">{teamName}</p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-block"
          >
            <div className="text-6xl font-bold text-amber-600 mb-1">
              {displayedScore}
            </div>
            <p className="text-sm text-amber-500">out of {maxPossibleScore} possible points</p>
          </motion.div>

          {leaderboardPosition > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-4 flex items-center justify-center gap-2"
            >
              <Star className="w-5 h-5 text-amber-500" />
              <span className="text-amber-700 font-medium">
                #{leaderboardPosition} on the leaderboard
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Round Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="border-amber-200 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <h2 className="font-semibold text-amber-900 flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4" />
                Round Summary
              </h2>

              <div className="space-y-3">
                {documents.map((doc, i) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + i * 0.1 }}
                  >
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                      <div className="shrink-0 mt-0.5">{getRoundIcon(doc)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-amber-900">
                            Round {doc.roundSubmitted}
                          </span>
                          <Badge variant="outline" className="border-amber-200 text-amber-600 text-xs">
                            {doc.documentType}
                          </Badge>
                          {getScoreBadge(doc.scoreEarned)}
                        </div>
                        {doc.feedback && (
                          <p className="text-xs text-amber-600 mt-1 leading-relaxed">{doc.feedback}</p>
                        )}
                      </div>
                      <div className="shrink-0">
                        <span className={`font-bold text-sm ${
                          doc.scoreEarned > 70 ? 'text-emerald-600' :
                          doc.scoreEarned > 0 ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          {doc.scoreEarned > 0 ? '+' : ''}{doc.scoreEarned}
                        </span>
                      </div>
                    </div>
                    {i < documents.length - 1 && <Separator className="my-2 bg-amber-100" />}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Play Again */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8 text-center"
        >
          <Button
            onClick={onPlayAgain}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold h-12 px-8 text-base"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
