// SoundManager.ts
// Clean sound manager with modular triggers

export class SoundManager {
  music: HTMLAudioElement;
  jump: HTMLAudioElement;
  flip: HTMLAudioElement;
  coin: HTMLAudioElement;
  crash: HTMLAudioElement;
  grind: HTMLAudioElement;

  constructor() {
    this.music = new Audio("/sounds/music.mp3");
    this.jump = new Audio("/sounds/jump.wav");
    this.flip = new Audio("/sounds/flip.wav");
    this.coin = new Audio("/sounds/coin.wav");
    this.crash = new Audio("/sounds/crash.wav");
    this.grind = new Audio("/sounds/grind.wav");

    this.music.loop = true;
    this.music.volume = 0.4;
  }

  playMusic() {
    this.music.play().catch(() => {});
  }

  stopMusic() {
    this.music.pause();
  }

  playJump() {
    this.jump.currentTime = 0;
    this.jump.play();
  }

  playFlip() {
    this.flip.currentTime = 0;
    this.flip.play();
  }

  playCoin() {
    this.coin.currentTime = 0;
    this.coin.play();
  }

  playCrash() {
    this.crash.currentTime = 0;
    this.crash.play();
  }

  playGrind() {
    this.grind.currentTime = 0;
    this.grind.play();
  }
}
