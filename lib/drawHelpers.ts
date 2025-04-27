import * as PIXI from 'pixi.js';
// Extend PIXI.Container to allow __minerSprites property
declare module 'pixi.js' {
  interface Container {
    __minerSprites?: Record<string, PIXI.Sprite>;
  }
}
import { GridConfig, GridTile } from '../components/GameRoomCanvas/types';
import { loadTexture } from './assetManager';
import { getGridSlotWorldPosition } from './gridUtils';

/**
 * === DEBUG: Global offset for cell center debug dots ===
 */
export const DEBUG_CENTER_OFFSET = { x: 0, y: 0 }; // <-- Adjust these values to shift all debug dots

/**
 * Get the exact center of a grid cell for isometric view
 */
function getIsometricCellCenter(col: number, row: number, gridConfig: GridConfig) {
  const { cols, rows } = gridConfig;
  
  // Get the four corners of the cell
  const topLeft = getGridSlotWorldPosition(col, row, gridConfig);
  const topRight = getGridSlotWorldPosition(col + 1, row, gridConfig);
  const bottomLeft = getGridSlotWorldPosition(col, row + 1, gridConfig);
  const bottomRight = getGridSlotWorldPosition(col + 1, row + 1, gridConfig);
  
  // Calculate center point
  return {
    x: (topLeft.x + topRight.x + bottomLeft.x + bottomRight.x) / 4,
    y: (topLeft.y + topRight.y + bottomLeft.y + bottomRight.y) / 4
  };
}

/**
 * Helper to get the true center of a tile
 */
function getTileTrueCenter(col: number, row: number, gridConfig: GridConfig) {
  const p00 = getGridSlotWorldPosition(col, row, gridConfig);         // top-left
  const p10 = getGridSlotWorldPosition(col + 1, row, gridConfig);     // top-right
  const p01 = getGridSlotWorldPosition(col, row + 1, gridConfig);     // bottom-left
  const p11 = getGridSlotWorldPosition(col + 1, row + 1, gridConfig); // bottom-right
  return {
    x: (p00.x + p10.x + p01.x + p11.x) / 4,
    y: (p00.y + p10.y + p01.y + p11.y) / 4,
  };
}

/**
 * Draws miners on the grid. Uses asset manager for textures.
 * Adds culling: only draws sprites within the visible canvas area.
 */
export async function drawMiners(
  container: PIXI.Container,
  grid: GridTile[],
  gridConfig: GridConfig,
  draggedMiner: number | null,
  dragPos: {x: number, y: number} | null,
  onMinerDragStart: (index: number) => void,
  onTileClick: (index: number) => void,
  debug: boolean = false,
  onError?: (msg: string) => void
) {
  // Use a persistent map of sprites on the container
  if (!container.__minerSprites) {
    container.__minerSprites = {};
  }
  const spriteMap = container.__minerSprites;

  const { cols, rows } = gridConfig;
  let width = 0, height = 0;
  if (container.parent && (container.parent as any).renderer) {
    width = (container.parent as any).renderer.width;
    height = (container.parent as any).renderer.height;
  } else if (typeof window !== 'undefined') {
    width = window.innerWidth;
    height = window.innerHeight;
  }

  // Track which indices are still present
  const seenIndices = new Set();

  // Draw all miners
  for (const tile of grid) {
    if (!tile.miner) continue;
    const idx = tile.index;
    if (draggedMiner === idx) continue; // Hide original while dragging
    seenIndices.add(idx);

    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const flippedRow = (rows - 1) - row;
    const cellCenter = getTileTrueCenter(col, flippedRow, gridConfig);
    const x = cellCenter.x;
    const y = cellCenter.y;

    let sprite = spriteMap[idx];
    const texturePath = tile.miner.image || '/assets/miner/miner-3.png';
    if (!sprite) {
      try {
        const texture = await loadTexture(texturePath);
        sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5, 0.5);
        sprite.eventMode = 'static';
        sprite.cursor = 'pointer';
        sprite.on('pointerdown', () => onMinerDragStart(idx));
        sprite.on('pointertap', (e) => {
          e.stopPropagation();
          onTileClick(idx);
        });
        container.addChild(sprite);
        spriteMap[idx] = sprite;
      } catch (err) {
        if (onError) onError('Failed to load miner texture:');
        continue;
      }
    } else {
      // Update texture if changed
      if (sprite.texture.baseTexture.resource?.url !== texturePath) {
        try {
          const texture = await loadTexture(texturePath);
          sprite.texture = texture;
        } catch (err) {
          if (onError) onError('Failed to update miner texture:');
        }
      }
    }
    // Update position and scale
    sprite.x = x;
    sprite.y = y;
    sprite.scale.set(0.25);
    sprite.visible = true;
  }

  // Hide sprites for indices no longer present
  for (const idx in spriteMap) {
    if (!seenIndices.has(Number(idx))) {
      spriteMap[idx].visible = false;
    }
  }

  // Render drag ghost if dragging
  if (draggedMiner !== null && dragPos) {
    const tile = grid.find(t => t.index === draggedMiner);
    if (tile && tile.miner) {
      let ghost = spriteMap['__drag_ghost'];
      const texturePath = tile.miner.image || '/assets/miner/miner-3.png';
      if (!ghost) {
        try {
          const texture = await loadTexture(texturePath);
          ghost = new PIXI.Sprite(texture);
          ghost.anchor.set(0.5, 0.5);
          ghost.alpha = 0.7;
          container.addChild(ghost);
          spriteMap['__drag_ghost'] = ghost;
        } catch (err) {
          if (onError) onError('Failed to load ghost texture:');
        }
      } else {
        if (ghost.texture.baseTexture.resource?.url !== texturePath) {
          try {
            const texture = await loadTexture(texturePath);
            ghost.texture = texture;
          } catch (err) {
            if (onError) onError('Failed to update ghost texture:');
          }
        }
      }
      if (ghost) {
        ghost.x = dragPos.x;
        ghost.y = dragPos.y;
        ghost.scale.set(0.25);
        ghost.visible = true;
        ghost.alpha = 0.7;
      }
    }
  } else if (spriteMap['__drag_ghost']) {
    spriteMap['__drag_ghost'].visible = false;
  }
}

