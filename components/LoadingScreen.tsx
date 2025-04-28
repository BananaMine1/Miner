import React, { useEffect, useRef, useState } from 'react';

const SPRITE_SRC = '/assets/ui/banana-loading-sprite.png';
const FRAME_WIDTH = 256;   // Adjust to your frame size in px
const FRAME_HEIGHT = 256;  // Adjust to your frame size in px
const FRAMES_PER_ROW = 5;
const TOTAL_FRAMES = 10;
const ANIMATION_SPEED = 80; // ms per frame

export default function LoadingScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frame, setFrame] = useState(0);

  // Animate frames
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % TOTAL_FRAMES);
    }, ANIMATION_SPEED);
    return () => clearInterval(interval);
  }, []);

  // Draw current frame
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const img = new window.Image();
    img.src = SPRITE_SRC;
    img.onload = () => {
      ctx.clearRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);
      const sx = (frame % FRAMES_PER_ROW) * FRAME_WIDTH;
      const sy = Math.floor(frame / FRAMES_PER_ROW) * FRAME_HEIGHT;
      ctx.drawImage(img, sx, sy, FRAME_WIDTH, FRAME_HEIGHT, 0, 0, FRAME_WIDTH, FRAME_HEIGHT);
    };
  }, [frame]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-80">
      <canvas
        ref={canvasRef}
        width={FRAME_WIDTH}
        height={FRAME_HEIGHT}
        aria-label="Loading"
        style={{ width: 128, height: 128 }}
      />
      <div className="mt-4 text-yellow-200 text-lg font-bold tracking-wide">Loading…</div>
    </div>
  );
} 