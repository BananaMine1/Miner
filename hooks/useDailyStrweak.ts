// hooks/useDailyStreak.ts
import { useEffect, useState } from 'react';

const STREAK_KEY = 'daily-streak';
const CLAIMED_KEY = 'streak-claimed';

export function useDailyStreak() {
  const [streak, setStreak] = useState(0);
  const [canClaim, setCanClaim] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(STREAK_KEY);
    const claimed = localStorage.getItem(CLAIMED_KEY) === today;

    const data = stored ? JSON.parse(stored) : { date: '', count: 0 };
    const lastLogin = new Date(data.date).toDateString();

    if (lastLogin === today) {
      setStreak(data.count);
    } else {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = lastLogin === yesterday ? data.count + 1 : 1;

      localStorage.setItem(STREAK_KEY, JSON.stringify({ date: today, count: newStreak }));
      setStreak(newStreak);
    }

    setCanClaim(!claimed);
  }, []);

  const claimReward = () => {
    const today = new Date().toDateString();
    localStorage.setItem(CLAIMED_KEY, today);
    setCanClaim(false);

    // Return reward type/value
    return 10; // Example: 10 $CRROT
  };

  return { streak, canClaim, claimReward };
}
