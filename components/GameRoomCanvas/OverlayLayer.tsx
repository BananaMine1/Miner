import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { Slot } from './types';

interface OverlayLayerProps {
  gameLayer: PIXI.Container | null;
  slots: Slot[];
  onSlotPointerOver: (slot: Slot) => void;
  onSlotPointerOut: () => void;
  onSlotClick: (slot: Slot) => void;
  highlightSlots?: number[];
  selectedSlot?: Slot | null;
  hoveredSlot?: Slot | null;
}

const OverlayLayer: React.FC<OverlayLayerProps> = ({
  gameLayer,
  slots,
  onSlotPointerOver,
  onSlotPointerOut,
  onSlotClick,
  highlightSlots = [],
  selectedSlot,
  hoveredSlot,
}) => {
  const overlayContainerRef = useRef<PIXI.Container | null>(null);

  useEffect(() => {
    if (!gameLayer) return;
    // Remove previous overlay container if any
    if (overlayContainerRef.current) {
      gameLayer.removeChild(overlayContainerRef.current);
      overlayContainerRef.current.destroy({ children: true });
    }
    const overlayContainer = new PIXI.Container();
    overlayContainerRef.current = overlayContainer;
    gameLayer.addChild(overlayContainer);

    // Draw grid overlays (lines between corners)
    const gridGfx = new PIXI.Graphics();
    overlayContainer.addChild(gridGfx);
    gridGfx.setStrokeStyle({ width: 2, color: 0xffffff, alpha: 0.5 });
    slots.forEach(slot => {
      const corners = slot.screenCorners;
      if (corners.length === 4) {
        gridGfx.moveTo(corners[0].x, corners[0].y);
        for (let i = 1; i < 4; i++) {
          gridGfx.lineTo(corners[i].x, corners[i].y);
        }
        gridGfx.lineTo(corners[0].x, corners[0].y); // close quad
      }
    });

    // Draw hit-zones and overlays
    slots.forEach((slot, idx) => {
      // Create a polygon from the 4 corners
      const points = slot.screenCorners.flatMap(corner => [corner.x, corner.y]);
      const hitPolygon = new PIXI.Polygon(points);

      // Transparent hit-zone using the polygon
      const hitZone = new PIXI.Graphics();
      hitZone.fill({ color: 0xffffff, alpha: 0.001 });
      hitZone.poly(points);
      hitZone.hitArea = hitPolygon;
      hitZone.eventMode = 'static';
      hitZone.cursor = 'pointer';
      hitZone.on('pointerover', () => onSlotPointerOver(slot));
      hitZone.on('pointerout', () => onSlotPointerOut());
      hitZone.on('pointertap', () => onSlotClick(slot));
      overlayContainer.addChild(hitZone);

      // Overlay highlight/selection/hover
      if (highlightSlots.includes(idx)) {
        const highlight = new PIXI.Graphics();
        highlight.fill({ color: 0x00ff00, alpha: 0.05 });
        highlight.circle(slot.screenPos.x, slot.screenPos.y, 24);
        overlayContainer.addChild(highlight);
      }
      if (selectedSlot && selectedSlot.gridX === slot.gridX && selectedSlot.gridY === slot.gridY) {
        const selected = new PIXI.Graphics();
        selected.setStrokeStyle({ width: 4, color: 0xffff00, alpha: 0.95 });
        selected.circle(slot.screenPos.x, slot.screenPos.y, 32);
        selected.fill({ color: 0xffff00, alpha: 0.10 });
        selected.circle(slot.screenPos.x, slot.screenPos.y, 24);
        overlayContainer.addChild(selected);
      }
      if (hoveredSlot && hoveredSlot.gridX === slot.gridX && hoveredSlot.gridY === slot.gridY) {
        const hovered = new PIXI.Graphics();
        hovered.setStrokeStyle({ width: 3, color: 0xffff00, alpha: 0.8 });
        hovered.circle(slot.screenPos.x, slot.screenPos.y, 28);
        overlayContainer.addChild(hovered);
      }
    });

    return () => {
      if (overlayContainerRef.current) {
        gameLayer.removeChild(overlayContainerRef.current);
        overlayContainerRef.current.destroy({ children: true });
        overlayContainerRef.current = null;
      }
    };
  }, [gameLayer, slots, highlightSlots, selectedSlot, hoveredSlot, onSlotPointerOver, onSlotPointerOut, onSlotClick]);

  return null;
};

export default OverlayLayer; 