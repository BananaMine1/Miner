/// <reference path="../types/pixi-react-jsx.d.ts" />
// components/PixiLandingBackground.tsx
import React, { useEffect, useState } from 'react';
import { Application, extend } from '@pixi/react';
import { Texture, TilingSprite as PixiTilingSprite, Assets, Sprite as PixiSprite } from 'pixi.js';
import FogLayer from './Pixi/FogLayer';
import Fireflies from './Pixi/Fireflies';

// Restore isNight prop
interface Props {
  isNight: boolean;
}

// Restore isNight prop usage
export default function PixiLandingBackground({ isNight }: Props) {
  const [size, setSize] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 800,
    h: typeof window !== 'undefined' ? window.innerHeight : 600,
  }));
  const [bgTex, setBgTex] = useState<Texture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Responsive canvas size
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }
  }, []);

  // Restore conditional texture loading
  useEffect(() => {
    const url = isNight 
      ? '/assets/background-night.png'
      : '/assets/background.png';
      
    setLoading(true);
    setError(null);
    setBgTex(null); 
    console.log(`Loading background texture: ${url}`);

    Assets.load(url)
      .then((resolvedAsset: any) => {
        console.log('Assets.load resolved with:', resolvedAsset);
        let loadedTexture: Texture | null = null;
        // Duck Typing Check
        if (resolvedAsset?.source instanceof Object) {
          loadedTexture = resolvedAsset as Texture;
        } else if (typeof resolvedAsset === 'object' && resolvedAsset !== null) {
          if (resolvedAsset[url]?.source instanceof Object) {
            loadedTexture = resolvedAsset[url] as Texture;
          } else {
            const firstTextureLike = Object.values(resolvedAsset).find(
              (val: any) => val?.source instanceof Object
            );
            if (firstTextureLike) {
              loadedTexture = firstTextureLike as Texture;
            }
          }
        }
        if (loadedTexture) {
          console.log('Texture identified successfully using duck typing.');
          setBgTex(loadedTexture);
          setLoading(false);
        } else {
          throw new Error('Loaded asset could not be identified as a PIXI.Texture');
        }
      })
      .catch((err) => {
        console.error('Error during texture loading/processing:', url, err);
        setError(`Failed to load texture: ${err.message}`);
        setLoading(false);
      });
  // Restore isNight dependency
  }, [isNight]); 

  // Render logic
  if (loading) return <div className="fixed inset-0 bg-gray-800 flex items-center justify-center text-white">Loading Background...</div>;
  if (error) return <div className="fixed inset-0 bg-red-800 flex items-center justify-center text-white">Error loading background: {error}</div>;
  if (!bgTex) return <div className="fixed inset-0 bg-gray-800 flex items-center justify-center text-white">Preparing background...</div>;

  console.log('Rendering with bgTex:', bgTex);
  console.log('bgTex.source:', bgTex?.source);
  console.log('bgTex.source.alphaMode:', bgTex?.source?.alphaMode);

  // Debug: check if FogLayer and Fireflies are undefined
  console.log('FogLayer:', FogLayer);
  console.log('Fireflies:', Fireflies);

  console.log('Rendering PixiLandingBackground with effects conditionally');

  return (
    <Application
      width={size.w}
      height={size.h}
      backgroundAlpha={0} 
      antialias={true}
      preference="webgl"
      resolution={typeof window !== 'undefined' ? window.devicePixelRatio : 1}
      autoDensity={true}
      className="absolute inset-0 z-0 pointer-events-none"
    >
      <pixiContainer>
        <pixiSprite
          ref={el => {
            if (el) {
              el.anchor?.set?.(0, 0);
            }
          }}
          texture={bgTex}
          width={size.w}
          height={size.h}
        />
        {/* Conditionally render effects within the same Application */}
        {isNight && <FogLayer dimensions={size} />}
        {isNight && <Fireflies count={20} dimensions={size} />}
      </pixiContainer>
    </Application>
  );
} 