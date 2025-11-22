// collectibles.ts
// Time-based collectibles & floating score text system

export interface Collectible {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;       // 'coin', 'star', 'powerup'
  value: number;      // score value
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  life: number;       // remaining time in seconds
  opacity: number;    // 0–1
}

export interface CollectibleSystemConfig {
  baseSpeed: number;
  spawnInterval: number; // seconds
  floatingTextDuration: number; // seconds
}

export class CollectibleSystem {
  private collectibles: Collectible[] = [];
  private floatingTexts: FloatingText[] = [];
  private spawnTimer = 0;
  private nextId = 1;

  constructor(private config: CollectibleSystemConfig) {}

  update(delta: number) {
    // Move collectibles
    for (const c of this.collectibles) {
      c.x -= this.config.baseSpeed * delta;
    }

    // Remove off-screen
    this.collectibles = this.collectibles.filter(c => c.x + c.width > 0);

    // Spawn collectibles
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.config.spawnInterval) {
      this.spawnRandomCollectible();
      this.spawnTimer = 0;
    }

    // Update floating texts
    for (const ft of this.floatingTexts) {
      ft.y -= delta * 12; // float upward
      ft.life -= delta;
      ft.opacity = Math.max(0, ft.life / this.config.floatingTextDuration);
    }

    // Remove expired floating texts
    this.floatingTexts = this.floatingTexts.filter(ft => ft.life > 0);
  }

  private spawnRandomCollectible() {
    const roll = Math.random();

    if (roll < 0.7) {
      this.spawnCoin();
    } else {
      this.spawnStar();
    }
  }

  private spawnCoin() {
    this.collectibles.push({
      id: this.nextId++,
      x: 900,
      y: 200 + Math.random() * 100,
      width: 30,
      height: 30,
      type: "coin",
      value: 100,
    });
  }

  private spawnStar() {
    this.collectibles.push({
      id: this.nextId++,
      x: 900,
      y: 150 + Math.random() * 120,
      width: 40,
      height: 40,
      type: "star",
      value: 300,
    });
  }

  getCollectibles() {
    return this.collectibles;
  }

  getFloatingTexts() {
    return this.floatingTexts;
  }

  checkCollision(
    px: number,
    py: number,
    pw: number,
    ph: number
  ): Collectible | null {
    for (const c of this.collectibles) {
      if (
        px < c.x + c.width &&
        px + pw > c.x &&
        py < c.y + c.height &&
        py + ph > c.y
      ) {
        return c;
      }
    }
    return null;
  }

  collect(c: Collectible) {
    // Remove collectible
    this.collectibles = this.collectibles.filter(x => x.id !== c.id);

    // Spawn floating text at collectible position
    this.floatingTexts.push({
      id: this.nextId++,
      x: c.x,
      y: c.y,
      text: `+${c.value}`,
      life: this.config.floatingTextDuration,
      opacity: 1,
    });

    return c.value;
  }
}
