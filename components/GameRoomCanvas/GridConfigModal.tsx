import React, { useState, useRef } from 'react';
import { GridConfig, GridCorner } from './types';

interface GridConfigModalProps {
  open: boolean;
  onClose: () => void;
  gridConfig: GridConfig;
  onChange: (newConfig: GridConfig) => void;
}

const defaultCorners = {
  topLeft: { x: 100, y: 100 },
  topRight: { x: 700, y: 100 },
  bottomLeft: { x: 100, y: 500 },
  bottomRight: { x: 700, y: 500 },
};

const GridConfigModal: React.FC<GridConfigModalProps> = ({ open, onClose, gridConfig, onChange }) => {
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  // Local state for form
  const [form, setForm] = useState<GridConfig>({
    ...gridConfig,
    topLeft: { ...(gridConfig.topLeft ?? defaultCorners.topLeft) },
    topRight: { ...(gridConfig.topRight ?? defaultCorners.topRight) },
    bottomLeft: { ...(gridConfig.bottomLeft ?? defaultCorners.bottomLeft) },
    bottomRight: { ...(gridConfig.bottomRight ?? defaultCorners.bottomRight) },
  });

  // Sync form state with parent gridConfig when modal opens or gridConfig changes
  React.useEffect(() => {
    if (open) {
      setForm({
        ...gridConfig,
        topLeft: { ...(gridConfig.topLeft ?? defaultCorners.topLeft) },
        topRight: { ...(gridConfig.topRight ?? defaultCorners.topRight) },
        bottomLeft: { ...(gridConfig.bottomLeft ?? defaultCorners.bottomLeft) },
        bottomRight: { ...(gridConfig.bottomRight ?? defaultCorners.bottomRight) },
      });
    }
  }, [open, gridConfig]);

  // Drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    setDrag({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };
  const onMouseMove = (e: MouseEvent) => {
    if (drag) {
      setPos({ x: e.clientX - drag.x, y: e.clientY - drag.y });
    }
  };
  const onMouseUp = () => setDrag(null);
  React.useEffect(() => {
    if (drag) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
    }
  }, [drag]);

  // Form change handler
  const handleCornerChange = (corner: keyof typeof defaultCorners, axis: 'x' | 'y', value: number) => {
    const newCorner = { ...form[corner], [axis]: value };
    const newForm = { ...form, [corner]: newCorner };
    setForm(newForm);
    onChange(newForm);
  };
  const handleSizeChange = (field: 'rows' | 'cols', value: number) => {
    const newForm = { ...form, [field]: value };
    setForm(newForm);
    onChange(newForm);
  };

  if (!open) return null;

  return (
    <div
      ref={modalRef}
      style={{
        position: 'fixed',
        bottom: 24 + pos.y,
        right: 24 - pos.x,
        zIndex: 1000,
        background: 'rgba(30,30,30,0.98)',
        borderRadius: 12,
        boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
        padding: 24,
        minWidth: 320,
        color: 'white',
        cursor: drag ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onMouseDown={onMouseDown}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <strong>Grid Config</strong>
        <button onClick={onClose} style={{ color: 'white', background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
      </div>
      <button
        style={{ marginBottom: 12, background: '#333', color: 'white', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}
        onClick={() => {
          navigator.clipboard.writeText(JSON.stringify(form, null, 2));
        }}
      >Copy GridConfig to Clipboard</button>
      <div style={{ marginBottom: 12 }}>
        <label>Rows: <input type="number" min={1} max={20} value={form.rows} onChange={e => handleSizeChange('rows', Number(e.target.value))} style={{ width: 60 }} /></label>
        <label style={{ marginLeft: 16 }}>Cols: <input type="number" min={1} max={20} value={form.cols} onChange={e => handleSizeChange('cols', Number(e.target.value))} style={{ width: 60 }} /></label>
      </div>
      {(['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const).map(corner => (
        <div key={corner} style={{ marginBottom: 8 }}>
          <label style={{ width: 90, display: 'inline-block' }}>{corner}:</label>
          <input type="number" value={form[corner]?.x ?? 0} onChange={e => handleCornerChange(corner, 'x', Number(e.target.value))} style={{ width: 60, marginRight: 8 }} />
          <input type="number" value={form[corner]?.y ?? 0} onChange={e => handleCornerChange(corner, 'y', Number(e.target.value))} style={{ width: 60 }} />
        </div>
      ))}
    </div>
  );
};

export default GridConfigModal; 