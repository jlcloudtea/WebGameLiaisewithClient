'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import ChatPanel from './chat-panel';
import DocumentPanel from './document-panel';
import RoundTimer from './round-timer';
import FeedbackModal from './feedback-modal';
import Leaderboard from './leaderboard';
import { Badge } from '@/components/ui/badge';
import { TOTAL_ROUNDS, ROUND_TIME_SECONDS, ROUND_DOCUMENT_TYPES, type DocumentType, type GameSession, type PlayerDocument } from '@/lib/game-types';
import { FileText, Star } from 'lucide-react';

interface GameScreenProps {
  gameId: string;
  teamId: string;
  teamName: string;
  onGameOver: (score: number, documents: PlayerDocument[]) => void;
}

export default function GameScreen({ gameId, teamId, teamName, onGameOver }: GameScreenProps) {
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [displayedScore, setDisplayedScore] = useState(0);
  const [feedbackDoc, setFeedbackDoc] = useState<PlayerDocument | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [roundKey, setRoundKey] = useState(0);
  const onGameOverRef = useRef(onGameOver);
  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  // Animated score counter
  useEffect(() => {
    if (displayedScore === score) return;
    const duration = 500;
    const startTime = Date.now();
    const startVal = displayedScore;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedScore(Math.round(startVal + (score - startVal) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score, displayedScore]);

  // Fetch game state
  const fetchGameState = useCallback(async () => {
    try {
      const res = await fetch(`/api/game/${gameId}`);
      if (res.ok) {
        const data: GameSession = await res.json();
        setGameSession(data);

        // Calculate total score from documents
        const totalScore = data.documents.reduce((sum, doc) => sum + doc.scoreEarned, 0);
        setScore(totalScore);

        if (data.isComplete) {
          onGameOverRef.current(totalScore, data.documents);
        }
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchGameState();
  }, [fetchGameState]);

  // Submit document
  const handleSubmit = useCallback(async (documentType: DocumentType, content: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/game/${gameId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          content: JSON.stringify(content),
          roundSubmitted: gameSession?.currentRound || 1,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setFeedbackDoc(data.document);
        setShowFeedback(true);
        // Refresh game state
        await fetchGameState();
        // Reset timer for next round
        setRoundKey((k) => k + 1);
      }
    } catch {
      // silently fail
    } finally {
      setIsSubmitting(false);
    }
  }, [gameId, gameSession?.currentRound, fetchGameState]);

  // Auto-submit when timer runs out
  const handleTimeUp = useCallback(async () => {
    if (isSubmitting || !gameSession) return;
    const docType = ROUND_DOCUMENT_TYPES[gameSession.currentRound];
    if (docType) {
      await handleSubmit(docType, {});
    }
  }, [isSubmitting, gameSession, handleSubmit]);

  const handleCloseFeedback = () => {
    setShowFeedback(false);
    setFeedbackDoc(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-amber-300 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-amber-700 font-medium">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!gameSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="text-center">
          <p className="text-amber-700 font-medium">Failed to load game. Please refresh.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-amber-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-amber-900 text-sm leading-tight">Scope Creep & Paper Trails</h1>
              <p className="text-xs text-amber-600">{teamName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <RoundTimer
              key={roundKey}
              totalSeconds={ROUND_TIME_SECONDS}
              onTimeUp={handleTimeUp}
              isRunning={!gameSession.isComplete}
            />

            <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 px-3 py-1">
              Round {gameSession.currentRound}/{TOTAL_ROUNDS}
            </Badge>

            <motion.div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold"
              key={`score-${score}`}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Star className="w-4 h-4" />
              <span className="text-sm">{displayedScore}</span>
            </motion.div>

            <Leaderboard currentTeamId={teamId} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-5rem)]">
          {/* Left Column - Chat */}
          <div className="min-h-[400px] lg:min-h-0">
            <ChatPanel
              messages={gameSession.messages}
              currentRound={gameSession.currentRound}
            />
          </div>

          {/* Right Column - Document */}
          <div className="min-h-[400px] lg:min-h-0">
            <DocumentPanel
              currentRound={gameSession.currentRound}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-amber-900 text-amber-200 text-center py-3 text-xs">
        <p>Scope Creep & Paper Trails — An educational ICT game about managing client requirements</p>
      </footer>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={handleCloseFeedback}
        document={feedbackDoc}
        currentRound={gameSession.currentRound}
        totalRounds={TOTAL_ROUNDS}
      />
    </div>
  );
}
