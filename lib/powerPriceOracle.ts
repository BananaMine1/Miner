// powerPriceOracle.ts
// Utility to calculate daily CRROT/kWh price based on in-game events and usage

// Example event types
export type PowerEvent = 'HEAT_WAVE' | 'GREEN_ENERGY_DAY' | 'NORMAL';

export interface PowerOracleInput {
  totalHashrate: number; // e.g., in GH/s
  activePlayers: number;
  events: PowerEvent[];
  basePrice?: number; // fallback base price
}

// Main calculation function
export function calculatePowerPrice({ totalHashrate, activePlayers, events, basePrice = 0.7 }: PowerOracleInput): number {
  let price = basePrice;
  // Hashrate effect: more mining = higher price
  price += Math.min(0.00005 * totalHashrate, 0.3); // cap at +0.3
  // Player effect: more players = higher price
  price += Math.min(0.01 * activePlayers, 0.2); // cap at +0.2
  // Event effects
  if (events.includes('HEAT_WAVE')) price += 0.2;
  if (events.includes('GREEN_ENERGY_DAY')) price -= 0.15;
  // Random daily fluctuation
  const today = new Date().toISOString().slice(0, 10);
  const randomSeed = parseInt(today.replace(/-/g, ''), 10);
  price += ((Math.sin(randomSeed) + 1) / 10 - 0.1); // -0.1 to +0.1
  // Clamp
  price = Math.max(0.4, Math.min(price, 1.5));
  return +price.toFixed(3);
}

// Simple in-memory cache for today's price
let cachedPrice: number | null = null;
let cachedDate: string | null = null;

export function getTodayPowerPrice(input: PowerOracleInput): number {
  const today = new Date().toISOString().slice(0, 10);
  if (cachedDate === today && cachedPrice !== null) return cachedPrice;
  cachedPrice = calculatePowerPrice(input);
  cachedDate = today;
  return cachedPrice;
} 