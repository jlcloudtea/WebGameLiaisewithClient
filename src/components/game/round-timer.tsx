'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface RoundTimerProps {
  totalSeconds: number;
  onTimeUp: () => void;
  isRunning: boolean;
}

export default function RoundTimer({ totalSeconds, onTimeUp, isRunning }: RoundTimerProps) {
  // Use totalSeconds as initial state; parent controls reset via key prop
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const onTimeUpRef = useRef(onTimeUp);
  const hasCalledTimeUp = useRef(false);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    if (!isRunning) return;
    hasCalledTimeUp.current = false;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!hasCalledTimeUp.current) {
            hasCalledTimeUp.current = true;
            setTimeout(() => onTimeUpRef.current(), 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const getColor = useCallback(() => {
    if (secondsLeft <= 30) return 'text-red-600';
    if (secondsLeft <= 60) return 'text-yellow-600';
    return 'text-amber-700';
  }, [secondsLeft]);

  const getBgColor = useCallback(() => {
    if (secondsLeft <= 30) return 'bg-red-50 border-red-200';
    if (secondsLeft <= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-amber-50 border-amber-200';
  }, [secondsLeft]);

  const getProgressWidth = useCallback(() => {
    return (secondsLeft / totalSeconds) * 100;
  }, [secondsLeft, totalSeconds]);

  const getProgressColor = useCallback(() => {
    if (secondsLeft <= 30) return 'bg-red-500';
    if (secondsLeft <= 60) return 'bg-yellow-500';
    return 'bg-amber-500';
  }, [secondsLeft]);

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getBgColor()} transition-colors duration-300`}>
      <Clock className={`w-4 h-4 ${getColor()} transition-colors duration-300`} />
      <motion.span
        key={secondsLeft}
        className={`font-mono font-bold text-sm ${getColor()} transition-colors duration-300`}
        initial={secondsLeft <= 30 ? { scale: 1.1 } : {}}
        animate={{ scale: 1 }}
        transition={{ duration: 0.15 }}
      >
        {display}
      </motion.span>
      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getProgressColor()} transition-colors duration-300`}
          animate={{ width: `${getProgressWidth()}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}
