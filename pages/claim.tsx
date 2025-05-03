import React from 'react';
import dynamic from 'next/dynamic';

function ClaimPage() {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Claim Your $CRROT</h2>
      <div className="bg-yellow-100 text-jungleGreen p-8 rounded-lg shadow-2xl max-w-md mx-auto">
        <p className="text-xl mb-4">Total Earned: <span className="font-bold">324.5 $CRROT</span></p>
        <button className="w-full bg-green-700 hover:bg-green-600 text-white py-3 rounded-lg shadow-md">
          Claim Now
        </button>
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(ClaimPage), { ssr: false });
