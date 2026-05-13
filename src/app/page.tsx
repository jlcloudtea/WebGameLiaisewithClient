'use client';

import { useState, useEffect } from 'react';
import LandingScreen from '@/components/game/landing-screen';
import GameScreen from '@/components/game/game-screen';
import GameOverScreen from '@/components/game/game-over-screen';
import type { PlayerDocument } from '@/lib/game-types';

type Screen = 'landing' | 'game' | 'gameover' | 'loading';

export default function Home() {
  // Start with 'loading' so the server always renders a static placeholder.
  // After mount on the client, we check localStorage and switch to the real screen.
  // This prevents hydration mismatches from framer-motion / dynamic client data.
  const [screen, setScreen] = useState<Screen>('loading');
  const [teamId, setTeamId] = useState<string>('');
  const [gameId, setGameId] = useState<string>('');
  const [teamName, setTeamName] = useState<string>('');
  const [finalScore, setFinalScore] = useState(0);
  const [finalDocuments, setFinalDocuments] = useState<PlayerDocument[]>([]);
  const [leaderboardPosition, setLeaderboardPosition] = useState(0);

  // Restore from localStorage on mount (client-only)
  useEffect(() => {
    const savedTeamId = localStorage.getItem('game_teamId');
    const savedGameId = localStorage.getItem('game_gameId');
    const savedTeamName = localStorage.getItem('game_teamName');

    if (savedTeamId && savedGameId && savedTeamName) {
      // Verify the game still exists
      fetch(`/api/game/${savedGameId}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Game not found');
        })
        .then((data) => {
          setTeamId(savedTeamId);
          setGameId(savedGameId);
          setTeamName(savedTeamName);

          if (data.isComplete) {
            const totalScore = data.documents.reduce(
              (sum: number, doc: PlayerDocument) => sum + doc.scoreEarned,
              0
            );
            setFinalScore(totalScore);
            setFinalDocuments(data.documents);
            setScreen('gameover');
          } else {
            setScreen('game');
          }
        })
        .catch(() => {
          localStorage.removeItem('game_teamId');
          localStorage.removeItem('game_gameId');
          localStorage.removeItem('game_teamName');
          setScreen('landing');
        });
    } else {
      // Use microtask to avoid synchronous setState in effect
      queueMicrotask(() => setScreen('landing'));
    }
  }, []);

  const handleGameStart = (newTeamId: string, newGameId: string, name: string) => {
    setTeamId(newTeamId);
    setGameId(newGameId);
    setTeamName(name);
    localStorage.setItem('game_teamId', newTeamId);
    localStorage.setItem('game_gameId', newGameId);
    localStorage.setItem('game_teamName', name);
    setScreen('game');
  };

  const handleGameOver = async (score: number, documents: PlayerDocument[]) => {
    setFinalScore(score);
    setFinalDocuments(documents);

    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const entries = await res.json();
        const position =
          entries.findIndex((e: { teamId: string }) => e.teamId === teamId) + 1;
        setLeaderboardPosition(position);
      }
    } catch {
      // silently fail
    }

    setScreen('gameover');
  };

  const handlePlayAgain = () => {
    localStorage.removeItem('game_teamId');
    localStorage.removeItem('game_gameId');
    localStorage.removeItem('game_teamName');

    setTeamId('');
    setGameId('');
    setTeamName('');
    setFinalScore(0);
    setFinalDocuments([]);
    setLeaderboardPosition(0);
    setScreen('landing');
  };

  if (screen === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-amber-300 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-amber-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {screen === 'landing' && (
        <LandingScreen onGameStart={handleGameStart} />
      )}

      {screen === 'game' && gameId && (
        <GameScreen
          gameId={gameId}
          teamId={teamId}
          teamName={teamName}
          onGameOver={handleGameOver}
        />
      )}

      {screen === 'gameover' && (
        <GameOverScreen
          score={finalScore}
          documents={finalDocuments}
          teamName={teamName}
          leaderboardPosition={leaderboardPosition}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </>
  );
}
