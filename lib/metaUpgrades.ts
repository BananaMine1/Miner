export interface MetaUpgrade {
  id: string;
  title: string;
  description: string;
  cost: number; // XP cost
  effect: (state: any) => any;
  icon: string;
  unlocked: boolean;
}

export const META_UPGRADES: MetaUpgrade[] = [
  {
    id: 'xp-boost-1',
    title: 'Carrot Wisdom I',
    description: '+5% Carrot Points from all sources.',
    cost: 500,
    effect: (state) => ({ ...state, xpMultiplier: (state.xpMultiplier || 1) + 0.05 }),
    icon: '/assets/upgrades/xp-boost.png',
    unlocked: false,
  },
  {
    id: 'power-saver',
    title: 'Efficient Diggers',
    description: 'Reduce bunny energy use by 5%.',
    cost: 750,
    effect: (state) => ({ ...state, minerWattageMultiplier: (state.minerWattageMultiplier || 1) - 0.05 }),
    icon: '/assets/upgrades/power-saver.png',
    unlocked: false,
  },
  // Add more upgrades as needed
]; 