// lib/economy.ts

// Simulate a fluctuating watt rate (e.g., between 10 and 90, changing every minute)
export function getWattRate(): number {
  const now = new Date();
  const base = now.getMinutes();
  // Sine wave for smooth fluctuation
  return Math.round(50 + 40 * Math.sin((base / 60) * 2 * Math.PI));
}

// For legacy compatibility
export const getRandomWattRate = getWattRate; 