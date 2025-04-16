// hooks/useOverheat.ts
import { useEffect } from 'react';
import { Miner } from '../lib/types';

export function useOverheat(
  miners: Miner[],
  setMiners: React.Dispatch<React.SetStateAction<Miner[]>>
) {
  useEffect(() => {
    const interval = setInterval(() => {
      setMiners(prev =>
        prev.map(miner => {
          if (miner.overheated) return miner;

          // Overheat chance increases with power draw
          const chance = Math.min(0.005 * miner.watts, 0.15); // max 15% chance
          const didOverheat = Math.random() < chance;

          return didOverheat ? { ...miner, overheated: true } : miner;
        })
      );
    }, 5000); // Check every 5s

    return () => clearInterval(interval);
  }, [miners]);
}
