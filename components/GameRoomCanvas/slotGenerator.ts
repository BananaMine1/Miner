import { GridConfig, Slot } from './types';

// Helper for vector math
function add(a: {x: number, y: number, z?: number}, b: {x: number, y: number, z?: number}) {
  return { x: a.x + b.x, y: a.y + b.y, z: (a.z || 0) + (b.z || 0) };
}
function scale(v: {x: number, y: number, z?: number}, s: number) {
  return { x: v.x * s, y: v.y * s, z: (v.z || 0) * s };
}

// Projects a world position to screen space using a projection function
// (You should pass your camera.project or similar function)
export function generateSlots({ cols, rows }: GridConfig, origin: {x: number, y: number, z?: number}, rightVec: {x: number, y: number, z?: number}, upVec: {x: number, y: number, z?: number}, project: (pos: {x: number, y: number, z?: number}) => {x: number, y: number}): Slot[] {
  const slots: Slot[] = [];
  for (let y = 0; y < rows; ++y) {
    for (let x = 0; x < cols; ++x) {
      // Center of tile in world space
      const worldPos = add(add(origin, scale(rightVec, x + 0.5)), scale(upVec, y + 0.5));
      // 4 corners in world space
      const corners = [
        add(add(origin, scale(rightVec, x)), scale(upVec, y)),
        add(add(origin, scale(rightVec, x+1)), scale(upVec, y)),
        add(add(origin, scale(rightVec, x+1)), scale(upVec, y+1)),
        add(add(origin, scale(rightVec, x)), scale(upVec, y+1)),
      ];
      // Project to screen space
      const screenPos = project(worldPos);
      const screenCorners = corners.map(project);
      slots.push({
        gridX: x,
        gridY: y,
        gridIndex: y * cols + x,
        worldPos,
        screenPos,
        corners,
        screenCorners,
        occupied: false,
      });
    }
  }
  return slots;
} 