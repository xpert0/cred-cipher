import { useEffect, useState } from "react";

export function useCooldown(seconds = 20) {
  const [locked, setLocked] = useState(true);
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          setLocked(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  return { locked, timeLeft };
}