'use client';

import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, ArrowRight, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import type { PlayerDocument } from '@/lib/game-types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: PlayerDocument | null;
  currentRound: number;
  totalRounds: number;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  document,
  currentRound,
  totalRounds,
}: FeedbackModalProps) {
  if (!document) return null;

  const isPositive = document.scoreEarned > 0;
  const isNeutral = document.scoreEarned === 0;
  // document.roundSubmitted is the round just completed.
  // currentRound is already advanced to the NEXT round by the backend.
  const isLastRound = document.roundSubmitted >= totalRounds;

  const getIcon = () => {
    if (isPositive) return <ThumbsUp className="w-8 h-8 text-emerald-500" />;
    if (isNeutral) return <Minus className="w-8 h-8 text-amber-500" />;
    return <ThumbsDown className="w-8 h-8 text-red-500" />;
  };

  const getScoreColor = () => {
    if (isPositive) return 'text-emerald-600';
    if (isNeutral) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreText = () => {
    if (document.scoreEarned > 0) return `+${document.scoreEarned}`;
    if (document.scoreEarned === 0) return '0';
    return `${document.scoreEarned}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-amber-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-amber-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Round {document.roundSubmitted} Complete
          </DialogTitle>
          <DialogDescription className="text-amber-600">
            {isLastRound
              ? 'Final round complete!'
              : `Moving to Round ${currentRound}`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="flex flex-col items-center mb-6"
          >
            {getIcon()}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-4xl font-bold mt-3 ${getScoreColor()}`}
            >
              {getScoreText()} points
            </motion.div>
            <Badge variant="outline" className="border-amber-300 text-amber-700 mt-2">
              {document.documentType}
            </Badge>
          </motion.div>

          {document.feedback && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4"
            >
              <p className="text-sm text-amber-800 font-medium mb-1">Feedback</p>
              <p className="text-sm text-amber-700 leading-relaxed">{document.feedback}</p>
            </motion.div>
          )}
        </div>

        <Button
          onClick={onClose}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
        >
          {isLastRound ? (
            <span className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              See Final Results
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Continue to Round {currentRound}
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
