// PlayerRenderer.ts
// =========================================================
// FINAL CLASS-BASED VERSION (RUN + PUSH ONLY)
// with CORRECT GitHub Pages sprite paths
// =========================================================

import { loadImage } from "../assetLoader";

// GitHub Pages base resolver
function sprite(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  return base + "skate_game/sprites/" + path;
}

// ----------------------------------------------
// TYPES
// ----------------------------------------------
export type PlayerSpriteSet = {
  run: HTMLImageElement[];
  push: HTMLImageElement[];
};

// ----------------------------------------------
// CONSTANTS
// ----------------------------------------------
const TARGET_HEIGHT = 120;
const RUN_FPS = 14;
const PUSH_FPS = 14;

// ----------------------------------------------
// CLASS
// ----------------------------------------------
export class PlayerRenderer {
  sprites: PlayerSpriteSet = {
    run: [],
    push: []
  };

  // Animation indices
  runIndex = 0;
  pushIndex = 0;

  // Timers
  runTimer = 0;
  pushTimer = 0;

  // Loaded?
  isLoaded = false;

  constructor() {
    this.loadAll();
  }

  // ----------------------------------------------
  // LOAD SPRITES (only RUN + PUSH)
  // ----------------------------------------------
  async loadAll() {
    const loadGroup = async (files: string[]) =>
      Promise.all(files.map(f => loadImage(sprite(f))));

    this.sprites.run = await loadGroup([
      "player_run_01.png",
      "player_run_02.png",
      "player_run_03.png",
      "player_run_04.png"
    ]);

    this.sprites.push = await loadGroup([
      "player_push_01.png",
      "player_push_02.png"
    ]);

    this.isLoaded = true;
  }

  // ----------------------------------------------
  // UPDATE
  // ----------------------------------------------
  update(
    player: {
      state: "run" | "push";
    },
    dt: number
  ) {
    if (!this.isLoaded) return;

    if (player.state === "push") {
      this.pushTimer += dt;
      if (this.pushTimer >= 1 / PUSH_FPS) {
        this.pushTimer = 0;
        this.pushIndex = (this.pushIndex + 1) % this.sprites.push.length;
      }
    } else {
      this.runTimer += dt;
      if (this.runTimer >= 1 / RUN_FPS) {
        this.runTimer = 0;
        this.runIndex = (this.runIndex + 1) % this.sprites.run.length;
      }
    }
  }

  // ----------------------------------------------
  // RENDER
  // ----------------------------------------------
  render(
    ctx: CanvasRenderingContext2D,
    player: {
      x: number;
      y: number;
      flipped: boolean;
      state: "run" | "push";
    }
  ) {
    if (!this.isLoaded) return;

    let img: HTMLImageElement;

    if (player.state === "push") {
      img = this.sprites.push[this.pushIndex];
    } else {
      img = this.sprites.run[this.runIndex];
    }

    this.drawFrame(ctx, img, player.x, player.y, player.flipped);
  }

  // ----------------------------------------------
  // DRAW FRAME
  // ----------------------------------------------
  private drawFrame(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    flipped: boolean
  ) {
    if (!img) return;

    const aspect = img.width / img.height;
    const targetWidth = TARGET_HEIGHT * aspect;

    ctx.save();

    if (flipped) {
      ctx.scale(-1, 1);
      ctx.drawImage(
        img,
        -x - targetWidth,
        y,
        targetWidth,
        TARGET_HEIGHT
      );
    } else {
      ctx.drawImage(img, x, y, targetWidth, TARGET_HEIGHT);
    }

    ctx.restore();
  }
}
