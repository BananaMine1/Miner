import React from 'react';

// Export the props interface
export interface BackgroundLayerProps {
  roomTier: string; // e.g., 'shack', 'apartment', 'mansion'
}

// Map room tiers to corresponding background image assets
const roomBackgrounds: Record<string, string> = {
  shack: '/assets/rooms/shack.jpg',
  apartment: '/assets/rooms/apartment.jpg', // Example
  mansion: '/assets/rooms/mansion.jpg', // Example
  default: '/assets/rooms/default.jpg', // Fallback
};

export default function BackgroundLayer({ roomTier }: BackgroundLayerProps) {
  const imageUrl = roomBackgrounds[roomTier] || roomBackgrounds.default;

  return (
    <div
      className="absolute inset-0 z-0 bg-cover bg-center" // Use Tailwind classes
      style={{ backgroundImage: `url(${imageUrl})` }}
      aria-hidden="true" // Decorative background
    />
  );
} 