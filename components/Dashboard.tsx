import React from 'react';
import PowerMeter from './PowerMeter';
import MinerGrid from './MinerGrid';

export default function Dashboard() {
  return (
    <div className="p-6">
      <PowerMeter />
      <MinerGrid />
    </div>
  );
}
