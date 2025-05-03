import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';

interface PixiBackgroundLayerProps {
  app: PIXI.Application | null;
  roomLevel: number;
  onSpriteReady?: (sprite: PIXI.Sprite) => void;
  isMobile?: boolean;
}

// Background images for each room tier
const ROOM_BACKGROUNDS = [
  '/assets/rooms/shack.jpg',     // Tier 0: Starter Shack
  '/assets/rooms/swamp_shed.jpg', // Tier 1: Swamp Shed
  '/assets/rooms/jungle_garage.jpg', // Tier 2: Jungle Garage
  '/assets/rooms/tech_lab.jpg',  // Tier 3: Tech Lab (future expansion)
];

const PixiBackgroundLayer: React.FC<PixiBackgroundLayerProps> = ({ app, roomLevel = 0, onSpriteReady, isMobile }) => {
  const spriteRef = useRef<PIXI.Sprite | null>(null);
  const currentTexture = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!app || !app.stage) return;
    let destroyed = false;
    let sprite = spriteRef.current;
    let resizeHandler: (() => void) | null = null;
    setError(null);
    // Get the appropriate background for the room level
    let imageUrl = ROOM_BACKGROUNDS[roomLevel] || ROOM_BACKGROUNDS[0];
    if (isMobile && roomLevel === 0) {
      imageUrl = '/assets/rooms/shack-mobile.png';
    }
    (async () => {
      try {
        await PIXI.Assets.load(imageUrl);
        if (destroyed) return;
        // Remove old sprite if it exists
        if (sprite && app.stage.children.includes(sprite)) {
          app.stage.removeChild(sprite);
          // v8+ PixiJS: Use PIXI.Assets.unload for managed textures
          PIXI.Assets.unload(imageUrl);
          // sprite.destroy();
        }
        const texture = PIXI.Texture.from(imageUrl);
        sprite = new PIXI.Sprite(texture);
        spriteRef.current = sprite;
        currentTexture.current = imageUrl;
        sprite.zIndex = 0;
        app.stage.addChildAt(sprite, 0);
        if (onSpriteReady) onSpriteReady(sprite);
        // Initial sizing
        resizeHandler = () => {
          if (!sprite || !app || !app.screen || !texture) return;
          const { width, height } = app.screen;
          const scale = Math.max(width / texture.width, height / texture.height);
          sprite.width = texture.width * scale;
          sprite.height = texture.height * scale;
          sprite.x = (width - sprite.width) / 2;
          sprite.y = (height - sprite.height) / 2;
        };
        resizeHandler();
        app.renderer.on('resize', resizeHandler);
        window.addEventListener('resize', resizeHandler);
      } catch (error) {
        setError('Failed to load background image. Please check your connection or try again.');
        console.error('Failed to load background image:', error);
      }
    })();
    return () => {
      destroyed = true;
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
        if (app && app.renderer) {
          app.renderer.off('resize', resizeHandler);
        }
      }
    };
  }, [app, roomLevel, onSpriteReady, isMobile]);

  if (error) {
    return <div style={{ position: 'absolute', inset: 0, background: '#222', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>{error}</div>;
  }

  return null;
};

export default PixiBackgroundLayer; 