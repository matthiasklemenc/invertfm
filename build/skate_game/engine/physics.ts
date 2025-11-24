/* ============================================================================
   PHYSICS UTILITIES — INVERT FM SKATE GAME
   These helpers complement the main game-loop physics.
   ============================================================================ */

export const GRAVITY = 2400;
export const MAX_FALL_SPEED = 1400;
export const JUMP_VELOCITY = -900;

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
}

/** Apply vertical gravity to a velocity */
export function applyGravity(vy: number, dt: number) {
    vy += GRAVITY * dt;
    if (vy > MAX_FALL_SPEED) vy = MAX_FALL_SPEED;
    return vy;
}

/** Simple jump (non-underworld) */
export function startJump(onGround: boolean) {
    if (!onGround) return null;
    return JUMP_VELOCITY;
}
