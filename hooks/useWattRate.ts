// hooks/useWattRate.ts
import { useEffect, useState } from 'react';
import { getRandomWattRate } from '../lib/economy';

export function useWattRate() {
  const [rate, setRate] = useState(getRandomWattRate());

  useEffect(() => {
    const interval = setInterval(() => {
      setRate(getRandomWattRate());
    }, 1000 * 60 * 60 * 24); // Change every 24h

    return () => clearInterval(interval);
  }, []);

  return rate;
}
