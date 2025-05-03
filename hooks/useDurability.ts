// hooks/useDurability.ts
import { useEffect } from 'react';
import { Miner } from '../lib/types';

export function useDurability(
  miners: Miner[],
  setMiners: React.Dispatch<React.SetStateAction<Miner[]>>,
  setBnana: (callback: (prev: number) => number) => void
) {
  useEffect(() => {
    const interval = setInterval(() => {
      setMiners(prev =>
        prev.map(m => {
          if (m.overheated || (m.durability ?? 100) <= 0) return m;

          const newDurability = Math.max((m.durability ?? 100) - 5, 0);

          if (newDurability === 0) {
            // Auto-recycle: give 5 $CRROT back
            setBnana(prev => prev + 5);
            return { ...m, durability: 0 };
          }

          return { ...m, durability: newDurability };
        })
      );
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, [miners]);
}
