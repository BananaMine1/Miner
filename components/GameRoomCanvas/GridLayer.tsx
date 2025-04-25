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
    gridGfx.lineStyle(2, 0xffffff, 0.5);

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

    // Debug: Draw colored circles at each corner
    const cornerRadius = 10;
    // Top Left - Red
    gridGfx.beginFill(0xff0000);
    gridGfx.drawCircle(topLeft.x, topLeft.y, cornerRadius);
    gridGfx.endFill();
    // Top Right - Green
    gridGfx.beginFill(0x00ff00);
    gridGfx.drawCircle(topRight.x, topRight.y, cornerRadius);
    gridGfx.endFill();
    // Bottom Left - Blue
    gridGfx.beginFill(0x0000ff);
    gridGfx.drawCircle(bottomLeft.x, bottomLeft.y, cornerRadius);
    gridGfx.endFill();
    // Bottom Right - Yellow
    gridGfx.beginFill(0xffff00);
    gridGfx.drawCircle(bottomRight.x, bottomRight.y, cornerRadius);
    gridGfx.endFill();

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