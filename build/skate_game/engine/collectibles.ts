// collectibles.ts — clean collectible spawner + pickup manager

export interface Collectible {
    id: number;
    type: "coin" | "gem";
    x: number;
    y: number;
    radius: number;
    frame: number;       // animation counter
    speed: number;
}

export interface CollectibleManager {
    items: Collectible[];
    spawn(dt: number): void;
    update(dt: number): void;
    tryPickup(px: number, py: number, pr: number): number; // returns score gained
    reset(): void;
}

// internal counter
let COLLECTIBLE_ID = 0;

//
// ------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------
const SPEED = 480; // matches obstacles
const COIN_R = 16;
const GEM_R  = 22;

const SPAWN_INTERVAL_MIN = 600;   // ms
const SPAWN_INTERVAL_MAX = 1600;  // ms

//
// ------------------------------------------------------------
// CREATE MANAGER
// ------------------------------------------------------------
export function createCollectibleManager(
    groundY: number,
    canvasWidth: number
): CollectibleManager {

    const manager: CollectibleManager = {
        items: [],
        spawn,
        update,
        tryPickup,
        reset
    };

    let timer = 0;
    let nextSpawn = randomInterval();

    function reset() {
        manager.items = [];
        timer = 0;
        nextSpawn = randomInterval();
        COLLECTIBLE_ID = 0;
    }

    //
    // --------------------------------------------------------
    //  SPAWN LOGIC
    // --------------------------------------------------------
    //
    function spawn(dt: number) {
        timer += dt * 1000; // convert dt (seconds) → ms

        if (timer < nextSpawn) return;

        timer = 0;
        nextSpawn = randomInterval();

        const isGem = Math.random() < 0.12; // ~12% gem chance
        const type = isGem ? "gem" : "coin";

        const radius = isGem ? GEM_R : COIN_R;

        // Coins float slightly
        const yOffset = isGem ? -100 : -70;

        manager.items.push({
            id: COLLECTIBLE_ID++,
            type,
            x: canvasWidth + 100,
            y: groundY + yOffset,
            radius,
            frame: 0,
            speed: SPEED
        });
    }

    //
    // --------------------------------------------------------
    //  UPDATE MOVEMENT + ANIMATION
    // --------------------------------------------------------
    //
    function update(dt: number) {

        for (const c of manager.items) {
            c.x -= c.speed * dt;
            c.frame += 1;
        }

        // Remove off-screen
        manager.items = manager.items.filter(c => c.x + c.radius > -80);
    }

    //
    // --------------------------------------------------------
    //  PICKUP CHECK (returns score gained)
    // --------------------------------------------------------
    //
    function tryPickup(
        px: number, py: number, pr: number
    ): number {

        let score = 0;

        manager.items = manager.items.filter(c => {
            const dx = c.x - px;
            const dy = c.y - py;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < c.radius + pr) {

                // scoring logic
                if (c.type === "coin") score += 10;
                else if (c.type === "gem") score += 50;

                return false; // remove item
            }

            return true;
        });

        return score;
    }

    return manager;
}

//
// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------
function randomInterval() {
    return Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN) + SPAWN_INTERVAL_MIN;
}
