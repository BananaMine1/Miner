import React from 'react';

const slots = Array(6).fill(0);

export default function MinerGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {slots.map((_, i) => (
        <div key={i} className="bg-yellow-100 p-6 rounded-lg text-jungleGreen shadow-2xl transform transition hover:scale-105">
          <h3 className="text-xl font-bold mb-2">Miner #{i + 1}</h3>
          <p className="mb-1">Hash: <span className="font-semibold">1,000 GH/s</span></p>
          <p className="mb-1">Status: <span className="font-semibold">Active</span></p>
          <button className="mt-2 bg-green-700 hover:bg-green-600 text-offWhite py-1 px-3 rounded">
            View Details
          </button>
        </div>
      ))}
    </div>
  );
}
