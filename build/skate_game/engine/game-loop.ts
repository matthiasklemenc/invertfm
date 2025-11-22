// game-loop.ts
// Core game loop with delta-time normalization (60 FPS reference)

export interface GameLoopCallbacks {
  update: (delta: number) => void;
  render: () => void;
}

export class GameLoop {
  private lastTime = 0;
  private requestId: number | null = null;
  private running = false;

  constructor(private callbacks: GameLoopCallbacks) {}

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop() {
    this.running = false;
    if (this.requestId !== null) {
      cancelAnimationFrame(this.requestId);
      this.requestId = null;
    }
  }

  private loop = (time: number) => {
    if (!this.running) return;

    const delta = (time - this.lastTime) / 16.6667; // Normalize to 60 FPS
    this.lastTime = time;

    this.callbacks.update(delta);
    this.callbacks.render();

    this.requestId = requestAnimationFrame(this.loop);
  };
}
