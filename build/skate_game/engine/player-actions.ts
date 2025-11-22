// player-actions.ts — handles input → action logic for the skate game

import { PhysicsBody } from "./physics";

export interface PlayerActions {
    jump(): void;
    flip(): void;
    startManual(direction: number): void;
    stopManual(): void;
    startNatas(): void;
    stopNatas(): void;
    boost(speed: number): void;

    update(dt: number): void;
    handleLanding(): void;
}

export function createPlayerActions(body: PhysicsBody): PlayerActions {

    // Jump variables
    const JUMP_FORCE = -820;       // vertical boost
    const AIR_JUMP_MOD = 0.65;     // optional (for future double-jump)
    const FLIP_STRENGTH = 1.8;     // speed of board/spin rotation
    const MANUAL_LEAN_SPEED = 1.8; // rotation lean in manual
    const NATAS_SPIN_SPEED = 320;  // deg/sec

    let manualDirection = 0;       // -1 or +1
    let landingCooldown = 0;

    //
    // --------------------------------------------------------
    //  ACTIONS
    // --------------------------------------------------------
    //

    function jump() {
        if (body.grounded) {
            body.vy = JUMP_FORCE;
            body.grounded = false;
            landingCooldown = 0.12; // short delay before manual/grind re-activation
        } else {
            // Future double jump hook:
            // body.vy = JUMP_FORCE * AIR_JUMP_MOD;
        }
    }

    function flip() {
        if (!body.grounded) {
            body.flipVelocity = FLIP_STRENGTH;
        }
    }

    function startManual(direction: number) {
        if (!body.grounded) return;
        if (landingCooldown > 0) return;

        body.manual = true;
        manualDirection = direction; // -1 back manual, +1 nose manual
    }

    function stopManual() {
        body.manual = false;
        manualDirection = 0;
    }

    function startNatas() {
        if (!body.grounded) return;
        if (landingCooldown > 0) return;

        body.natas = true;
        body.rotation = 0;
    }

    function stopNatas() {
        body.natas = false;
    }

    function boost(speed: number) {
        body.vx += speed;
    }

    //
    // --------------------------------------------------------
    //  UPDATE
    // --------------------------------------------------------
    //
    function update(dt: number) {

        // Cooldown until grinding / manual can activate again
        if (landingCooldown > 0) {
            landingCooldown -= dt;
            if (landingCooldown < 0) landingCooldown = 0;
        }

        // MANUAL
        if (body.manual) {
            body.rotation += manualDirection * MANUAL_LEAN_SPEED;
            if (body.rotation > 25) body.rotation = 25;
            if (body.rotation < -25) body.rotation = -25;
        }

        // NATAS SPIN
        if (body.natas) {
            body.rotation += NATAS_SPIN_SPEED * dt;
        }

        // IN AIR
        if (!body.grounded) {
            // rotation from flipVelocity is handled in physics.ts
        }
    }

    //
    // --------------------------------------------------------
    //  LANDING
    // --------------------------------------------------------
    //
    function handleLanding() {
        if (!body.grounded) return;

        body.flipVelocity = 0;
        body.rotation = 0;

        // Stop special modes on landing
        body.manual = false;
        body.natas = false;
        manualDirection = 0;

        landingCooldown = 0.12;
    }

    return {
        jump,
        flip,
        startManual,
        stopManual,
        startNatas,
        stopNatas,
        boost,
        update,
        handleLanding
    };
}
