import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import GridLayer from './GridLayer';
import MinerLayer from './MinerLayer';
import OverlayLayer from './OverlayLayer';
import PixiBackgroundLayer from './PixiBackgroundLayer';
import { GameRoomCanvasProps, GridConfig } from './types';
import { useResponsiveGridConfig } from './useResponsiveGridConfig';
import { generateSlots } from './slotGenerator';
import { useIsMobile } from '../../hooks/useIsMobile';

const GameRoomCanvas: React.FC<GameRoomCanvasProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [app, setApp] = useState<PIXI.Application | null>(null);
  const [gameLayer, setGameLayer] = useState<PIXI.Container | null>(null);
  const tickerAddedRef = useRef(false);
  const fpsTextRef = useRef<PIXI.Text | null>(null);
  const [bgSprite, setBgSprite] = useState<PIXI.Sprite | null>(null);

  const isMobile = useIsMobile();

  // Responsive grid config
  const gridConfig = useResponsiveGridConfig(
    app,
    bgSprite,
    Number(props.roomLevel) || 0,
    isMobile ? 4 : props.gridConfig.rows,
    isMobile ? 4 : props.gridConfig.cols,
    isMobile ? 48 : props.gridConfig.cellSize
  );

  // Compute origin, rightVec, upVec from gridConfig corners
  const origin = useMemo(() => gridConfig.topLeft, [gridConfig]);
  const rightVec = useMemo(() =>
    (gridConfig.topLeft && gridConfig.topRight)
      ? {
          x: (gridConfig.topRight.x - gridConfig.topLeft.x) / gridConfig.cols,
          y: (gridConfig.topRight.y - gridConfig.topLeft.y) / gridConfig.cols,
        }
      : undefined,
    [gridConfig]
  );
  const upVec = useMemo(() =>
    (gridConfig.topLeft && gridConfig.bottomLeft)
      ? {
          x: (gridConfig.bottomLeft.x - gridConfig.topLeft.x) / gridConfig.rows,
          y: (gridConfig.bottomLeft.y - gridConfig.topLeft.y) / gridConfig.rows,
        }
      : undefined,
    [gridConfig]
  );
  const project = useCallback((pos) => ({ x: pos.x, y: pos.y }), []);

  // Generate slots for the current room config (only if all vectors are defined)
  const slots = useMemo(() => {
    if (!origin || !rightVec || !upVec) return [];
    const baseSlots = generateSlots(gridConfig, origin, rightVec, upVec, project);
    // Mark slots as occupied based on grid/miners
    props.grid.forEach(tile => {
      if (tile.miner) {
        const slot = baseSlots.find(s => s.gridIndex === tile.index);
        if (slot) {
          slot.occupied = true;
          slot.minerId = tile.miner.instanceId || tile.miner.id;
        }
      }
    });
    return baseSlots;
  }, [gridConfig, origin, rightVec, upVec, project, props.grid]);

  // Example handlers (replace with your actual logic)
  const handleSlotPointerOver = useCallback((slot: any) => {}, []);
  const handleSlotPointerOut = useCallback(() => {}, []);
  const handleSlotClick = useCallback((slot: any) => {
    if (props.onTileClick) props.onTileClick(slot.gridIndex);
  }, [props.onTileClick]);
  const handleMinerDragStart = useCallback((slot: any) => {}, []);
  const handleMinerClick = useCallback((slot: any) => {}, []);

  // Add ROOM_BACKGROUNDS array for use in fallback overlay
  const ROOM_BACKGROUNDS = [
    isMobile ? '/assets/rooms/shack-mobile.png' : '/assets/rooms/shack.jpg',
    isMobile ? '/assets/rooms/swamp_shed-mobile.png' : '/assets/rooms/swamp_shed.jpg',
    isMobile ? '/assets/rooms/jungle_garage-mobile.png' : '/assets/rooms/jungle_garage.jpg',
    isMobile ? '/assets/rooms/tech_lab-mobile.png' : '/assets/rooms/tech_lab.jpg',
  ];

  useEffect(() => {
    if (!containerRef.current) return;
    let pixiApp: PIXI.Application | null = new PIXI.Application();
    let destroyed = false;
    let _gameLayer: PIXI.Container | null = null;

    (async () => {
      await pixiApp.init({
        width: containerRef.current!.clientWidth,
        height: containerRef.current!.clientHeight,
        backgroundAlpha: 0,
        antialias: true,
      });
      if (destroyed) return;
      setApp(pixiApp);
      containerRef.current!.appendChild(pixiApp.canvas);

      // Create and add gameLayer
      _gameLayer = new PIXI.Container();
      _gameLayer.sortableChildren = true;
      pixiApp.stage.addChild(_gameLayer);
      setGameLayer(_gameLayer);

      // Add FPS overlay in development
      if (process.env.NODE_ENV === 'development') {
        const fpsText = new PIXI.Text('FPS: 0', {
          fontFamily: 'monospace',
          fontSize: 18,
          fill: 0xffffff,
          stroke: 0x000000,
          strokeThickness: 3 as any,
        } as any);
        fpsText.x = 8;
        fpsText.y = 8;
        pixiApp.stage.addChild(fpsText);
        fpsTextRef.current = fpsText;
      }
    })();

    return () => {
      destroyed = true;
      if (_gameLayer && pixiApp && pixiApp.stage.children.includes(_gameLayer)) {
        pixiApp.stage.removeChild(_gameLayer);
        _gameLayer.destroy({ children: true });
      }
      if (pixiApp) {
        try {
        pixiApp.destroy(true, { children: true, texture: true });
        } catch (e) {
          // Suppress PixiJS v8 _cancelResize error
        }
      }
      setApp(null);
      setGameLayer(null);
    };
  }, []);

  // Ensure ticker is only added once
  useEffect(() => {
    if (!app || tickerAddedRef.current) return;
    let lastTime = performance.now();
    let frames = 0;
    let fps = 0;
    const ticker = (ticker: PIXI.Ticker) => {
      const delta = ticker.deltaMS;
      // FPS overlay update
      if (process.env.NODE_ENV === 'development' && fpsTextRef.current) {
        frames++;
        const now = performance.now();
        if (now - lastTime > 500) {
          fps = Math.round((frames * 1000) / (now - lastTime));
          fpsTextRef.current.text = `FPS: ${fps}`;
          frames = 0;
          lastTime = now;
        }
      }
      // Add any global animation or update logic here if needed
    };
    if (app && app.ticker && typeof app.ticker.add === 'function') {
      app.ticker.add(ticker);
    }
    tickerAddedRef.current = true;
    return () => {
      if (app && app.ticker && typeof app.ticker.remove === 'function') {
        app.ticker.remove(ticker);
      }
      tickerAddedRef.current = false;
    };
  }, [app]);

  // Responsive resizing
  useEffect(() => {
    if (!app || !containerRef.current) return;
    const handleResize = () => {
      if (app && containerRef.current) {
        app.renderer.resize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (app) {
        try {
          app.destroy(true, { children: true, texture: true });
        } catch (e) {
          // Suppress PixiJS v8 _cancelResize error
        }
      }
    };
  }, [app]);

  // Set gameLayer position and scale from props
  useEffect(() => {
    if (!gameLayer || !gameLayer.position) return;
      if (props.gameLayerPosition) {
        gameLayer.position.set(props.gameLayerPosition.x, props.gameLayerPosition.y);
      } else {
        gameLayer.position.set(0, 0);
      }
      if (props.gameLayerScale) {
        gameLayer.scale.set(props.gameLayerScale.x, props.gameLayerScale.y);
      } else {
        gameLayer.scale.set(1, 1);
    }
  }, [gameLayer, props.gameLayerPosition, props.gameLayerScale]);

  if (!app || !gameLayer) {
    const bgUrl = ROOM_BACKGROUNDS[Number(props.roomLevel) || 0] || ROOM_BACKGROUNDS[0];
    return (
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    );
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <PixiBackgroundLayer app={app} roomLevel={Number(props.roomLevel) || 0} onSpriteReady={setBgSprite} />
      <GridLayer gameLayer={gameLayer} gridConfig={gridConfig} />
      <>
        {gameLayer && (
          <OverlayLayer
            gameLayer={gameLayer}
            slots={slots}
            onSlotPointerOver={handleSlotPointerOver}
            onSlotPointerOut={handleSlotPointerOut}
            onSlotClick={handleSlotClick}
          />
        )}
        {gameLayer && (
      <MinerLayer
        gameLayer={gameLayer}
            slots={slots}
            onMinerDragStart={handleMinerDragStart}
            onMinerClick={handleMinerClick}
          />
        )}
      </>
    </div>
  );
};

export default GameRoomCanvas; 