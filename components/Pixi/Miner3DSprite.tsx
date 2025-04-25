// components/Pixi/Miner3DSprite.tsx
import React from 'react';
import { Texture } from 'pixi.js';
import { Sprite } from '@pixi/react';

interface Props {
  texture: Texture;
  gridPos: { i: number; j: number };
  tileSize: { w: number; h: number };
}

export function Miner3DSprite({ texture, gridPos, tileSize }: Props) {
  // Convert grid (i,j) to isometric world XY:
  const worldX = gridPos.i * tileSize.w + tileSize.w / 2;
  const worldY = gridPos.j * tileSize.h;
  
  return (
    <Sprite
      texture={texture}
      anchor={[0.5, 1]}
      x={worldX}
      y={worldY}
      width={tileSize.w * 1.2}
      height={tileSize.h * 1.4}
    />
  );
}
