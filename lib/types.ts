export interface Miner {
  instanceId: string;
  id: number;
  name: string;
  hash: number;
  watts: number;
  image: string;
  position: number;
  xp?: number;
  overheated?: boolean;
  durability?: number;
}
