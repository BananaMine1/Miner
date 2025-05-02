import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { GridConfig } from './types';

interface GridLayerProps {
  gameLayer: PIXI.Container;
  gridConfig: GridConfig;
}

// Helper: Linear interpolation between two points
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Helper: Bilinear interpolation for a quadrilateral
function bilerp(
  topLeft: { x: number; y: number },
  topRight: { x: number; y: number },
  bottomLeft: { x: number; y: number },
  bottomRight: { x: number; y: number },
  tx: number,
  ty: number
) {
  // Interpolate horizontally on top and bottom edges
  const top = {
    x: lerp(topLeft.x, topRight.x, tx),
    y: lerp(topLeft.y, topRight.y, tx),
  };
  const bottom = {
    x: lerp(bottomLeft.x, bottomRight.x, tx),
    y: lerp(bottomLeft.y, bottomRight.y, tx),
  };
  // Interpolate vertically between top and bottom
  return {
    x: lerp(top.x, bottom.x, ty),
    y: lerp(top.y, bottom.y, ty),
  };
}

const GridLayer: React.FC<GridLayerProps> = ({ gameLayer, gridConfig }) => {
  const gridGfxRef = useRef<PIXI.Graphics | null>(null);

  useEffect(() => {
    if (!gameLayer) return;
    if (!gridConfig.topLeft || !gridConfig.topRight || !gridConfig.bottomLeft || !gridConfig.bottomRight) return;
    let gridGfx = new PIXI.Graphics();
    gameLayer.addChild(gridGfx);
    gridGfxRef.current = gridGfx;

    // Clear
    gridGfx.clear();

    // Draw grid lines
    const { rows, cols, topLeft, topRight, bottomLeft, bottomRight } = gridConfig;
    gridGfx.setStrokeStyle({ width: 2, color: 0xffffff, alpha: 0.5 });

    // Draw vertical lines (columns)
    for (let c = 0; c <= cols; c++) {
      const t = c / cols;
      const start = bilerp(topLeft, topRight, bottomLeft, bottomRight, t, 0);
      const end = bilerp(topLeft, topRight, bottomLeft, bottomRight, t, 1);
      gridGfx.moveTo(start.x, start.y);
      gridGfx.lineTo(end.x, end.y);
    }
    // Draw horizontal lines (rows)
    for (let r = 0; r <= rows; r++) {
      const t = r / rows;
      const start = bilerp(topLeft, topRight, bottomLeft, bottomRight, 0, t);
      const end = bilerp(topLeft, topRight, bottomLeft, bottomRight, 1, t);
      gridGfx.moveTo(start.x, start.y);
      gridGfx.lineTo(end.x, end.y);
    }
    // Commit the lines to the graphics object (PixiJS v8+)
    gridGfx.stroke();

    return () => {
      if (gridGfxRef.current) {
        if (gridGfxRef.current.parent) {
          gridGfxRef.current.parent.removeChild(gridGfxRef.current);
        }
        gridGfxRef.current.destroy();
      }
    };
  }, [gameLayer, gridConfig]);

  return null; // PixiJS handles rendering
};

export default GridLayer; 