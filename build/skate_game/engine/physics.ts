// physics.ts — clean rebuilt physics engine for the skate game

export interface PhysicsBody {
    x: number;
    y: number;
    vx: number;
    vy: number;

    width: number;
    height: number;

    grounded: boolean;
    gravityScale: number;

    // Special tricks
    grinding: boolean;
    natas: boolean;
    manual: boolean;

    rotation: number;      // for flips
    flipVelocity: number;  // flips per second
}

export interface PhysicsWorld {
    groundY: number;
    gravity: number;
    friction: number;
    airResistance: number;
}

export function createPhysicsWorld(): PhysicsWorld {
    return {
        groundY: 460,            // should be overridden by level
        gravity: 1800,           // px/sec²
        friction: 0.82,
        airResistance: 0.99
    };
}

//
// ---------------------------------------------------------
//  UPDATE PHYSICS (dt is seconds, not ms)
// ---------------------------------------------------------
export function physicsUpdate(body: PhysicsBody, world: PhysicsWorld, dt: number) {

    // -----------------------------------------
    // APPLY GRAVITY
    // -----------------------------------------
    if (!body.grounded) {
        body.vy += world.gravity * body.gravityScale * dt;
    }

    // -----------------------------------------
    // UPDATE POSITION
    // -----------------------------------------
    body.x += body.vx * dt;
    body.y += body.vy * dt;

    // -----------------------------------------
    // FLIP ROTATION (while in the air)
    // -----------------------------------------
    if (!body.grounded) {
        body.rotation += body.flipVelocity * dt * 360;
        if (body.rotation >= 360) body.rotation -= 360;
        if (body.rotation < 0) body.rotation += 360;
    }

    // -----------------------------------------
    // GROUND COLLISION
    // -----------------------------------------
    const halfH = body.height / 2;

    if (body.y + halfH >= world.groundY) {
        body.y = world.groundY - halfH;
        body.vy = 0;
        body.grounded = true;
    } else {
        body.grounded = false;
    }

    // -----------------------------------------
    // FRICTION (only grounded)
    // -----------------------------------------
    if (body.grounded) {
        body.vx *= world.friction;
    } else {
        body.vx *= world.airResistance;
    }

    // -----------------------------------------
    // SPECIAL STATES
    // -----------------------------------------

    // MANUAL
    if (body.manual && body.grounded) {
        body.vy = 0;
        body.vx *= 1.02; // tiny boost
    }

    // GRINDING (rail)
    if (body.grinding) {
        body.vy = 0;
        body.vx *= 1.03; // spark acceleration
    }

    // NATAS SPIN (just keeps rotation alive)
    if (body.natas) {
        body.rotation += 240 * dt;
    }
}

//
// ---------------------------------------------------------
//  CREATE PLAYER BODY
// ---------------------------------------------------------
export function createPlayerPhysics(): PhysicsBody {
    return {
        x: 180,
        y: 460,
        vx: 0,
        vy: 0,

        width: 80,
        height: 110,

        grounded: true,
        gravityScale: 1,

        grinding: false,
        manual: false,
        natas: false,

        rotation: 0,
        flipVelocity: 0
    };
}

//
// ---------------------------------------------------------
//  SIMPLE BOX COLLISION FOR OBSTACLES
// ---------------------------------------------------------
export function aabbCollision(
    ax: number, ay: number, aw: number, ah: number,
    bx: number, by: number, bw: number, bh: number
): boolean {
    return (
        ax < bx + bw &&
        ax + aw > bx &&
        ay < by + bh &&
        ay + ah > by
    );
}

//
// ---------------------------------------------------------
//  COLLISION WITH OBSTACLES
// ---------------------------------------------------------
export interface Obstacle {
    x: number;
    y: number;
    width: number;
    height: number;
    type: string;
}

export function handleObstacleCollisions(
    body: PhysicsBody,
    obstacles: Obstacle[]
): boolean {
    const playerBox = {
        x: body.x - body.width / 2,
        y: body.y - body.height / 2,
        w: body.width,
        h: body.height
    };

    for (const o of obstacles) {

        const hit = aabbCollision(
            playerBox.x, playerBox.y, playerBox.w, playerBox.h,
            o.x, o.y - o.height, o.width, o.height
        );

        if (!hit) continue;

        switch (o.type) {

            // -------------------------------------
            // RAIL — grinding mode
            // -------------------------------------
            case "rail":
                body.grinding = true;
                body.grounded = true;
                body.y = o.y - o.height - (body.height / 2);
                body.vy = 0;
                return false;

            // -------------------------------------
            // LEDGE / RAMP — allow land on top
            // -------------------------------------
            case "ledge":
            case "ramp":
                body.y = o.y - o.height - (body.height / 2);
                body.vy = 0;
                body.grounded = true;
                return false;

            // -------------------------------------
            // STAIRS — basically flat collision
            // -------------------------------------
            case "stairs":
                body.y = o.y - o.height - (body.height / 2);
                body.vy = 0;
                body.grounded = true;
                return false;

            // -------------------------------------
            // GAP — instant death
            // -------------------------------------
            case "gap":
                return true;

            // -------------------------------------
            // DEFAULT — kill obstacle (hydrant etc.)
            // -------------------------------------
            default:
                return true;
        }
    }

    body.grinding = false;
    return false; // no death
}
