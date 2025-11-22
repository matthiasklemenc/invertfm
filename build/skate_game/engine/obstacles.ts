// obstacles.ts
// Time-based obstacle spawning, movement, and collision detection

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number; // horizontal movement speed
  type: string;  // 'ramp', 'rail', 'cone', etc.
}

export interface ObstacleSystemConfig {
  baseSpeed: number;         // scrolling speed
  spawnInterval: number;     // seconds between spawns
  speedGrowthRate: number;   // how fast difficulty increases
}

export class ObstacleSystem {
  private obstacles: Obstacle[] = [];
  private spawnTimer = 0;
  private difficultyMultiplier = 1;

  constructor(private config: ObstacleSystemConfig) {}

  update(delta: number) {
    // Increase difficulty over time
    this.difficultyMultiplier += this.config.speedGrowthRate * delta;

    // Move all obstacles
    for (const o of this.obstacles) {
      o.x -= this.config.baseSpeed * this.difficultyMultiplier * delta;
    }

    // Remove obstacles that go off screen
    this.obstacles = this.obstacles.filter(o => o.x + o.width > 0);

    // Handle spawning
    this.spawnTimer += delta;

    if (this.spawnTimer >= this.config.spawnInterval) {
      this.spawnRandomObstacle();
      this.spawnTimer = 0;
    }
  }

  private spawnRandomObstacle() {
    const roll = Math.random();

    if (roll < 0.33) {
      this.spawnRamp();
    } else if (roll < 0.66) {
      this.spawnRail();
    } else {
      this.spawnCone();
    }
  }

  private spawnRamp() {
    this.obstacles.push({
      x: 900,
      y: 260,
      width: 80,
      height: 50,
      speed: this.config.baseSpeed,
      type: "ramp",
    });
  }

  private spawnRail() {
    this.obstacles.push({
      x: 900,
      y: 240,
      width: 120,
      height: 20,
      speed: this.config.baseSpeed,
      type: "rail",
    });
  }

  private spawnCone() {
    this.obstacles.push({
      x: 900,
      y: 280,
      width: 30,
      height: 40,
      speed: this.config.baseSpeed,
      type: "cone",
    });
  }

  getObstacles() {
    return this.obstacles;
  }

  checkCollision(px: number, py: number, pw: number, ph: number): Obstacle | null {
    for (const o of this.obstacles) {
      if (
        px < o.x + o.width &&
        px + pw > o.x &&
        py < o.y + o.height &&
        py + ph > o.y
      ) {
        return o;
      }
    }
    return null;
  }
}
