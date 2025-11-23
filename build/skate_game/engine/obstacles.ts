// obstacles.ts
// ---------------------------------------------------------
// Generates & manages obstacles in world space.
// Works with ObstacleRenderer + physics engine.
//
// Exported:
// - createObstacleManager()
// - updateObstacles()
// - generateObstacleIfNeeded()
// ---------------------------------------------------------

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "ramp" | "rail" | "bus" | "box";
}

export interface ObstacleManager {
  obstacles: Obstacle[];
  nextSpawnX: number;
  groundY: number;
}

export function createObstacleManager(groundY: number): ObstacleManager {
  return {
    obstacles: [],
    nextSpawnX: 800,   // first spawn point
    groundY,
  };
}

// ---------------------------------------------------------
// SPAWN LOGIC
// ---------------------------------------------------------

function spawnRandomObstacle(manager: ObstacleManager) {
  const y = manager.groundY;

  const types: Array<Obstacle["type"]> = ["ramp", "rail", "bus", "box"];
  const type = types[Math.floor(Math.random() * types.length)];

  let width = 80;
  let height = 40;

  if (type === "ramp") { width = 90; height = 60; }
  if (type === "rail") { width = 130; height = 10; }
  if (type === "bus")  { width = 220; height = 90; }
  if (type === "box")  { width = 70; height = 40; }

  manager.obstacles.push({
    x: manager.nextSpawnX,
    y,
    width,
    height,
    type,
  });

  // next spawn (random distance)
  manager.nextSpawnX += 500 + Math.random() * 600;
}

// ---------------------------------------------------------
// UPDATE (called every frame)
// ---------------------------------------------------------

export function updateObstacles(
  manager: ObstacleManager,
  scrollX: number
) {
  // Remove obstacles far left of screen
  manager.obstacles = manager.obstacles.filter(
    obs => obs.x > scrollX - 400
  );
}

// ---------------------------------------------------------
// CHECK IF NEW OBSTACLE SHOULD SPAWN
// ---------------------------------------------------------

export function generateObstacleIfNeeded(
  manager: ObstacleManager,
  scrollX: number
) {
  if (scrollX + 1200 > manager.nextSpawnX) {
    spawnRandomObstacle(manager);
  }
}
