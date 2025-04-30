export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  criteria: (state: any) => boolean;
  reward: { type: 'xp' | 'upgrade' | 'cosmetic'; value: number | string };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-miner',
    title: 'First Miner!',
    description: 'Place your first miner on the grid.',
    icon: '/assets/achievements/first-miner.png',
    criteria: (state) => state.miners && state.miners.length >= 1,
    reward: { type: 'xp', value: 100 },
  },
  {
    id: 'power-user',
    title: 'Power User',
    description: 'Reach 1000W total power usage.',
    icon: '/assets/achievements/power-user.png',
    criteria: (state) => {
      const usedWatts = state.miners ? state.miners.reduce((sum, m) => sum + (m.watts || 0), 0) : 0;
      return usedWatts >= 1000;
    },
    reward: { type: 'xp', value: 250 },
  },
  {
    id: 'collection-complete',
    title: 'Collector',
    description: 'Own at least one of every miner type.',
    icon: '/assets/achievements/collector.png',
    criteria: (state) => {
      if (!state.miners) return false;
      const ownedTypes = new Set(state.miners.map(m => m.id));
      return ownedTypes.size >= 9; // Update if more miner types are added
    },
    reward: { type: 'cosmetic', value: 'golden-frame' },
  },
  // Add more achievements as needed
]; 