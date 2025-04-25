// ARCHIVED: This file is deprecated. Use the modular version in components/GameRoomCanvas/ instead.
// This file is retained for reference only and should not be imported in production code.
// Original GameRoomCanvas implementation below.
// @ts-nocheck
// components/GameRoomCanvas.tsx
import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

export interface GridConfig {
  cellSize: number;
  rows: number;
  cols: number;
}

interface GridTile {
  index: number;
  miner?: any;
  locked?: boolean;
  status?: any;
}

interface GameRoomCanvasProps {
  gridConfig: GridConfig;
  grid: GridTile[];
  hoveredTile: number | null;
  selectedTile: number | null;
  highlightSlots: number[];
  onTilePointerOver: (index: number) => void;
  onTilePointerOut: () => void;
  onTileClick: (index: number) => void;
  onMinerDragStart: (index: number) => void;
  onMinerDrop: (index: number) => void;
  draggedMiner?: number | null;
  dragPos?: {x: number, y: number} | null;
}

export default function GameRoomCanvas({
  gridConfig,
  grid,
  hoveredTile,
  selectedTile,
  highlightSlots,
  onTilePointerOver,
  onTilePointerOut,
  onTileClick,
  onMinerDragStart,
  onMinerDrop,
  draggedMiner,
  dragPos,
}: GameRoomCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const minerSpritesRef = useRef<Record<number, PIXI.Sprite>>({});
  const tileOverlaysRef = useRef<PIXI.Graphics[]>([]);
  const overlayLayerRef = useRef<PIXI.Container | null>(null);
  const minerLayerRef = useRef<PIXI.Container | null>(null);
  const gridGfxRef = useRef<PIXI.Graphics | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Initialize Pixi app and containers ONCE
  useEffect(() => {
    let app: PIXI.Application | null = null;
    let bgTexture: PIXI.Texture | null = null;
    let bgSprite: PIXI.Sprite | null = null;
    let minerPaths: string[] = [];
    const initializePixi = async () => {
      const container = containerRef.current;
      if (!container) return;
      if (container.clientWidth === 0 || container.clientHeight === 0) return;
      try {
        app = new PIXI.Application();
        await app.init({
          width: container.clientWidth,
          height: container.clientHeight,
          backgroundAlpha: 0,
          antialias: true,
        });
        if (!app || !app.canvas) throw new Error('Pixi Application initialization failed - no canvas.');
        appRef.current = app;
        container.appendChild(app.canvas);

        // Load background image only if not cached
        const bgImage = '/assets/rooms/shack.jpg';
        if (!PIXI.Assets.cache.has(bgImage)) {
          await PIXI.Assets.load(bgImage);
        }
        bgTexture = PIXI.Texture.from(bgImage);
        bgSprite = new PIXI.Sprite(bgTexture);
        app.stage.addChildAt(bgSprite, 0);

        // --- Use Containers for Layering ---
        const mainLayerContainer = new PIXI.Container();
        app.stage.addChild(mainLayerContainer);

        // Grid graphics (add to main layer container)
        const gridGfx = new PIXI.Graphics();
        mainLayerContainer.addChild(gridGfx);
        gridGfxRef.current = gridGfx;

        // Overlay and miner layers
        const overlayLayer = new PIXI.Container();
        const minerLayer = new PIXI.Container();
        mainLayerContainer.addChild(overlayLayer);
        mainLayerContainer.addChild(minerLayer);
        overlayLayerRef.current = overlayLayer;
        minerLayerRef.current = minerLayer;

        // Tile hit areas and overlays
        const tileOverlays: PIXI.Graphics[] = [];
        const { cols, rows } = gridConfig;
        for (let i = 0; i < rows * cols; i++) {
          const overlay = new PIXI.Graphics();
          overlay.eventMode = 'static';
          overlay.cursor = 'pointer';
          overlay.on('pointerover', () => onTilePointerOver(i));
          overlay.on('pointerout', () => onTilePointerOut());
          overlay.on('pointertap', () => onTileClick(i));
          overlay.on('pointerup', () => onMinerDrop(i));
          overlayLayer.addChild(overlay);
          tileOverlays.push(overlay);
        }
        tileOverlaysRef.current = tileOverlays;

        // Map for miner sprites
        const minerSprites: Record<number, PIXI.Sprite> = {};
        minerSpritesRef.current = minerSprites;

        // Precompute miner image paths for asset management
        minerPaths = [];
        for (const tile of grid) {
          if (tile.miner && tile.miner.image) {
            if (!minerPaths.includes(tile.miner.image)) minerPaths.push(tile.miner.image);
          }
        }
        // Load miner images only if not cached
        for (const path of minerPaths) {
          if (!PIXI.Assets.cache.has(path)) {
            await PIXI.Assets.load(path);
          }
        }

        // Ticker loop function
        const ticker = () => {
          if (!app || !app.screen) return;
          const { width, height } = app.screen;

          // Scale and center background
          const scale = Math.max(width / bgTexture.width, height / bgTexture.height);
          bgSprite.width = bgTexture.width * scale;
          bgSprite.height = bgTexture.height * scale;
          bgSprite.x = (width - bgSprite.width) / 2;
          bgSprite.y = (height - bgSprite.height) / 2;

          // Calculate offset for grid alignment
          const offsetX = bgSprite.x;
          const offsetY = bgSprite.y;
          const scaleX = bgSprite.width / bgTexture.width;
          const scaleY = bgSprite.height / bgTexture.height;

          // Floor corners in original image
          const topLeft = { x: 408, y: 600 };
          const bottomLeft = { x: 555, y: 675 };
          const topRight = { x: 735, y: 478 };
          const bottomRight = { x: 879, y: 548 };

          // Transform corners to screen space
          const tTopLeft = { x: topLeft.x * scaleX + offsetX, y: topLeft.y * scaleY + offsetY };
          const tBottomLeft = { x: bottomLeft.x * scaleX + offsetX, y: bottomLeft.y * scaleY + offsetY };
          const tTopRight = { x: topRight.x * scaleX + offsetX, y: topRight.y * scaleY + offsetY };
          const tBottomRight = { x: bottomRight.x * scaleX + offsetX, y: bottomRight.y * scaleY + offsetY };

          // Draw grid (floor-aligned)
          gridGfx.clear();
          gridGfx.setStrokeStyle({ width: 2, color: 0xffffff, alpha: 0.8 });
          for (let i = 0; i <= cols; i++) {
            const t = i / cols;
            const x0 = (1 - t) * tTopLeft.x + t * tTopRight.x;
            const y0 = (1 - t) * tTopLeft.y + t * tTopRight.y;
            const x1 = (1 - t) * tBottomLeft.x + t * tBottomRight.x;
            const y1 = (1 - t) * tBottomLeft.y + t * tBottomRight.y;
            gridGfx.moveTo(x0, y0);
            gridGfx.lineTo(x1, y1);
          }
          for (let j = 0; j <= rows; j++) {
            const t = j / rows;
            const x0 = (1 - t) * tTopLeft.x + t * tBottomLeft.x;
            const y0 = (1 - t) * tTopLeft.y + t * tBottomLeft.y;
            const x1 = (1 - t) * tTopRight.x + t * tBottomRight.x;
            const y1 = (1 - t) * tTopRight.y + t * tBottomRight.y;
            gridGfx.moveTo(x0, y0);
            gridGfx.lineTo(x1, y1);
          }
          gridGfx.stroke();

          // Draw tile overlays (hover, highlight, selection)
          for (let idx = 0; idx < tileOverlays.length; idx++) {
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            const s = col / cols;
            const t = row / rows;
            const x = (1 - s) * ((1 - t) * tTopLeft.x + t * tBottomLeft.x) + s * ((1 - t) * tTopRight.x + t * tBottomRight.x);
            const y = (1 - s) * ((1 - t) * tTopLeft.y + t * tBottomLeft.y) + s * ((1 - t) * tTopRight.y + t * tBottomRight.y);
            const overlay = tileOverlays[idx];
            overlay.clear();
            // Compute the four corners of the grid cell (as a quadrilateral)
            // For a 2D grid, interpolate the four corners for each cell
            let cellQuad = null;
            if (col < cols && row < rows) {
              // Top-left
              const s0 = col / cols, t0 = row / rows;
              const s1 = (col + 1) / cols, t1 = (row + 1) / rows;
              const p00 = {
                x: (1 - s0) * ((1 - t0) * tTopLeft.x + t0 * tBottomLeft.x) + s0 * ((1 - t0) * tTopRight.x + t0 * tBottomRight.x),
                y: (1 - s0) * ((1 - t0) * tTopLeft.y + t0 * tBottomLeft.y) + s0 * ((1 - t0) * tTopRight.y + t0 * tBottomRight.y),
              };
              // Top-right
              const p10 = {
                x: (1 - s1) * ((1 - t0) * tTopLeft.x + t0 * tBottomLeft.x) + s1 * ((1 - t0) * tTopRight.x + t0 * tBottomRight.x),
                y: (1 - s1) * ((1 - t0) * tTopLeft.y + t0 * tBottomLeft.y) + s1 * ((1 - t0) * tTopRight.y + t0 * tBottomRight.y),
              };
              // Bottom-right
              const p11 = {
                x: (1 - s1) * ((1 - t1) * tTopLeft.x + t1 * tBottomLeft.x) + s1 * ((1 - t1) * tTopRight.x + t1 * tBottomRight.x),
                y: (1 - s1) * ((1 - t1) * tTopLeft.y + t1 * tBottomLeft.y) + s1 * ((1 - t1) * tTopRight.y + t1 * tBottomRight.y),
              };
              // Bottom-left
              const p01 = {
                x: (1 - s0) * ((1 - t1) * tTopLeft.x + t1 * tBottomLeft.x) + s0 * ((1 - t1) * tTopRight.x + t1 * tBottomRight.x),
                y: (1 - s0) * ((1 - t1) * tTopLeft.y + t1 * tBottomLeft.y) + s0 * ((1 - t1) * tTopRight.y + t1 * tBottomRight.y),
              };
              cellQuad = [p00, p10, p11, p01];
              // Compute bounding box for hitArea
              const minX = Math.min(p00.x, p10.x, p11.x, p01.x);
              const maxX = Math.max(p00.x, p10.x, p11.x, p01.x);
              const minY = Math.min(p00.y, p10.y, p11.y, p01.y);
              const maxY = Math.max(p00.y, p10.y, p11.y, p01.y);
              overlay.hitArea = new PIXI.Rectangle(minX, minY, maxX - minX, maxY - minY);
            }
            // Draw a faint ellipse shadow at each tile
            overlay.fill({ color: 0x000000, alpha: 0.12 });
            overlay.ellipse(x, y, 22, 8);
            // Draw a subtle green highlight for available slots
            if (highlightSlots.includes(idx)) {
              overlay.fill({ color: 0x00ff00, alpha: 0.05 });
              overlay.circle(x, y, 24);
            }
            // Selected tile: strong yellow highlight
            if (selectedTile === idx) {
              overlay.setStrokeStyle({ width: 4, color: 0xffff00, alpha: 0.95 });
              overlay.circle(x, y, 32);
              overlay.fill({ color: 0xffff00, alpha: 0.10 });
              overlay.circle(x, y, 24);
            }
            // Hovered tile: yellow highlight
            if (hoveredTile === idx) {
              overlay.setStrokeStyle({ width: 3, color: 0xffff00, alpha: 0.8 });
              overlay.circle(x, y, 28);
            }
            // On pointerup, handle miner drop
            overlay.removeAllListeners('pointerup');
            overlay.on('pointerup', () => onMinerDrop(idx));
            overlay.removeAllListeners('pointertap');
            overlay.on('pointertap', () => onTileClick(idx));
          }

          // Place miners using bilinear interpolation
          for (const tile of grid) {
            if (!tile.miner) continue;
            const idx = tile.index;
            if (draggedMiner === idx) continue; // Hide original while dragging
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            const s = col / cols;
            const t = row / rows;
            const x = (1 - s) * ((1 - t) * tTopLeft.x + t * tBottomLeft.x) + s * ((1 - t) * tTopRight.x + t * tBottomRight.x);
            const y = (1 - s) * ((1 - t) * tTopLeft.y + t * tBottomLeft.y) + s * ((1 - t) * tTopRight.y + t * tBottomRight.y);
            const path = tile.miner.image || '/assets/miner/miner-3.png';
            let sprite = minerSprites[idx];
            if (!sprite) {
              if (PIXI.Assets.cache.has(path)) {
                sprite = PIXI.Sprite.from(path);
                sprite.anchor.set(-.12, 0.65); // better alignment
                sprite.eventMode = 'static';
                sprite.cursor = 'pointer';
                // Set hitArea to cover the visible miner
                sprite.hitArea = new PIXI.Rectangle(
                  -sprite.width * sprite.anchor.x,
                  -sprite.height * sprite.anchor.y,
                  sprite.width,
                  sprite.height
                );
                // Only miner sprites start drag
                sprite.on('pointerdown', () => onMinerDragStart(idx));
                sprite.on('pointertap', () => onTileClick(idx)); // open modal on click
                minerLayer.addChild(sprite);
                minerSprites[idx] = sprite;
              }
            } else if (sprite.texture?.source) {
              const currentTexturePath = (sprite.texture.source as any).src;
              if (currentTexturePath !== path) {
                sprite.texture = PIXI.Texture.from(path);
              }
            }
            if (sprite) {
              sprite.x = x;
              sprite.y = y;
              sprite.scale.set(0.25); // smaller miners
              sprite.visible = true;
            }
          }
          // Drag-follow ghost miner
          if (draggedMiner !== null && dragPos) {
            const tile = grid[draggedMiner];
            if (tile && tile.miner) {
              const path = tile.miner.image || '/assets/miner/miner-3.png';
              let ghost = minerSprites['__drag_ghost'];
              if (!ghost) {
                if (PIXI.Assets.cache.has(path)) {
                  ghost = PIXI.Sprite.from(path);
                  ghost.anchor.set(-.12, 0.65);
                  ghost.alpha = 0.7;
                  minerLayer.addChild(ghost);
                  minerSprites['__drag_ghost'] = ghost;
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
          } else if (minerSprites['__drag_ghost']) {
            minerSprites['__drag_ghost'].visible = false;
          }
        };
        app.ticker.add(ticker);

        // --- Resize Handling ---
        const observer = new ResizeObserver(entries => {
          const entry = entries[0];
          const { width, height } = entry.contentRect;
          if (appRef.current && appRef.current.renderer) {
            appRef.current.renderer.resize(width, height);
          }
        });
        observer.observe(container);
        resizeObserverRef.current = observer;
      } catch (error) {
        if (app) {
          app.destroy(true, { children: true });
          app = null;
          appRef.current = null;
        }
      }
    };
    if (appRef.current) return;
    initializePixi();
    return () => {
      // Unload assets before destroying the app
      const bgImage = '/assets/rooms/shack.jpg';
      PIXI.Assets.unload(bgImage);
      if (minerPaths) {
        for (const path of minerPaths) {
          PIXI.Assets.unload(path);
        }
      }
      if (resizeObserverRef.current && containerRef.current) {
        resizeObserverRef.current.unobserve(containerRef.current);
      }
      resizeObserverRef.current = null;
      const currentApp = appRef.current;
      if (currentApp) {
        if (containerRef.current && containerRef.current.contains(currentApp.canvas)) {
          containerRef.current.removeChild(currentApp.canvas);
        }
        currentApp.destroy(true, { children: true, texture: true });
        appRef.current = null;
      }
    };
  }, [gridConfig]);

  // Update overlays and miner sprites on grid change
  useEffect(() => {
    const minerSprites = minerSpritesRef.current;
    const tileOverlays = tileOverlaysRef.current;
    const minerLayer = minerLayerRef.current;
    const overlayLayer = overlayLayerRef.current;
    const gridGfx = gridGfxRef.current;
    if (!minerLayer || !overlayLayer || !gridGfx) return;
    const { cols, rows } = gridConfig;

    // Update overlays (highlights, selection, hover)
    for (let idx = 0; idx < tileOverlays.length; idx++) {
      const overlay = tileOverlays[idx];
      overlay.clear();
      // ... (copy overlay drawing logic from ticker) ...
    }

    // Update miner sprites
    // Remove all sprites from minerLayer
    minerLayer.removeChildren();
    for (const tile of grid) {
      let sprite = minerSprites[tile.index];
      if (tile.miner) {
        if (!sprite) {
          const path = tile.miner.image || '/assets/miner/miner-3.png';
          sprite = PIXI.Sprite.from(path);
          sprite.anchor.set(-.12, 0.65);
          sprite.eventMode = 'static';
          sprite.cursor = 'pointer';
          sprite.hitArea = new PIXI.Rectangle(
            -sprite.width * sprite.anchor.x,
            -sprite.height * sprite.anchor.y,
            sprite.width,
            sprite.height
          );
          sprite.on('pointerdown', () => onMinerDragStart(tile.index));
          sprite.on('pointertap', () => onTileClick(tile.index));
          minerSprites[tile.index] = sprite;
        }
        // Update position
        const tTopLeft = { x: 408, y: 600 };
        const tBottomLeft = { x: 555, y: 675 };
        const tTopRight = { x: 735, y: 478 };
        const tBottomRight = { x: 879, y: 548 };
        const s = tile.index % cols / cols;
        const t = Math.floor(tile.index / cols) / rows;
        const x = (1 - s) * ((1 - t) * tTopLeft.x + t * tBottomLeft.x) + s * ((1 - t) * tTopRight.x + t * tBottomRight.x);
        const y = (1 - s) * ((1 - t) * tTopLeft.y + t * tBottomLeft.y) + s * ((1 - t) * tTopRight.y + t * tBottomRight.y);
        sprite.x = x;
        sprite.y = y;
        sprite.scale.set(0.25);
        sprite.visible = true;
        minerLayer.addChild(sprite);
      } else if (sprite) {
        sprite.visible = false;
      }
    }
  }, [grid, gridConfig, hoveredTile, selectedTile, highlightSlots]);

  return (
    <div
      ref={containerRef}
      className={"pixiLayer"}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'auto',
      }}
    />
  );
}