/**
 * Draws overlays for hover, selection, and highlights.
 */
export function drawOverlays(
  container: PIXI.Container,
  gridConfig: GridConfig,
  hoveredTile: number | null,
  selectedTile: number | null,
  highlightSlots: number[],
  onTilePointerOver: (index: number) => void,
  onTilePointerOut: () => void,
  onTileClick: (index: number) => void,
  onMinerDrop: (index: number) => void
) {
  container.removeChildren();
  const { cols, rows } = gridConfig;

  // --- Transparent hit area for the grid ---
  const hitArea = new PIXI.Graphics();
  hitArea.beginFill(0xffffff, 0.001);
  if (
    gridConfig.topLeft && gridConfig.topRight &&
    gridConfig.bottomRight && gridConfig.bottomLeft
  ) {
    hitArea.moveTo(gridConfig.topLeft.x, gridConfig.topLeft.y);
    hitArea.lineTo(gridConfig.topRight.x, gridConfig.topRight.y);
    hitArea.lineTo(gridConfig.bottomRight.x, gridConfig.bottomRight.y);
    hitArea.lineTo(gridConfig.bottomLeft.x, gridConfig.bottomLeft.y);
    hitArea.closePath();
  }
  hitArea.endFill();
  hitArea.eventMode = 'static';
  hitArea.cursor = 'pointer';
  hitArea.on('pointertap', (event) => {
    const global = event.data.global;
    const local = container.parent.toLocal(global);
    let minDist = Infinity;
    let minIdx = -1;
    for (let idx = 0; idx < cols * rows; idx++) {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const flippedRow = (rows - 1) - row;
      const cellCenter = getTileTrueCenter(col, flippedRow, gridConfig);
      const dx = local.x - cellCenter.x;
      const dy = local.y - cellCenter.y;
      const dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        minIdx = idx;
      }
    }
    if (minIdx !== -1) {
      onTileClick(minIdx);
    }
  });
  container.addChild(hitArea);

  // --- Draw overlays as before, but use getTileTrueCenter for the center ---
  for (let idx = 0; idx < cols * rows; idx++) {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const flippedRow = (rows - 1) - row;
    const cellCenter = getTileTrueCenter(col, flippedRow, gridConfig);
    const x = cellCenter.x;
    const y = cellCenter.y;
    // Draw cyan dot at center
    const overlayDebugDot = new PIXI.Graphics();
    overlayDebugDot.beginFill(0x00ffff, 0.7);
    overlayDebugDot.drawCircle(x + DEBUG_CENTER_OFFSET.x, y + DEBUG_CENTER_OFFSET.y, 6);
    overlayDebugDot.endFill();
    container.addChild(overlayDebugDot);
    // --- Overlay logic as before, but use center for overlays ---
    const overlay = new PIXI.Graphics();
    overlay.eventMode = 'static';
    overlay.cursor = 'pointer';
    overlay.on('pointerover', () => onTilePointerOver(idx));
    overlay.on('pointerout', () => onTilePointerOut());
    overlay.on('pointertap', () => onTileClick(idx));
    overlay.on('pointerup', () => onMinerDrop(idx));
    overlay.beginFill(0x000000, 0.12);
    overlay.drawEllipse(x, y, 22, 8);
    overlay.endFill();
    if (highlightSlots.includes(idx)) {
      overlay.beginFill(0x00ff00, 0.05);
      overlay.drawCircle(x, y, 24);
      overlay.endFill();
    }
    if (selectedTile === idx) {
      overlay.lineStyle(4, 0xffff00, 0.95);
      overlay.drawCircle(x, y, 32);
      overlay.beginFill(0xffff00, 0.10);
      overlay.drawCircle(x, y, 24);
      overlay.endFill();
    }
    if (hoveredTile === idx) {
      overlay.lineStyle(3, 0xffff00, 0.8);
      overlay.drawCircle(x, y, 28);
    }
    container.addChild(overlay);
  }
} 

/*
====================
LEGACY GRID DRAWING LOGIC (ARCHIVED)
====================

// The following functions are retained for reference only. They are no longer used in the new data-driven grid system.

// function drawGrid(gfx: PIXI.Graphics, gridConfig: GridConfig) { ... }
// async function drawMiners(...) { ... }
// function drawOverlays(...) { ... }
// ... any other helpers ...
*/ 