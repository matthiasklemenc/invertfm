// player-actions.ts
// ---------------------------------------------------------
// Player input + trick actions (rotation, jump charge).
// Connects cleanly to physics.ts
// ---------------------------------------------------------

import { PhysicsState, startJumpCharge, releaseJump } from "./physics";

export interface PlayerInput {
  jumping: boolean;
  rotatingLeft: boolean;
  rotatingRight: boolean;
}

export function createPlayerInput(): PlayerInput {
  return {
    jumping: false,
    rotatingLeft: false,
    rotatingRight: false,
  };
}

// ---------------------------------------------------------
// HANDLE PRESS START (from onTouchStart)
// ---------------------------------------------------------

export function handlePressStart(
  input: PlayerInput,
  physics: PhysicsState
) {
  input.jumping = true;
  startJumpCharge(physics);
}

// ---------------------------------------------------------
// HANDLE PRESS END (from onTouchEnd)
// ---------------------------------------------------------

export function handlePressEnd(
  input: PlayerInput,
  physics: PhysicsState
) {
  input.jumping = false;
  releaseJump(physics);
}

// ---------------------------------------------------------
// HANDLE ROTATION INPUTS (swipes or tilt)
// ---------------------------------------------------------

export function startRotateLeft(
  input: PlayerInput,
  physics: PhysicsState
) {
  input.rotatingLeft = true;
  physics.angularVelocity = -3.0; // clockwise
}

export function startRotateRight(
  input: PlayerInput,
  physics: PhysicsState
) {
  input.rotatingRight = true;
  physics.angularVelocity = 3.0; // counter-clockwise
}

export function stopRotation(
  input: PlayerInput,
  physics: PhysicsState
) {
  input.rotatingLeft = false;
  input.rotatingRight = false;

  // after letting go, rotation slows
  physics.angularVelocity *= 0.25;
}
