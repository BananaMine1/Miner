/**
 * Asset Manager for PixiJS
 *
 * This module centralizes all asset loading, preloading, and unloading for PixiJS textures.
 * Always use loadTexture, preloadTextures, and unloadTexture from this module instead of
 * directly using PIXI.Assets.load or PIXI.Texture.from in your components.
 *
 * Benefits:
 * - Prevents duplicate loads and memory leaks
 * - Enables preloading for smoother gameplay
 * - Simplifies cache management and debugging
 *
 * Usage:
 *   import { loadTexture, preloadTextures, unloadTexture } from '../lib/assetManager';
 *
 *   // Load a texture (returns a Promise<Texture>)
 *   const texture = await loadTexture('/assets/miner/miner-3.png');
 *
 *   // Preload multiple textures
 *   await preloadTextures(['/assets/a.png', '/assets/b.png']);
 *
 *   // Unload a texture when no longer needed
 *   unloadTexture('/assets/miner/miner-3.png');
 */
import { Assets, Texture } from 'pixi.js';

// Singleton asset cache
const loadedAssets: Record<string, Texture> = {};

/**
 * Loads a texture, using cache if available.
 * @param path The asset path
 */
export async function loadTexture(path: string): Promise<Texture> {
  if (loadedAssets[path]) return loadedAssets[path];
  // Use PixiJS Assets.load, which returns a Texture
  const texture = await Assets.load<Texture>(path);
  loadedAssets[path] = texture;
  return texture;
}

/**
 * Preloads an array of textures.
 * @param paths Array of asset paths
 */
export function preloadTextures(paths: string[]): Promise<void[]> {
  return Promise.all(paths.map(loadTexture)).then(() => {});
}

/**
 * Unloads a texture from cache.
 * @param path The asset path
 */
export function unloadTexture(path: string) {
  if (loadedAssets[path]) {
    loadedAssets[path].destroy(true);
    delete loadedAssets[path];
    Assets.unload(path);
  }
} 