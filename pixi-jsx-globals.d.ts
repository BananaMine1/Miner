import { Sprite as PixiSprite, Container as PixiContainer } from 'pixi.js';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      sprite: Partial<PixiSprite> & React.DOMAttributes<any>;
      container: Partial<PixiContainer> & React.DOMAttributes<any>;
    }
  }
} 