import { useState, useEffect } from 'react';

/**
 * Calculates passive $BNANA earnings based on hashrate.
 * @param hashRate Total active hashrate in GH/s
 * @param watts Total power consumption in Watts
 */
export function useEarnings(hashRate: number, watts: number) {
  const [unclaimed, setUnclaimed] = useState(0);

  // Simulate $BNANA rewards accumulation every second
  useEffect(() => {
    const interval = setInterval(() => {
      const rewardRate = 0.002; // $BNANA per GH/s per second
      const powerCostRate = 0.0001; // Cost per watt per second

      const reward = hashRate * rewardRate;
      const cost = watts * powerCostRate;

      const netGain = reward - cost;
      if (netGain > 0) {
        setUnclaimed(prev => prev + netGain);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hashRate, watts]);

  const claim = () => {
    const claimed = unclaimed;
    setUnclaimed(0);
    return claimed;
  };

  return { unclaimed, claim };
}
