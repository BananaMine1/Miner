// hooks/useLootDrops.ts
import { useEffect } from 'react';
import { Miner } from '../lib/types';

export function useLootDrops(
  miners: Miner[],
  setLoot: React.Dispatch<React.SetStateAction<string[]>>
) {
  useEffect(() => {
    const interval = setInterval(() => {
      miners.forEach(miner => {
        const dropChance = 0.01; // 1% chance per miner every 10s
        if (Math.random() < dropChance) {
          const loot = Math.random();

          if (loot < 0.33) {
            setLoot(prev => [...prev, 'haste']);
          } else if (loot < 0.66) {
            setLoot(prev => [...prev, 'efficiency']);
          } else {
            setLoot(prev => [...prev, 'bonus']);
          }
        }
      });
    }, 10000); // Every 10s

    return () => clearInterval(interval);
  }, [miners]);
}
