import { Howl, Howler } from 'howler';

export const sfx = {
  click: new Howl({ src: ['/assets/audio/click.mp3'], volume: 0.5 }),
  claim: new Howl({ src: ['/assets/audio/claim.mp3'], volume: 0.7 }),
  upgrade: new Howl({ src: ['/assets/audio/upgrade.mp3'], volume: 0.7 }),
  error: new Howl({ src: ['/assets/audio/error.mp3'], volume: 0.7 }),
  // Add more SFX as needed
};

export const music = new Howl({
  src: ['/assets/audio/bg-music.mp3'],
  loop: true,
  volume: 0.3,
});

export function playSFX(name: keyof typeof sfx) {
  sfx[name]?.play();
}

export function playMusic() {
  if (!music.playing()) music.play();
}

export function stopMusic() {
  music.stop();
}

export function setMusicVolume(vol: number) {
  music.volume(vol);
} 