import { useEffect, useState } from 'react';
import * as PIXI from 'pixi.js';
import { GridConfig } from './types';

// Original image-space grid corners for each room level
const ROOM_GRID_CORNERS = [
  {
    topLeft: { x: 485, y: 713 },
    topRight: { x: 690, y: 638 },
    bottomLeft: { x: 690, y: 807 },
    bottomRight: { x: 895, y: 714 },
  },
  // Add more room levels as needed
];

const ROOM_GRID_CORNERS_MOBILE = [
  // Mobile - Shack (adjust these values as needed for placement)
  {
    topLeft: { x: 300, y: 947 },
    topRight: { x: 510, y: 855 },
    bottomLeft: { x: 510, y: 1060 },
    bottomRight: { x: 727, y: 950 },
  },
  // Add more if you want mobile overrides for other rooms
];

export function useResponsiveGridConfig(app: PIXI.Application | null, bgSprite: PIXI.Sprite | null, roomLevel: number, rows: number, cols: number, cellSize: number, isMobile?: boolean): GridConfig {
  const [gridConfig, setGridConfig] = useState<GridConfig>({
    rows,
    cols,
    cellSize,
    topLeft: { x: 0, y: 0 },
    topRight: { x: 0, y: 0 },
    bottomLeft: { x: 0, y: 0 },
    bottomRight: { x: 0, y: 0 },
  });

  useEffect(() => {
    function recalcGridConfig() {
      if (!app || !bgSprite || !bgSprite.texture) return;
      const { width, height } = app.screen;
      const scale = Math.max(width / bgSprite.texture.width, height / bgSprite.texture.height);
      const offsetX = (width - bgSprite.texture.width * scale) / 2;
      const offsetY = (height - bgSprite.texture.height * scale) / 2;
      const original = isMobile && roomLevel === 0
        ? ROOM_GRID_CORNERS_MOBILE[roomLevel] || ROOM_GRID_CORNERS_MOBILE[0]
        : ROOM_GRID_CORNERS[roomLevel] || ROOM_GRID_CORNERS[0];
      setGridConfig({
        rows,
        cols,
        cellSize,
        topLeft:     { x: original.topLeft.x * scale + offsetX,     y: original.topLeft.y * scale + offsetY },
        topRight:    { x: original.topRight.x * scale + offsetX,    y: original.topRight.y * scale + offsetY },
        bottomLeft:  { x: original.bottomLeft.x * scale + offsetX,  y: original.bottomLeft.y * scale + offsetY },
        bottomRight: { x: original.bottomRight.x * scale + offsetX, y: original.bottomRight.y * scale + offsetY },
      });
    }
    recalcGridConfig();
    window.addEventListener('resize', recalcGridConfig);
    return () => window.removeEventListener('resize', recalcGridConfig);
  }, [app, bgSprite, roomLevel, rows, cols, cellSize, isMobile]);

  return gridConfig;
} 