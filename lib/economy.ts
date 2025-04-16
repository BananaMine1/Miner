// lib/economy.ts
export function getRandomWattRate(): number {
    // Simulate electricity between 0.4–1.2 $BNANA per watt
    const rate = parseFloat((0.4 + Math.random() * 0.8).toFixed(2));
    return rate;
  }
  