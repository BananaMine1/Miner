import type { Miner } from './types';

// Calculate the CRROT cost to upgrade a miner to the next level
export function getUpgradeCost(miner: Miner): number {
  if (!miner.baseUpgradeCost || !miner.level) return 0;
  return miner.baseUpgradeCost * Math.pow(miner.level + 1, 2);
}

// Calculate the XP required to upgrade a miner to the next level
export function getXpToNext(miner: Miner): number {
  if (!miner.level) return 0;
  return 100 * Math.pow(miner.level + 1, 2);
}

// Calculate the CRROT cost to fully repair a miner
export function getRepairCost(miner: Miner): number {
  if (!miner.baseRepairRate || miner.durability === undefined) return 0;
  return Math.ceil((100 - miner.durability) * miner.baseRepairRate);
}

// Calculate the new hashpower after an upgrade
export function getUpgradedHash(miner: Miner): number {
  if (!miner.level) return miner.hash;
  let bonus = 0;
  for (let i = 2; i <= miner.level; i++) {
    bonus += i <= 5 ? 0.10 : 0.05; // 10% per level up to 5, then 5%
  }
  return Math.round(miner.hash * (1 + bonus));
}

// Calculate the new wattage after an upgrade
export function getUpgradedWatts(miner: Miner): number {
  if (!miner.level) return miner.watts;
  let reduction = 0;
  for (let i = 2; i <= miner.level; i++) {
    reduction += 0.02; // 2% per level
  }
  return Math.max(1, Math.round(miner.watts * (1 - reduction)));
} 