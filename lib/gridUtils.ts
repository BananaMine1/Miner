import { GridConfig, GridTile } from '../components/GameRoomCanvas/types';

/**
 * Generates the initial grid based on config and miners.
 */
export function generateInitialGrid(gridConfig: GridConfig, miners: any[]): GridTile[] {
  const { rows, cols } = gridConfig;
  // Defensive: sort miners by position for consistent rendering
  const sortedMiners = Array.isArray(miners) ? [...miners].sort((a, b) => a.position - b.position) : [];
  const grid: GridTile[] = [];
  for (let i = 0; i < rows * cols; i++) {
    // Always use the sorted array for mapping
    const miner = sortedMiners.find(m => m.position === i);
    grid.push({
      index: i,
      miner: miner || undefined,
      locked: false,
      status: miner ? {
        overheated: miner.overheated,
        boosted: miner.boosted,
        durability: miner.durability,
        xp: miner.xp,
        level: miner.level,
      } : {},
    });
  }
  return grid;
}

/**
 * Calculates the world position for a grid slot using bilinear interpolation for isometric grids.
 * This ensures miners and grid cells align perfectly.
 */
export function getGridSlotWorldPosition(col, row, gridConfig: GridConfig) {
  const { cols, rows, cellSize, topLeft, topRight, bottomLeft, bottomRight } = gridConfig;

  // If we have the four corners of the grid defined, use bulletproof bilinear interpolation
  if (topLeft && topRight && bottomLeft && bottomRight) {
    // Use cols-1 and rows-1 for normalization
    const s = cols > 1 ? col / (cols - 1) : 0;
    const t = rows > 1 ? row / (rows - 1) : 0;
    const x =
      (1 - s) * (1 - t) * topLeft.x +
      s * (1 - t) * topRight.x +
      (1 - s) * t * bottomLeft.x +
      s * t * bottomRight.x;
    const y =
      (1 - s) * (1 - t) * topLeft.y +
      s * (1 - t) * topRight.y +
      (1 - s) * t * bottomLeft.y +
      s * t * bottomRight.y;
    return { x, y };
  } else {
    // Fallback: centered rectangular grid
    let width = 0, height = 0;
    if (typeof window !== 'undefined') {
      width = window.innerWidth;
      height = window.innerHeight;
    }
    const gridWidth = cols * cellSize;
    const gridHeight = rows * cellSize;
    const offsetX = (width - gridWidth) / 2;
    const offsetY = (height - gridHeight) / 2;
    return {
      x: col * cellSize + cellSize / 2 + offsetX,
      y: row * cellSize + cellSize / 2 + offsetY
    };
  }
}

/*
====================
LEGACY GRID LOGIC (ARCHIVED)
====================

// The following functions are retained for reference only. They are no longer used in the new data-driven grid system.

export function generateInitialGrid(gridConfig: GridConfig, miners: any[]): GridTile[] {
  // ... (function body)
}

export function getGridSlotWorldPosition(col, row, gridConfig: GridConfig) {
  // ... (function body)
}
*/ 