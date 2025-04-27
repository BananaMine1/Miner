import { Sprite as PixiSprite, Container as PixiContainer, TilingSprite as PixiTilingSprite } from 'pixi.js';
import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      sprite: Partial<PixiSprite> & React.DOMAttributes<any>;
      container: Partial<PixiContainer> & React.DOMAttributes<any>;
      tilingsprite: Partial<PixiTilingSprite> & React.DOMAttributes<any>;
      // Add more PixiJS elements as needed
    }
  }
} 