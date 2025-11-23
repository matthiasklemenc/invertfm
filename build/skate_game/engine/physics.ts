// physics.ts
// ---------------------------------------------------------
// Core physics engine used by game-loop.ts
// Handles:
// - horizontal speed
// - gravity
// - jumping + jump charge
// - landing
// - rotation / fakie detection
// ---------------------------------------------------------

export interface PhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;

  isGrounded: boolean;
  isFakie: boolean;

  angle: number;          // rotation angle
  angularVelocity: number;

  jumpCharging: boolean;
  jumpChargeTime: number;

  speed: number;
  groundY: number;        // world Y of ground
}

export function createPhysicsState(): PhysicsState {
  return {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,

    isGrounded: true,
    isFakie: false,

    angle: 0,
    angularVelocity: 0,

    jumpCharging: false,
    jumpChargeTime: 0,

    speed: 4,        // old game default cruising speed
    groundY: 0,
  };
}

// ---------------------------------------------------------
// HANDLE INPUT (CALLED FROM SkateGamePage.tsx)
// ---------------------------------------------------------

export function startJumpCharge(state: PhysicsState) {
  if (state.isGrounded) state.jumpCharging = true;
}

export function releaseJump(state: PhysicsState) {
  if (!state.isGrounded) return;

  state.jumpCharging = false;

  // Charge capped at 350ms
  const charge = Math.min(state.jumpChargeTime, 350);

  // Convert charge → jump power
  const jumpPower = 220 + charge * 0.6;

  state.vy = -jumpPower;
  state.isGrounded = false;

  // Slight up speed boost
  state.vx = 0;
  state.speed += 0.1;
}

// ---------------------------------------------------------
// MAIN PHYSICS UPDATE
// ---------------------------------------------------------

export function updatePhysics(state: PhysicsState, dt: number) {
  const GRAVITY = 900;
  const MAX_FALL = 1600;

  // -------------------------------------------------------
  // Jump charge while button held
  // -------------------------------------------------------

  if (state.jumpCharging) {
    state.jumpChargeTime += dt * 1000;
    if (state.jumpChargeTime > 350) state.jumpChargeTime = 350;
  } else {
    state.jumpChargeTime = 0;
  }

  // -------------------------------------------------------
  // Apply gravity
  // -------------------------------------------------------

  if (!state.isGrounded) {
    state.vy += GRAVITY * dt;
    if (state.vy > MAX_FALL) state.vy = MAX_FALL;
  }

  // -------------------------------------------------------
  // Vertical movement
  // -------------------------------------------------------

  state.y += state.vy * dt;

  // -------------------------------------------------------
  // LANDING
  // -------------------------------------------------------

  if (state.y >= state.groundY) {
    state.y = state.groundY;
    state.vy = 0;
    if (!state.isGrounded) {
      // landing impact reduces angular velocity
      state.angularVelocity *= 0.2;
    }
    state.isGrounded = true;
  }

  // -------------------------------------------------------
  // ROTATION / FAKIE STATE
  // -------------------------------------------------------

  state.angle += state.angularVelocity * dt;

  // Normalize angle
  const fullTurn = Math.PI * 2;
  if (state.angle > fullTurn) state.angle -= fullTurn;
  if (state.angle < 0) state.angle += fullTurn;

  // Detect 180° land = fakie
  // 0 rad = facing right
  // PI rad = facing left (fakie)
  if (state.isGrounded) {
    state.isFakie = state.angle > Math.PI * 0.5 && state.angle < Math.PI * 1.5;
  }

  // -------------------------------------------------------
  // SPEED CONTROL
  // -------------------------------------------------------

  // Slight natural speed decay
  state.speed *= 0.999;

  if (state.speed < 3.5) state.speed = 3.5;
  if (state.speed > 7) state.speed = 7;

  // Apply horizontal movement
  state.x += state.speed * dt * 60;
}
