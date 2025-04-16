// hooks/useMinerXP.ts
import { useEffect } from 'react';
import { Miner } from '../lib/types';

export function useMinerXP(
  miners: Miner[],
  setMiners: React.Dispatch<React.SetStateAction<Miner[]>>
) {
  useEffect(() => {
    const interval = setInterval(() => {
      setMiners(prev =>
        prev.map(m => {
          if (m.overheated) return m; // No XP gain if overheated
          const newXP = (m.xp || 0) + 5;
          return { ...m, xp: newXP };
        })
      );
    }, 3000); // Every 3 seconds

    return () => clearInterval(interval);
  }, [miners]);
}
