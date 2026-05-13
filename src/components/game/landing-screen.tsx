'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Zap, Shield, ClipboardList, BookOpen } from 'lucide-react';

interface LandingScreenProps {
  onGameStart: (teamId: string, gameId: string, teamName: string) => void;
}

export default function LandingScreen({ onGameStart }: LandingScreenProps) {
  const [teamName, setTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      setError('Please enter a team name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create team (no password required)
      const teamRes = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teamName.trim() }),
      });

      if (!teamRes.ok) {
        const data = await teamRes.json();
        throw new Error(data.error || 'Failed to create team');
      }

      const teamData = await teamRes.json();
      const teamId = teamData.id;

      // Start game
      const gameRes = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId }),
      });

      if (!gameRes.ok) {
        const data = await gameRes.json();
        throw new Error(data.error || 'Failed to start game');
      }

      const gameData = await gameRes.json();
      onGameStart(teamId, gameData.id, teamName.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="mx-auto mb-4 w-28 h-28 rounded-2xl overflow-hidden shadow-lg border-2 border-amber-300"
          >
            <img
              src="/game-logo.png"
              alt="Bark & Byte - Scope Creep & Paper Trails"
              className="w-full h-full object-cover"
            />
          </motion.div>
          <h1 className="text-4xl font-bold text-amber-900 tracking-tight">
            Scope Creep
          </h1>
          <h2 className="text-2xl font-semibold text-amber-700 mt-1">
            & Paper Trails
          </h2>
          <p className="text-amber-600 mt-3 text-sm max-w-sm mx-auto">
            Navigate client communications, avoid verbal traps, and document everything properly. Are you up for the challenge?
          </p>
        </div>

        {/* Game Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-amber-200/50">
            <Shield className="w-6 h-6 text-amber-600 mb-1" />
            <span className="text-xs text-amber-700 font-medium">5 Rounds</span>
          </div>
          <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-amber-200/50">
            <Zap className="w-6 h-6 text-amber-600 mb-1" />
            <span className="text-xs text-amber-700 font-medium">5 Min/Round</span>
          </div>
          <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-amber-200/50">
            <ClipboardList className="w-6 h-6 text-amber-600 mb-1" />
            <span className="text-xs text-amber-700 font-medium">5 Documents</span>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-amber-200 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-amber-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Create Your Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName" className="text-amber-800">Team Name</Label>
                  <Input
                    id="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter your team name"
                    className="border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-600 bg-red-50 p-2 rounded-md"
                  >
                    {error}
                  </motion.p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold h-11"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Starting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Start Game
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-amber-500 mt-6"
        >
          An educational ICT game about managing client requirements
        </motion.p>
      </motion.div>
    </div>
  );
}
