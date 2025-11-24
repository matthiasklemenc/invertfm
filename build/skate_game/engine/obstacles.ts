/* ============================================================================
   OBSTACLE GENERATION — INVERT FM SKATE GAME
   Produces world obstacles based on distance.
   ============================================================================ */

export function generateObstacles(distance: number) {
    const obstacles: any[] = [];

    /* ------------------------------------------------------------
       Simple spawn pacing
       ------------------------------------------------------------ */
    const spawnChance = 0.4; // 40% chance per call
    if (Math.random() > spawnChance) return obstacles;

    /* ------------------------------------------------------------
       Fixed spawn X (world moves left)
       ------------------------------------------------------------ */
    const x = 1400 + Math.random() * 600;

    /* ------------------------------------------------------------
       Weighted obstacle type selection
       ------------------------------------------------------------ */
    const types = [
        "box",
        "box",
        "hydrant",
        "tube_green",
        "quarterpipe",
        "truck"
    ];

    const type = weightedChoice(types);

    /* ------------------------------------------------------------
       Create obstacle by type
       ------------------------------------------------------------ */
    switch (type) {
        case "box":
            obstacles.push({
                type: "box",
                x,
                y: 0,            // renderer sets final height
                width: 80,
                height: 80,
            });
            break;

        case "hydrant":
            obstacles.push({
                type: "hydrant",
                x,
                y: 0,
                width: 70,
                height: 110,
            });
            break;

        case "tube_green":
            obstacles.push({
                type: "tube_green",
                x,
                y: 0,
                width: 120,
                height: 180,
            });
            break;

        case "quarterpipe":
            obstacles.push({
                type: "quarterpipe",
                x,
                y: 0,
                width: 260,
                height: 260,
            });
            break;

        case "truck":
            obstacles.push({
                type: "truck",
                x,
                y: 0,
                width: 500,
                height: 260,
            });
            break;
    }

    return obstacles;
}

/* ============================================================================
   Weighted random choice helper
   ============================================================================ */
function weightedChoice(arr: string[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}
