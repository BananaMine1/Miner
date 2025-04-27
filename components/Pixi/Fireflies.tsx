/// <reference path="../../types/pixi-react-jsx.d.ts" />
// components/Pixi/Fireflies.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useTick, extend } from '@pixi/react';
import { Texture, Ticker, Assets, Container as PixiContainer, Sprite as PixiSprite } from 'pixi.js';
import * as PIXI from 'pixi.js';

interface Props {
  count: number;
  dimensions: { w: number; h: number };
}

const SPEED = 60;
const STEER = 20;
const SIZE  = 12;

export default function Fireflies({ count, dimensions }: Props) {
  const { w, h } = dimensions;
  const [tex, setTex] = useState<Texture | null>(null);
  const sprites = useRef<any[]>([]);
  const data = useRef(
    Array.from({ length: count }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
    }))
  );

  // load texture or fallback
  useEffect(() => {
    Assets.load('/assets/firefly.png')
      .then((texture: Texture) => {
        setTex(texture);
      })
      .catch(() => {
        try {
          const c = document.createElement('canvas');
          c.width = c.height = 12;
          const ctx = c.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffff77';
            ctx.arc(6, 6, 6, 0, Math.PI * 2);
            ctx.fill();
            setTex(Texture.from(c));
          } else {
            throw new Error('Failed to get canvas context');
          }
        } catch (error) {
          console.error('Error creating fallback texture:', error);
        }
      });
  }, []);

  // wander + flicker
  useTick((t: Ticker) => {
    const dt = t.deltaMS / 1000;
    sprites.current.forEach((sp, i) => {
      if (!sp) return;
      const f = data.current[i];
      f.vx += (Math.random() - 0.5) * STEER * 3 * dt;
      f.vy += (Math.random() - 0.5) * STEER * 3 * dt;
      const s = Math.hypot(f.vx, f.vy);
      if (s > SPEED) {
        f.vx = (f.vx / s) * SPEED;
        f.vy = (f.vy / s) * SPEED;
      }
      f.x = (f.x + f.vx * dt + w) % w;
      f.y = (f.y + f.vy * dt + h) % h;
      sp.x = f.x;
      sp.y = f.y;
      sp.alpha = 0.3 + 0.7 * Math.abs(Math.sin(t.lastTime / 300 + i * Math.PI / 4));
    });
  });

  if (!tex) return null;

  return (
    <pixiContainer>
      {data.current.map((f, i) => (
        <pixiSprite
          ref={(el: any) => {
            if (el) {
              el.anchor?.set?.(0.5, 0.5);
              el.blendMode = 1 as any;
              sprites.current[i] = el;
            }
          }}
          texture={tex}
          x={f.x}
          y={f.y}
          width={SIZE}
          height={SIZE}
        />
      ))}
    </pixiContainer>
  );
}