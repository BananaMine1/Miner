export interface Miner {
  instanceId: string;
  id: number;
  name: string;
  hash: number;
  watts: number;
  image: string;
  position: number;
  price: number;
  description?: string;
  xp?: number;
  overheated?: boolean;
  durability?: number;
  level?: number;
  maxLevel?: number;
  xpToNext?: number;
  baseUpgradeCost?: number;
  baseRepairRate?: number;
  specialAbility?: string;
  boosted?: boolean;
}
