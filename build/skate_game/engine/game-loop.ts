// ---------------------------------------------------------
// game-loop.ts (Clean, class-based renderer version)
// ---------------------------------------------------------

import { updatePhysics, PhysicsState, createPhysicsState } from "./physics";
import { createPlayerInput } from "./player-actions";
import { createObstacleManager } from "./obstacles";
import { createCollectibleManager } from "./collectibles";

// New class-based renderers
import { BackgroundRenderer } from "./rendering/BackgroundRenderer";
import { GroundRenderer } from "./rendering/GroundRenderer";
import { ObstacleRenderer } from "./rendering/ObstacleRenderer";
import { CoinRenderer } from "./rendering/CoinRenderer";
import { PlayerRenderer, PlayerSpriteSet } from "./rendering/PlayerRenderer";

export type GameLoopStop = () => void;

// The main game loop constructor
export function startGameLoop(callback: (dt: number) => void): GameLoopStop {
  let lastTime = performance.now();
  let running = true;

  function loop(now: number) {
    if (!running) return;

    const dt = (now - lastTime) / 1000; // delta time in seconds
    lastTime = now;

    callback(dt);

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

  return () => {
    running = false;
  };
}

// ---------------------------------------------------------
// FULL GAME ENGINE BOOTSTRAP (USED BY SkateGamePage.tsx)
// ---------------------------------------------------------

export function createGameEngine(
  canvas: HTMLCanvasElement,
  sprites: PlayerSpriteSet
) {
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  // Logic groups
  const physics = createPhysicsState();
  const input = createPlayerInput(canvas);
  const obstacles = createObstacleManager();
  const coins = createCollectibleManager();

  // Renderers
  const backgroundRenderer = new BackgroundRenderer();
  const groundRenderer = new GroundRenderer();
  const obstacleRenderer = new ObstacleRenderer();
  const coinRenderer = new CoinRenderer();
  const playerRenderer = new PlayerRenderer(sprites);

  function update(dt: number) {
    // Update game logic
    updatePhysics(physics, dt, input);
    obstacles.update(dt, physics.playerX);
    coins.update(dt, physics.playerX);

    // Drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    backgroundRenderer.render(ctx, physics);
    groundRenderer.render(ctx, physics);
    obstacleRenderer.render(ctx, obstacles.list);
    coinRenderer.render(ctx, coins.list);
    playerRenderer.render(ctx, physics, input);
  }

  return { update, physics, input, obstacles, coins };
}
