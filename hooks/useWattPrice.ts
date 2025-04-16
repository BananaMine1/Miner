import { useEffect, useState, useCallback, useRef } from 'react';

function getRandomWattPrice() {
  // Simulate a price between 0.4 and 1.2 BNANA/kWh
  return +(0.4 + Math.random() * 0.8).toFixed(3);
}

export function useWattPrice() {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [yesterdayPrice, setYesterdayPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPrice = useCallback(() => {
    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setYesterdayPrice((prev) => prev ?? getRandomWattPrice());
      setCurrentPrice(getRandomWattPrice());
      setLoading(false);
    }, 600);
  }, []);

  useEffect(() => {
    fetchPrice();
    // Auto-refresh once every 24 hours (realistic oracle update)
    intervalRef.current = setInterval(fetchPrice, 1000 * 60 * 60 * 24);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchPrice]);

  const refresh = () => {
    fetchPrice();
  };

  const delta =
    currentPrice !== null && yesterdayPrice !== null
      ? +(currentPrice - yesterdayPrice).toFixed(3)
      : null;

  return {
    currentPrice,
    yesterdayPrice,
    delta,
    loading,
    refresh,
  };
} 