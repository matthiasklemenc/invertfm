// DrawingHelpers.ts
// Clean drawing utilities for the modular skate game engine

import { PlayerPhysicsState } from "./engine/physics";
import { Obstacle } from "./engine/obstacles";
import { Collectible } from "./engine/collectibles";
import { TrickState } from "./engine/player-actions";

export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, width, height);
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: PlayerPhysicsState,
  tricks: TrickState
) {
  ctx.save();
  ctx.translate(player.x + 30, player.y + 30);

  // Apply flip rotation
  ctx.rotate(tricks.flipRotation);

  // Basic player box
  ctx.fillStyle = "#00e0ff";
  ctx.fillRect(-30, -30, 60, 60);

  // Natas spin visual indicator
  if (tricks.natas) {
    ctx.strokeStyle = "#ffcc00";
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawObstacle(
  ctx: CanvasRenderingContext2D,
  obstacle: Obstacle
) {
  ctx.fillStyle = "#ff4444";
  ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
}

export function drawCollectible(
  ctx: CanvasRenderingContext2D,
  c: Collectible
) {
  ctx.fillStyle = c.type === "coin" ? "#ffd700" : "#00ff88";
  ctx.beginPath();
  ctx.arc(c.x + c.width / 2, c.y + c.height / 2, c.width / 2, 0, Math.PI * 2);
  ctx.fill();
}
