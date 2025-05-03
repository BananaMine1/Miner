import React from 'react';

export default function UpgradePanel() {
  return (
    <div className="bg-green-800 text-white p-6 mt-6 rounded-lg shadow-2xl max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-3">Upgrade Facility</h2>
      <p className="text-lg mb-4">Increase slots or boost mining power by upgrading your facility.</p>
      <button className="w-full bg-yellow-400 hover:bg-yellow-300 text-jungleGreen font-bold py-3 px-4 rounded-lg shadow-lg">
        Upgrade (50 $CRROT)
      </button>
    </div>
  );
}
