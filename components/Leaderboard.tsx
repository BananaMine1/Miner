import React from 'react';

const data = [
    { name: '0xApe...1234', crrot: 5032 },
    { name: '0xMonk...88C1', crrot: 4380 },
    { name: '0xChimp...D09E', crrot: 3950 },
  ];
  
  export default function Leaderboard() {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Top Miners</h2>
        <table className="w-full bg-yellow-100 text-green-900 rounded shadow-md">
          <thead>
            <tr className="bg-yellow-300">
              <th className="p-2 text-left">Player</th>
              <th className="p-2 text-right">$CRROT Earned</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry, idx) => (
              <tr key={idx} className="border-t border-yellow-200">
                <td className="p-2">{entry.name}</td>
                <td className="p-2 text-right">{entry.crrot}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  