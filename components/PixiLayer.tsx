import React, { useRef } from 'react';
import { Texture } from 'pixi.js';
import { Application, Sprite } from '@pixi/react';
import styles from '../styles/PlayPage.module.css';

interface PixiLayerProps {
  gridConfig: { cellSize: number; rows: number; cols: number };
  miners: { id: string; texture: string; position: { x: number; y: number } }[];
}

const PixiLayer: React.FC<PixiLayerProps> = ({ gridConfig, miners }) => {
  const { cellSize, rows, cols } = gridConfig;

  return (
    <div className={styles.pixiLayer}>
      <Application
        resizeTo={window}
        backgroundAlpha={0}
        antialias={true}
        autoDensity={true}
        resolution={window.devicePixelRatio}
        className={styles.pixiApp}
      >
        {/* Render miners as 2D Sprites in a grid */}
        {miners.map((miner) => (
          <Sprite
            key={miner.id}
            texture={Texture.from(miner.texture)}
            x={miner.position.x * cellSize + cellSize / 2}
            y={miner.position.y * cellSize + cellSize}
            anchor={[0.5, 1]}
            width={cellSize}
            height={cellSize}
          />
        ))}
      </Application>
    </div>
  );
};

export default PixiLayer; 