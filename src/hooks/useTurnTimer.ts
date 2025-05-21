"use client";
import { useState, useRef, useCallback, useEffect }
  from 'react';

export function useTurnTimer() {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopTimer = useCallback(() => {
    setIsActive(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback((timerDuration: number) => {
    stopTimer(); // Clear any existing timer
    setIsActive(true);
    setDuration(timerDuration);
    setTimeRemaining(timerDuration);

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 100) {
          stopTimer();
          return 0;
        }
        return prevTime - 100;
      });
    }, 100);
  }, [stopTimer]);

  const resetTimer = useCallback(() => {
     stopTimer();
     setDuration(0);
     setTimeRemaining(0);
  }, [stopTimer]);


  useEffect(() => {
    return () => stopTimer(); // Cleanup on unmount
  }, [stopTimer]);

  const progress = duration > 0 ? (timeRemaining / duration) * 100 : 0;

  return {
    isMyTurnTimerActive: isActive,
    turnTimerDuration: duration,
    turnTimeRemaining: timeRemaining,
    turnTimerProgress: progress,
    startMyTurnTimer: startTimer,
    stopMyTurnTimer: stopTimer,
    resetMyTurnTimer: resetTimer,
  };
}