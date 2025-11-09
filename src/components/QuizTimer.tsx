import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface QuizTimerProps {
  totalSeconds: number;
  onTimeUp: () => void;
  isPaused?: boolean;
}

export function QuizTimer({ totalSeconds, onTimeUp, isPaused = false }: QuizTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  // Update ref when callback changes
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Reset timer when totalSeconds changes (new quiz started)
  useEffect(() => {
    setRemainingSeconds(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isPaused || remainingSeconds <= 0) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [remainingSeconds, isPaused]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const isLowTime = remainingSeconds < 30;

  return (
    <motion.div
      className={cn(
        'flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border transition-colors flex-shrink-0',
        isLowTime
          ? 'bg-red-500/10 border-red-500/50 text-red-600 dark:text-red-400'
          : 'bg-card border-border'
      )}
      animate={isLowTime ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.5, repeat: isLowTime ? Infinity : 0 }}
    >
      <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
      <motion.span
        key={remainingSeconds}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
        className="font-mono text-sm sm:text-lg font-semibold whitespace-nowrap"
      >
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </motion.span>
    </motion.div>
  );
}

