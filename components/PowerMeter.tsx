import React from 'react';

export default function PowerMeter() {
  return (
    <div className="bg-green-800 text-white p-6 mb-6 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-2">Power Meter</h2>
      <div className="w-full bg-green-900 h-6 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-bananaYellow to-green-300 h-full transition-all duration-500"
          style={{ width: '70%' }}
        ></div>
      </div>
      <p className="mt-2 text-lg">70% energy remaining. Refill soon!</p>
    </div>
  );
}
