// SoundManager.ts
// Simple HTMLAudioElement-based sound system for the new modular engine

export class SoundManager {
  music: HTMLAudioElement;
  coin: HTMLAudioElement;
  crash: HTMLAudioElement;

  jump: HTMLAudioElement;
  flip: HTMLAudioElement;
  grind: HTMLAudioElement;

  constructor() {
    this.music = new Audio("/sounds/music.mp3");
    this.music.loop = true;
    this.music.volume = 0.4;

    this.coin = new Audio("/sounds/coin.wav");
    this.crash = new Audio("/sounds/crash.wav");

    this.jump = new Audio("/sounds/jump.wav");
    this.flip = new Audio("/sounds/flip.wav");
    this.grind = new Audio("/sounds/grind.wav");
  }

  playMusic() {
    this.music.currentTime = 0;
    this.music.play().catch(() => {});
  }

  stopMusic() {
    this.music.pause();
  }

  playCoin() {
    this.coin.currentTime = 0;
    this.coin.play();
  }

  playCrash() {
    this.crash.currentTime = 0;
    this.crash.play();
  }

  playJump() {
    this.jump.currentTime = 0;
    this.jump.play();
  }

  playFlip() {
    this.flip.currentTime = 0;
    this.flip.play();
  }

  playGrind() {
    this.grind.currentTime = 0;
    this.grind.play();
  }
}
