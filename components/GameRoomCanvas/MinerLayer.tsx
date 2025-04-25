import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { Slot, MinerLayerProps } from './types';

const MINER_OFFSET_X = -5; // Adjust as needed for perfect centering
const MINER_OFFSET_Y = 30; // Adjust as needed for perfect centering

const MinerLayer: React.FC<MinerLayerProps> = ({
  gameLayer,
  slots,
  onMinerDragStart,
  onMinerClick,
  draggedMinerId,
  dragPos,
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

    // For each occupied slot, spawn a miner sprite at slot.screenPos
    slots.forEach(slot => {
      if (!slot.occupied || !slot.minerId) return;
      if (draggedMinerId && slot.minerId === draggedMinerId) return; // Hide if being dragged
      // Use a placeholder texture or your asset manager
      const texture = PIXI.Texture.from('/assets/miner/miner-3.png');
      const sprite = new PIXI.Sprite(texture);
      sprite.anchor.set(0.5, 1); // base sits on slot
      sprite.x = slot.screenPos.x + MINER_OFFSET_X;
      sprite.y = slot.screenPos.y + MINER_OFFSET_Y;
      sprite.scale.set(0.25);
      // Set hitArea to the tile polygon
      const points = slot.screenCorners.flatMap(corner => [corner.x, corner.y]);
      sprite.hitArea = new PIXI.Polygon(points);
      sprite.eventMode = 'static';
      sprite.cursor = 'pointer';
      sprite.on('pointerdown', () => onMinerDragStart(slot));
      sprite.on('pointertap', () => onMinerClick(slot)); // Triggers the same modal as tile click
      minerContainer.addChild(sprite);
    });

    // If dragging, show ghost at dragPos
    if (draggedMinerId && dragPos) {
      const draggedSlot = slots.find(s => s.minerId === draggedMinerId);
      if (draggedSlot) {
        const texture = PIXI.Texture.from('/assets/miner/miner-3.png');
        const ghost = new PIXI.Sprite(texture);
        ghost.anchor.set(0.5, 1);
        ghost.x = dragPos.x + MINER_OFFSET_X;
        ghost.y = dragPos.y + MINER_OFFSET_Y;
        ghost.scale.set(0.25);
        ghost.alpha = 0.7;
        minerContainer.addChild(ghost);
      }
    }

    return () => {
      if (minerContainerRef.current) {
        gameLayer.removeChild(minerContainerRef.current);
        minerContainerRef.current.destroy({ children: true });
        minerContainerRef.current = null;
      }
    };
  }, [gameLayer, slots, draggedMinerId, dragPos, onMinerDragStart, onMinerClick]);

  return null;
};

export default MinerLayer; 