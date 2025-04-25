import React from 'react';

interface WattPriceDisplayProps {
  currentPrice: number | null;
  delta: number | null;
  loading: boolean;
  onRefresh: () => void;
}

const WattPriceDisplay: React.FC<WattPriceDisplayProps> = ({ currentPrice, delta, loading, onRefresh }) => (
  <span
    className="flex items-center gap-1 flex-shrink-0"
    title="Current watt price (BNANA per kWh). Updates daily via oracle."
  >
    🔋
    {loading ? (
      <span className="inline-block animate-spin h-4 w-4 border-t-2 border-yellow-400 border-solid rounded-full"></span>
    ) : currentPrice !== null ? (
      <>
        {currentPrice} <span className="text-yellow-300">BNANA/kWh</span>
        {delta !== null && delta !== 0 && (
          <span
            className={
              delta > 0
                ? 'ml-1 text-red-400 font-bold'
                : 'ml-1 text-green-400 font-bold'
            }
            title={
              delta > 0
                ? `Up ${delta} since yesterday`
                : `Down ${Math.abs(delta)} since yesterday`
            }
          >
            {delta > 0 ? '▲' : '▼'} {Math.abs(delta)}
          </span>
        )}
        <button
          onClick={onRefresh}
          className="ml-1 px-1 py-0.5 rounded bg-yellow-400 text-green-900 text-xs font-bold hover:scale-105 transition"
          title="Refresh watt price (for testing)"
          style={{ lineHeight: 1 }}
        >
          ↻
        </button>
      </>
    ) : (
      <span className="text-gray-400">--</span>
    )}
  </span>
);

export default WattPriceDisplay; 