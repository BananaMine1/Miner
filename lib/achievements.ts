export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  criteria: (state: any) => boolean;
  reward: { type: 'xp' | 'upgrade' | 'cosmetic'; value: number | string; icon?: string; label?: string };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-miner',
    title: 'First Bunny Buddy!',
    description: 'Welcome your first bunny to the burrow.',
    icon: '/assets/achievements/first-miner.png',
    criteria: (state) => state.miners && state.miners.length >= 1,
    reward: { type: 'xp', value: 100, icon: '🥕', label: 'Carrot Points' },
  },
  {
    id: 'power-user',
    title: 'Burrow Builder',
    description: 'Reach 1000W total burrow power.',
    icon: '/assets/achievements/power-user.png',
    criteria: (state) => {
      const usedWatts = state.miners ? state.miners.reduce((sum, m) => sum + (m.watts || 0), 0) : 0;
      return usedWatts >= 1000;
    },
    reward: { type: 'xp', value: 250, icon: '🥕', label: 'Carrot Points' },
  },
  {
    id: 'collection-complete',
    title: 'Bunny Brigade',
    description: 'Recruit at least one of every bunny type.',
    icon: '/assets/achievements/collector.png',
    criteria: (state) => {
      if (!state.miners) return false;
      const ownedTypes = new Set(state.miners.map(m => m.id));
      return ownedTypes.size >= 9; // Update if more bunny types are added
    },
    reward: { type: 'cosmetic', value: 'golden-carrot-frame', icon: '🎀', label: 'Golden Carrot Frame' },
  },
  // Add more achievements as needed
]; 