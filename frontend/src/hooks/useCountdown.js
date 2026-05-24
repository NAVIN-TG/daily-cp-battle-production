import { useState, useEffect, useRef } from 'react';

export const useCountdown = (targetTime, durationMs) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!targetTime || !durationMs) return;

    const endTime = new Date(targetTime).getTime() + durationMs;

    const tick = () => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(intervalRef.current);
        return;
      }
      setTimeLeft(remaining);
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);

    return () => clearInterval(intervalRef.current);
  }, [targetTime, durationMs]);

  const format = (ms) => {
    if (ms === null) return '--:--';
    if (ms <= 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isLow = timeLeft !== null && timeLeft < 5 * 60 * 1000; // < 5 min
  const isCritical = timeLeft !== null && timeLeft < 60 * 1000; // < 1 min

  return { timeLeft, formatted: format(timeLeft), isLow, isCritical };
};
