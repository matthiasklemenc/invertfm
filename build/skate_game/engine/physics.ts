// physics.ts
// Time-based physics engine for the skate game

export interface PlayerPhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  rotation: number;
  rotationSpeed: number;
}

export interface PhysicsConfig {
  gravity: number;             // e.g. 0.45
  jumpForce: number;           // e.g. -12
  maxFallSpeed: number;        // e.g. 18
  friction: number;            // horizontal drag
}

export class PhysicsEngine {
  constructor(private config: PhysicsConfig) {}

  applyGravity(state: PlayerPhysicsState, delta: number) {
    if (!state.onGround) {
      state.vy += this.config.gravity * delta;
      if (state.vy > this.config.maxFallSpeed) {
        state.vy = this.config.maxFallSpeed;
      }
    }
  }

  applyHorizontalMovement(state: PlayerPhysicsState, delta: number) {
    state.x += state.vx * delta;

    // Apply friction when not pushing
    if (state.onGround) {
      state.vx *= this.config.friction ** delta;
      if (Math.abs(state.vx) < 0.01) state.vx = 0;
    }
  }

  applyVerticalMovement(state: PlayerPhysicsState, delta: number) {
    state.y += state.vy * delta;
  }

  jump(state: PlayerPhysicsState) {
    if (!state.onGround) return false;
    state.onGround = false;
    state.vy = this.config.jumpForce;
    return true;
  }

  applyRotation(state: PlayerPhysicsState, delta: number) {
    if (state.rotationSpeed !== 0) {
      state.rotation += state.rotationSpeed * delta;
      state.rotation %= Math.PI * 2;
    }
  }

  simulate(state: PlayerPhysicsState, delta: number) {
    this.applyGravity(state, delta);
    this.applyHorizontalMovement(state, delta);
    this.applyVerticalMovement(state, delta);
    this.applyRotation(state, delta);
  }
}
