// PlayerRenderer.ts
// =========================================================
// CLASS-BASED VERSION (OPTION A)
// Fully rewritten for new engine rendering system
// =========================================================

import { loadImage } from "../assetLoader";

// ----------------------------------------------
// TYPES
// ----------------------------------------------
export type PlayerSpriteSet = {
  run: HTMLImageElement[];
  push: HTMLImageElement[];
  fakie: HTMLImageElement[];
  ollie: HTMLImageElement[];
  grab: HTMLImageElement[];
};

// ----------------------------------------------
// CONSTANTS (same as old file)
// ----------------------------------------------
const TARGET_HEIGHT = 120;
const RUN_FPS = 14;
const PUSH_FPS = 14;
const FAKIE_FPS = 14;
const OLLIE_FPS = 14;
const GRAB_FPS = 14;

// ----------------------------------------------
// CLASS
// ----------------------------------------------
export class PlayerRenderer {
  sprites: PlayerSpriteSet;

  runIndex = 0;
  pushIndex = 0;
  fakieIndex = 0;
  ollieIndex = 0;
  grabIndex = 0;

  runTimer = 0;
  pushTimer = 0;
  fakieTimer = 0;
  ollieTimer = 0;
  grabTimer = 0;

  isLoaded = false;

  constructor(spritePaths: {
    run: string[];
    push: string[];
    fakie: string[];
    ollie: string[];
    grab: string[];
  }) {
    this.sprites = {
      run: [],
      push: [],
      fakie: [],
      ollie: [],
      grab: [],
    };

    this.loadAll(spritePaths);
  }

  // ----------------------------------------------
  // LOAD ALL SPRITES
  // ----------------------------------------------
  async loadAll(paths: {
    run: string[];
    push: string[];
    fakie: string[];
    ollie: string[];
    grab: string[];
  }) {
    const loadGroup = async (group: string[]) =>
      Promise.all(group.map((p) => loadImage(p)));

    this.sprites.run = await loadGroup(paths.run);
    this.sprites.push = await loadGroup(paths.push);
    this.sprites.fakie = await loadGroup(paths.fakie);
    this.sprites.ollie = await loadGroup(paths.ollie);
    this.sprites.grab = await loadGroup(paths.grab);

    this.isLoaded = true;
  }

  // ----------------------------------------------
  // UPDATE(player, dt)
  // ----------------------------------------------
  update(player, dt: number) {
    if (!this.isLoaded) return;

    // Animation timers
    this.runTimer += dt;
    this.pushTimer += dt;
    this.fakieTimer += dt;
    this.ollieTimer += dt;
    this.grabTimer += dt;

    // Update animation indices
    if (player.state === "run") {
      if (this.runTimer >= 1 / RUN_FPS) {
        this.runTimer = 0;
        this.runIndex =
          (this.runIndex + 1) % this.sprites.run.length;
      }
    }

    if (player.state === "push") {
      if (this.pushTimer >= 1 / PUSH_FPS) {
        this.pushTimer = 0;
        this.pushIndex =
          (this.pushIndex + 1) % this.sprites.push.length;
      }
    }

    if (player.state === "fakie") {
      if (this.fakieTimer >= 1 / FAKIE_FPS) {
        this.fakieTimer = 0;
        this.fakieIndex =
          (this.fakieIndex + 1) % this.sprites.fakie.length;
      }
    }

    if (player.state === "ollie") {
      if (this.ollieTimer >= 1 / OLLIE_FPS) {
        this.ollieTimer = 0;
        this.ollieIndex =
          (this.ollieIndex + 1) % this.sprites.ollie.length;
      }
    }

    if (player.state === "grab") {
      if (this.grabTimer >= 1 / GRAB_FPS) {
        this.grabTimer = 0;
        this.grabIndex =
          (this.grabIndex + 1) % this.sprites.grab.length;
      }
    }
  }

  // ----------------------------------------------
  // RENDER(ctx, player)
  // ----------------------------------------------
  render(
    ctx: CanvasRenderingContext2D,
    player: {
      x: number;
      y: number;
      flipped: boolean;
      state: string;
    }
  ) {
    if (!this.isLoaded) return;

    const { x, y, flipped, state } = player;

    let img: HTMLImageElement;

    switch (state) {
      case "push":
        img = this.sprites.push[this.pushIndex];
        break;
      case "fakie":
        img = this.sprites.fakie[this.fakieIndex];
        break;
      case "ollie":
        img = this.sprites.ollie[this.ollieIndex];
        break;
      case "grab":
        img = this.sprites.grab[this.grabIndex];
        break;
      default:
        img = this.sprites.run[this.runIndex];
    }

    this.drawFrame(ctx, img, x, y, flipped);
  }

  // ----------------------------------------------
  // PRIVATE: DRAW FINAL FRAME
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
      ctx.drawImage(
        img,
        x,
        y,
        targetWidth,
        TARGET_HEIGHT
      );
    }

    ctx.restore();
  }
}
