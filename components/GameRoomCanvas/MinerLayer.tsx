import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { Slot, MinerLayerProps } from './types';
import { loadTexture, unloadTexture } from '../../lib/assetManager';

const MINER_OFFSET_X = 3; // Adjust as needed for perfect centering
const MINER_OFFSET_Y = 8; // Adjust as needed for perfect centering

const MinerLayer: React.FC<MinerLayerProps> = ({
  gameLayer,
  slots,
  onMinerDragStart,
  onMinerClick,
  draggedMinerId,
  dragPos,
  isMobile = false,
  roomLevel = 0,
}) => {
  const minerContainerRef = useRef<PIXI.Container | null>(null);

  useEffect(() => {
    if (!gameLayer) return;
    // Remove previous miner container if any
    if (minerContainerRef.current) {
      gameLayer.removeChild(minerContainerRef.current);
      minerContainerRef.current.destroy({ children: true });
    }
    const minerContainer = new PIXI.Container();
    minerContainerRef.current = minerContainer;
    gameLayer.addChild(minerContainer);

    // Track loaded miner textures for cleanup
    const loadedMinerTextures = new Set<string>();

    // For each occupied slot, spawn a miner sprite at slot.screenPos
    slots.forEach(slot => {
      if (!slot.occupied || !slot.minerId) return;
      if (draggedMinerId && slot.minerId === draggedMinerId) return; // Hide if being dragged
      // Use asset manager for miner texture
      const texturePath = (slot as any).miner?.image ? (slot as any).miner.image : '/assets/miner/miner-3.png';
      loadedMinerTextures.add(texturePath);
      loadTexture(texturePath).then(texture => {
        const sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5, 1); // base sits on slot
        sprite.x = slot.screenPos.x + MINER_OFFSET_X;
        sprite.y = slot.screenPos.y + MINER_OFFSET_Y;
        sprite.scale.set(isMobile && roomLevel === 0 ? 0.05 : 0.10);
        // Set hitArea to the tile polygon
        const points = slot.screenCorners.flatMap(corner => [corner.x, corner.y]);
        sprite.hitArea = new PIXI.Polygon(points);
        sprite.eventMode = 'static';
        sprite.cursor = 'pointer';
        sprite.on('pointerdown', () => onMinerDragStart(slot));
        sprite.on('pointertap', () => onMinerClick(slot)); // Triggers the same modal as tile click
        minerContainer.addChild(sprite);
      });
    });

    // If dragging, show ghost at dragPos
    if (draggedMinerId && dragPos) {
      const draggedSlot = slots.find(s => s.minerId === draggedMinerId);
      if (draggedSlot) {
        const texturePath = (draggedSlot as any).miner?.image ? (draggedSlot as any).miner.image : '/assets/miner/miner-3.png';
        loadedMinerTextures.add(texturePath);
        loadTexture(texturePath).then(texture => {
          const ghost = new PIXI.Sprite(texture);
          ghost.anchor.set(0.5, 1);
          ghost.x = dragPos.x + MINER_OFFSET_X;
          ghost.y = dragPos.y + MINER_OFFSET_Y;
          ghost.scale.set(isMobile && roomLevel === 0 ? 0.18 : 0.25);
          ghost.alpha = 0.7;
          minerContainer.addChild(ghost);
        });
      }
    }

    return () => {
      if (minerContainerRef.current) {
        gameLayer.removeChild(minerContainerRef.current);
        minerContainerRef.current.destroy({ children: true });
        minerContainerRef.current = null;
      }
      // Unload all miner textures used in this layer
      loadedMinerTextures.forEach(path => unloadTexture(path));
    };
  }, [gameLayer, slots, draggedMinerId, dragPos, onMinerDragStart, onMinerClick, isMobile, roomLevel]);

  return null;
};

export default MinerLayer; 