import { useRef } from 'react';
import { Miner } from '../lib/types';

export function useDragGrid(
  miners: Miner[],
  setMiners: React.Dispatch<React.SetStateAction<Miner[]>>
) {
  const draggedPositionRef = useRef<number | null>(null);

  const onDragStart = (position: number) => {
    draggedPositionRef.current = position;
  };

  const onDrop = (targetPosition: number) => {
    const sourcePosition = draggedPositionRef.current;
    if (sourcePosition === null) return;

    setMiners(prev => {
      const updated = [...prev];
      const sourceIndex = updated.findIndex(m => m.position === sourcePosition);
      const targetIndex = updated.findIndex(m => m.position === targetPosition);

      if (sourceIndex === -1) return prev;

      if (targetIndex !== -1) {
        // Swap positions
        [updated[sourceIndex].position, updated[targetIndex].position] = [
          updated[targetIndex].position,
          updated[sourceIndex].position,
        ];
      } else {
        // Move to empty slot
        updated[sourceIndex].position = targetPosition;
      }

      return updated;
    });

    draggedPositionRef.current = null;
  };

  return { onDragStart, onDrop };
}
