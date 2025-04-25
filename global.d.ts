/* global.d.ts – root of project, already in tsconfig.include */

import * as React from 'react';
import { type PixiReactElementProps } from '@pixi/react'
import { type Container, type Sprite, Sprite as PixiSprite, Container as PixiContainer, TilingSprite as PixiTilingSprite } from 'pixi.js'

declare module '@pixi/react' {
  export const Container: any;
  export const Sprite: any;
  export function useTick(callback: (ticker: any) => void): void;
  interface PixiElements {
    pixiTilingSprite: {
      ref?: React.Ref<import('pixi.js').TilingSprite>;
      texture?: import('pixi.js').Texture;
      width?: number;
      height?: number;
      x?: number;
      y?: number;
      alpha?: number;
      children?: React.ReactNode;
    };
    pixiContainer3d: {
      isometric?: boolean;
      children?: React.ReactNode;
    };
    pixiCamera3d: {
      fieldOfView?: number;
      near?: number;
      far?: number;
      position?: [number, number, number];
      lookAt?: [number, number, number];
      children?: React.ReactNode;
    };
    pixiMesh3d: {
      geometry?: string;
      interactive?: boolean;
      pointerdown?: (e: any) => void;
      children?: React.ReactNode;
    };
    pixiTransform3d: {
      rotation?: [number, number, number];
      scale?: [number, number, number];
      children?: React.ReactNode;
    };
    pixiStandardMaterial: {
      baseColorTexture?: import('pixi.js').Texture;
      children?: React.ReactNode;
    };
    pixiSprite3d: {
      key?: React.Key;
      texture: import('pixi.js').Texture;
      billboardAxis?: import('pixi3d').SpriteBillboardType;
      position?: [number, number, number];
      iso?: { x: number; y: number; z: number };
      anchor?: [number, number];
      width?: number;
      height?: number;
      scale?: [number, number, number];
      interactive?: boolean;
      pointerdown?: (e: any) => void;
      children?: React.ReactNode;
    };
    pixiContainer: PixiReactElementProps<typeof Container>;
    pixiSprite: {
      /** Reference to the PixiJS Sprite instance */
      ref?: React.Ref<import('pixi.js').Sprite>;
      /** Texture to apply to the sprite */
      texture: import('pixi.js').Texture;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      eventMode?: string;
      pointertap?: (e: any) => void;
      children?: React.ReactNode;
    };
  }
}

declare module '@pixi/assets' {
  import type { Texture } from 'pixi.js';
  export const Assets: {
    load(file: string | string[]): Promise<Texture | Record<string, Texture>>;
    loadBundle(bundle: Record<string, string>): Promise<Record<string, Texture>>;
    cache: Map<string, Texture>;
  };
}

declare module '@pixi/filter-color-matrix' {
  import type { Filter } from 'pixi.js';
  export class ColorMatrixFilter extends Filter {
    constructor();
    desaturate(): this;
  }
}

declare module '@pixi/react/jsx-runtime' {
  export * from '@pixi/react';
}

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

export {};
