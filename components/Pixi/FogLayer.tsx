// components/Pixi/FogLayer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useTick, extend } from '@pixi/react';
import { Texture, Assets, Ticker, Container as PixiContainer, Sprite as PixiSprite } from 'pixi.js';
extend({ Container: PixiContainer, Sprite: PixiSprite });

interface Props {
  dimensions: { w: number; h: number };
}

/**
 * Ground‑fog layer using two regular scrolling PixiReactSprite components.
 * • Loads /assets/fog.png (or grey fallback)
 * • Tiles it across the bottom ~20% of the screen
 * • Drifts it horizontally every frame
 */
export default function FogLayer({ dimensions }: Props) {
  const { w, h } = dimensions;
  console.log(`FogLayer received dimensions: w=${w}, h=${h}`);

  const [tex, setTex] = useState<Texture | null>(null);
  const containerRef = useRef<any>(null);
  const sprite1Ref = useRef<any>(null);
  const sprite2Ref = useRef<any>(null);
  
  // Load texture
  useEffect(() => {
    Assets.load('/assets/fog.png')
      .then((res) => {
        let loadedTexture: Texture | null = null;
        if (res?.source instanceof Object) {
          loadedTexture = res as Texture;
        } else if (typeof res === 'object' && res !== null && res['/assets/fog.png']?.source instanceof Object) {
          loadedTexture = res['/assets/fog.png'] as Texture;
        } else if (res instanceof Texture) {
          loadedTexture = res;
        } else {
          const firstTextureLike = Object.values(res as Record<string, any>).find(
            (val: any) => val?.source instanceof Object
          );
          if (firstTextureLike) {
            loadedTexture = firstTextureLike as Texture;
          }
        }

        if (loadedTexture) {
          setTex(loadedTexture);
        } else {
          console.warn('Could not identify fog texture, using fallback.');
          createFallbackTexture();
        }
      })
      .catch(() => {
        console.error('Failed to load fog texture, using fallback.');
        createFallbackTexture();
      });
  // Only need to run once
  }, []); 

  const createFallbackTexture = () => {
    const cvs = document.createElement('canvas');
    cvs.width = cvs.height = 256;
    const ctx = cvs.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(200,200,200,0.6)';
      ctx.fillRect(0, 0, 256, 256);
      const fallbackTex = Texture.from(cvs);
      setTex(fallbackTex);
    } else {
      console.error('Failed to get canvas context for fallback fog texture');
    }
  };
  
  // Animation
  useTick((ticker: Ticker) => {
    const speed = 0.04 * ticker.deltaMS;
    if (sprite1Ref.current && sprite2Ref.current) { 
      sprite1Ref.current.x -= speed;
      sprite2Ref.current.x -= speed;

      // Reset logic based on screen width (w)
      if (sprite1Ref.current.x < -w) {
        sprite1Ref.current.x = sprite2Ref.current.x + w;
      }
      if (sprite2Ref.current.x < -w) {
        sprite2Ref.current.x = sprite1Ref.current.x + w;
      }
    }
  });

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.zIndex = 10;
    }
  }, [containerRef.current]);
  
  // Don't render until texture is loaded
  if (!tex) return null;

  // Adjust height for "low lying" fog (e.g., 15%)
  const fogHeight = Math.max(Math.floor(h * 1), 60); // Use 15% height, smaller min height
  
  // === DEBUG LOG ===
  console.log(`[FogLayer] Height received (h): ${h}, Calculated fogHeight: ${fogHeight}`);
  
  // Define how many pixels to push the fog down from the bottom edge
  const verticalOffset = 385; // <--- ADJUST THIS VALUE (e.g., 50 = 50px lower)
  
  // Position the container so its top edge is (h - fogHeight) + offset
  // This makes its bottom edge align with (h + offset)
  const fogY = h - fogHeight + verticalOffset;

  console.log(`Rendering FogLayer: width=${w} height=${fogHeight} y=${fogY} (offset: ${verticalOffset})`); 

  return (
    <container ref={containerRef} x={0} y={fogY}>
      <sprite
        ref={sprite1Ref}
        texture={tex}
        width={w}
        height={fogHeight}
        x={0}
        alpha={0.8}
      />
      <sprite
        ref={sprite2Ref}
        texture={tex}
        width={w}
        height={fogHeight}
        x={w}
        alpha={0.8}
      />
    </container>
  );
}