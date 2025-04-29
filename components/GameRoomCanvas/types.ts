import * as PIXI from 'pixi.js';

// Shared types for GameRoomCanvas and subcomponents

export interface GridCorner {
  x: number;
  y: number;
}

export interface GridConfig {
  cellSize: number;
  rows: number;
  cols: number;
  topLeft?: GridCorner;
  topRight?: GridCorner;
  bottomLeft?: GridCorner;
  bottomRight?: GridCorner;
}

export interface GridTile {
  index: number;
  miner?: any;
  locked?: boolean;
  status?: any;
}

export interface GameRoomCanvasProps {
  gridConfig: GridConfig;
  grid: GridTile[];
  hoveredTile: number | null;
  selectedTile: number | null;
  highlightSlots: number[];
  roomLevel: number;
  onTilePointerOver: (index: number) => void;
  onTilePointerOut: () => void;
  onTileClick: (index: number) => void;
  onMinerDragStart: (index: number) => void;
  onMinerDrop: (index: number) => void;
  draggedMiner?: string | null;
  dragPos?: {x: number, y: number} | null;
  gameLayerPosition?: { x: number; y: number };
  gameLayerScale?: { x: number; y: number };
}

export interface Slot {
  gridX: number; // 0-based col
  gridY: number; // 0-based row
  gridIndex: number; // unique index for the slot (row * cols + col)
  worldPos: { x: number; y: number; z?: number }; // center of tile in world space
  screenPos: { x: number; y: number }; // projected 2D screen position
  corners: { x: number; y: number; z?: number }[]; // 4 world-space corners
  screenCorners: { x: number; y: number }[]; // 4 projected corners
  occupied: boolean;
  minerId?: string;
}

export interface OverlayLayerProps {
  gameLayer: PIXI.Container | null;
  slots: Slot[];
  onSlotPointerOver: (slot: Slot) => void;
  onSlotPointerOut: () => void;
  onSlotClick: (slot: Slot) => void;
  highlightSlots?: number[];
  selectedSlot?: Slot | null;
  hoveredSlot?: Slot | null;
}

export interface MinerLayerProps {
  gameLayer: PIXI.Container | null;
  slots: Slot[];
  onMinerDragStart: (slot: Slot) => void;
  onMinerClick: (slot: Slot) => void;
  draggedMinerId?: string | null;
  dragPos?: { x: number; y: number } | null;
  isMobile?: boolean;
  roomLevel?: number;
} 