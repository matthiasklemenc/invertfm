/* ============================================================================
   PLAYER ACTION HELPERS — INVERT FM SKATE GAME
   Pure action utilities used optionally by the main game-loop.
   ============================================================================ */

export interface PlayerState {
    x: number;
    y: number;
    vy: number;
    anim: string;
    facing: number;
    onGround: boolean;
    falling: boolean;
    spinCount: number;
    crashType: string | null;
    inUnderworld: boolean;
    underworldTime: number;
    lives: number;
}

/* ============================================================================
   BASIC ACTIONS
   ============================================================================ */

/** Starts an ollie if allowed */
export function startOllie(player: PlayerState) {
    if (player.onGround && !player.falling) {
        player.vy = -900;              // synced with engine gravity
        player.onGround = false;
        player.anim = "ollie";
    }
}

/** Hard crash into obstacle */
export function crash(player: PlayerState, type: string = "default") {
    if (player.crashType) return;      // already crashing

    player.crashType = type;
    player.anim = "crash";

    player.lives -= 1;
    return player.lives <= 0;         // returns true if game over
}

/** Reset crash state */
export function resetCrash(player: PlayerState) {
    player.crashType = null;
    player.anim = "run";
}

/* ============================================================================
   ADVANCED ACTIONS
   ============================================================================ */

/** Natas spin on hydrant */
export function startNatasSpin(player: PlayerState, spins: number = 1) {
    player.spinCount = spins;
    player.anim = "natas";
    player.onGround = true;
    player.vy = 0;
}

/** Underworld fall (tube) */
export function startUnderworldFall(player: PlayerState) {
    player.falling = true;
    player.inUnderworld = true;
    player.underworldTime = 0;
    player.anim = "falling";
}

/* ============================================================================
   RESET PLAYER FULLY
   ============================================================================ */
export function resetPlayer(player: PlayerState, groundY: number) {
    player.x = 200;
    player.y = groundY;
    player.vy = 0;
    player.anim = "run";
    player.onGround = true;
    player.falling = false;
    player.crashType = null;
    player.spinCount = 1;
    player.inUnderworld = false;
    player.underworldTime = 0;
}
