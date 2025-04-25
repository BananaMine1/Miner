// components/Pixi/RoomScene.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { Application, Sprite } from '@pixi/react';
import { Texture, Assets } from 'pixi.js';
import { Miner3DSprite } from './Miner3DSprite';

interface Miner { id: string; textureUrl: string; gridX: number; gridY: number; }

interface Props {
  isNight: boolean;
  miners: Miner[];
  gridCols: number;
  gridRows: number;
  backgroundUrl: string;
  gridTileUrl: string;
  name: string;
  wattOutput: number;
}

export default function RoomScene({ isNight, miners, gridCols, gridRows, backgroundUrl, gridTileUrl, name, wattOutput }: Props) {
  const [bgTex, setBgTex] = useState<Texture>();
  const [gridTex, setGridTex] = useState<Texture>();
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const minerTextures = useMemo(
    () =>
      miners.reduce((acc, m) => {
        acc[m.id] = Texture.from(m.textureUrl);
        return acc;
      }, {} as Record<string, Texture>),
    [miners]
  );
  
  // load on mount + when isNight changes
  useEffect(() => {
    if (!Assets.cache.has(backgroundUrl)) {
      Assets.load<Texture>(backgroundUrl).then(setBgTex);
    } else {
      setBgTex(Assets.cache.get(backgroundUrl) as Texture);
    }
    if (!Assets.cache.has(gridTileUrl)) {
      Assets.load<Texture>(gridTileUrl).then(setGridTex);
    } else {
      setGridTex(Assets.cache.get(gridTileUrl) as Texture);
    }
  }, [backgroundUrl, gridTileUrl]);

  // resize listener
  useEffect(() => {
    const onR = () => setSize({ w: innerWidth, h: innerHeight });
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, []);

  if (!bgTex || !gridTex) return null;

  // center the room sprite
  const roomSpriteScale = Math.min(size.w / bgTex.width, size.h / bgTex.height);
  const roomW = bgTex.width * roomSpriteScale;
  const roomH = bgTex.height * roomSpriteScale;

  // compute tile dimensions
  const tileW = roomW / gridCols;
  const tileH = roomH / gridRows;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Application autoStart resizeTo={window} backgroundAlpha={0}>
        {/* 1. Room background */}
        <Sprite
          texture={bgTex}
          width={roomW}
          height={roomH}
          x={(size.w - roomW) / 2}
          y={(size.h - roomH) / 2}
        />

        {/* 2. Floor grid projected onto the plane */}
        {/* <FloorPlane
          gridTexture={gridTex}
          cols={gridCols}
          rows={gridRows}
          tileSize={{ w: tileW, h: tileH }}
        /> */}

        {/* 3. Miners upright on the grid */}
        {miners.map((m) => (
          <Miner3DSprite
            key={m.id}
            texture={minerTextures[m.id]}
            gridPos={{ i: m.gridX, j: m.gridY }}
            tileSize={{ w: tileW, h: tileH }}
          />
        ))}
      </Application>
      {/* Overlay UI */}
      <div style={{ position: 'absolute', top: 10, left: 10, color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: '10px', borderRadius: '5px' }}>
        <h3>{name}</h3>
        <p>Watt Output: {wattOutput}</p>
        <p>Grid Size: {gridCols} x {gridRows}</p>
      </div>
    </div>
  );
}
