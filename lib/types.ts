export interface Miner {
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
