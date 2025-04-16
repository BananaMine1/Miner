import React, { useState, useEffect } from 'react';

export default function GameSimulator() {
  const [bnana, setBNANA] = useState(0);
  const [hashRate, setHashRate] = useState(1000);

  useEffect(() => {
    const interval = setInterval(() => {
      setBNANA(prev => prev + hashRate * 0.0001); // simulate mining earnings per second
    }, 1000);
    return () => clearInterval(interval);
  }, [hashRate]);

  return (
    <div className="bg-yellow-100 p-4 rounded text-jungleGreen mt-6 max-w-md mx-auto text-center shadow-2xl">
      <h2 className="text-xl font-bold">Simulated Mining</h2>
      <p className="text-lg">Your Hashrate: {hashRate.toLocaleString()} GH/s</p>
      <p className="text-2xl font-bold mt-2">$BNANA Earned: {bnana.toFixed(4)}</p>
    </div>
  );
}
