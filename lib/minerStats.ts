// lib/minerStats.ts

export interface MinerLevel {
    level: number;
    xp: number;
    hashBoost: number;
    powerModifier: number;
    upgradeCost: number;
    xpToNext: number;
  }

  export const minerLevels: MinerLevel[] = [
    {
      level: 1,
      xp: 0,
      hashBoost: 1.0,
      powerModifier: 1.0,
      upgradeCost: 0,
      xpToNext: 100,
    },
    {
      level: 2,
      xp: 100,
      hashBoost: 1.2,
      powerModifier: 0.95,
      upgradeCost: 50,
      xpToNext: 300,
    },
    {
      level: 3,
      xp: 300,
      hashBoost: 1.5,
      powerModifier: 0.9,
      upgradeCost: 150,
      xpToNext: Infinity, // max level
    },
  ];
  
  export function getLevelInfo(xp: number) {
    if (xp >= 300) return { level: 3, xpToNext: Infinity, hashBonus: 1.5, wattBonus: 0.9 };
    if (xp >= 100) return { level: 2, xpToNext: 300, hashBonus: 1.2, wattBonus: 0.95 };
    return { level: 1, xpToNext: 100, hashBonus: 1.0, wattBonus: 1.0 };
  }
  