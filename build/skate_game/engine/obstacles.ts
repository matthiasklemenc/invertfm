// obstacles.ts — clean rebuilt obstacle spawner + manager

export interface Obstacle {
    id: number;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    state?: any;
    animationFrame?: number;
}

export interface ObstacleManager {
    obstacles: Obstacle[];
    spawn(time: number): void;
    update(dt: number): void;
    reset(): void;
}

let OBSTACLE_ID = 0;

//
// ------------------------------------------------------------
//  CONFIGURATION
// ------------------------------------------------------------
const SPAWN_INTERVAL_MIN = 900;  // ms
const SPAWN_INTERVAL_MAX = 2400; // ms

const SPEED = 480; // px/sec

// Obstacle presets
const TYPES = {
    hydrant:   { w: 40, h: 75 },
    rail:      { w: 250, h: 12 },
    ledge:     { w: 180, h: 40 },
    trash_bin: { w: 60, h: 70 },
    green_bin: { w: 55, h: 55 },
    police_car:{ w: 210, h: 65 },
    ramp:      { w: 180, h: 100 },
    stairs:    { w: 160, h: 60 },
    gap:       { w: 120, h: 20 }
};

//
// ------------------------------------------------------------
//  CREATE MANAGER
// ------------------------------------------------------------
export function createObstacleManager(
    groundY: number,
    canvasWidth: number
): ObstacleManager {

    const manager: ObstacleManager = {
        obstacles: [],
        spawn,
        update,
        reset
    };

    let nextSpawnTime = randomInterval();
    let elapsed = 0;

    function reset() {
        manager.obstacles = [];
        nextSpawnTime = randomInterval();
        elapsed = 0;
        OBSTACLE_ID = 0;
    }

    //
    // --------------------------------------------------------
    //  SPAWN LOGIC
    // --------------------------------------------------------
    //
    function spawn(time: number) {
        elapsed += time;

        if (elapsed < nextSpawnTime) return;

        elapsed = 0;
        nextSpawnTime = randomInterval();

        // Choose obstacle type
        const type = pickObstacleType();
        const preset = TYPES[type];

        const obstacle: Obstacle = {
            id: OBSTACLE_ID++,
            type,
            x: canvasWidth + preset.w, // spawn outside screen
            y: groundY,
            width: preset.w,
            height: preset.h,
            speed: SPEED,
            animationFrame: 0,
            state: {}
        };

        // Hydrant gets a water timer
        if (type === "hydrant") {
            obstacle.state.waterTimer = 0;
        }

        manager.obstacles.push(obstacle);
    }

    //
    // --------------------------------------------------------
    //  UPDATE OBSTACLES
    // --------------------------------------------------------
    //
    function update(dt: number) {

        for (const o of manager.obstacles) {
            o.x -= o.speed * dt;

            // Update animation
            if (o.animationFrame !== undefined) {
                o.animationFrame += 1;
            }

            // Hydrant water spray timer
            if (o.type === "hydrant") {
                o.state.waterTimer += 1;
            }
        }

        // Remove off-screen obstacles
        manager.obstacles = manager.obstacles.filter(o => o.x + o.width > -80);
    }

    return manager;
}

//
// ------------------------------------------------------------
//  HELPERS
// ------------------------------------------------------------
function randomInterval() {
    return Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN) + SPAWN_INTERVAL_MIN;
}

function pickObstacleType(): keyof typeof TYPES {

    const list = [
        "hydrant",
        "trash_bin",
        "police_car",
        "rail",
        "ledge",
        "green_bin",
        "stairs",
        "ramp",
        "gap"
    ];

    // Slight weight: more hydrants, fewer gaps
    const weights = {
        hydrant:   2,
        trash_bin: 2,
        police_car:2,
        rail:      1,
        ledge:     1,
        green_bin: 1,
        stairs:    1,
        ramp:      1,
        gap:       0.5
    };

    const expanded: string[] = [];
    for (const t of list) {
        for (let i = 0; i < (weights as any)[t]; i++) {
            expanded.push(t);
        }
    }

    return expanded[Math.floor(Math.random() * expanded.length)] as any;
}
