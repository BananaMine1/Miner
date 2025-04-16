import { useEffect, useState } from 'react';

export function useAnimatedNumber(target: number, duration = 500) {
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    const start = display;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = start + (target - start) * progress;
      setDisplay(value);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return Number(display.toFixed(2));
}
