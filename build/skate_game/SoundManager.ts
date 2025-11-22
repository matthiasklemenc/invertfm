// SoundManager.ts
// Simple HTMLAudioElement-based sound system for the new modular engine

export class SoundManager {
  static music: HTMLAudioElement | null = null;
  static coin: HTMLAudioElement | null = null;
  static crash: HTMLAudioElement | null = null;

  static jump: HTMLAudioElement | null = null;
  static flip: HTMLAudioElement | null = null;
  static grind: HTMLAudioElement | null = null;

  static init() {
    // Initialize all sounds once
    if (!this.music) {
      this.music = new Audio("/sounds/music.mp3");
      this.music.loop = true;
      this.music.volume = 0.4;
    }

    if (!this.coin) this.coin = new Audio("/sounds/coin.wav");
    if (!this.crash) this.crash = new Audio("/sounds/crash.wav");

    if (!this.jump) this.jump = new Audio("/sounds/jump.wav");
    if (!this.flip) this.flip = new Audio("/sounds/flip.wav");
    if (!this.grind) this.grind = new Audio("/sounds/grind.wav");
  }

  static playMusic() {
    this.init();
    if (this.music) {
      this.music.currentTime = 0;
      this.music.play().catch(() => {});
    }
  }

  static pauseMusic() {
    if (this.music) this.music.pause();
  }

  static resumeMusic() {
    if (this.music) this.music.play().catch(() => {});
  }

  static stopAll() {
    if (this.music) this.music.pause();
  }

  static playCoin() {
    if (this.coin) {
      this.coin.currentTime = 0;
      this.coin.play();
    }
  }

  static playCrash() {
    if (this.crash) {
      this.crash.currentTime = 0;
      this.crash.play();
    }
  }

  static playJump() {
    if (this.jump) {
      this.jump.currentTime = 0;
      this.jump.play();
    }
  }

  static playFlip() {
    if (this.flip) {
      this.flip.currentTime = 0;
      this.flip.play();
    }
  }

  static playGrind() {
    if (this.grind) {
      this.grind.currentTime = 0;
      this.grind.play();
    }
  }

  static unlock() {
    // Required for mobile autoplay unlocking
    this.playJump();
    this.pauseMusic();
  }
}
