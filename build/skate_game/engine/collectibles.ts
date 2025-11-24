/* ============================================================================
   COLLECTIBLE GENERATION — COINS & DIAMONDS
   Compatible with the INVERT FM skate-game engine.
   Generates items based on world distance.
   ============================================================================ */

export function generateCollectibles(distance: number) {
    const list: any[] = [];

    /* ------------------------------------------------------------
       Small pacing check
       ------------------------------------------------------------ */
    const spawnChance = 0.55; // 55% chance per generation call
    if (Math.random() > spawnChance) return list;

    /* ------------------------------------------------------------
       Spawn X (beyond screen)
       ------------------------------------------------------------ */
    const baseX = 1400 + Math.random() * 600;

    /* ------------------------------------------------------------
       Pick collectible type
       ------------------------------------------------------------ */
    const types = ["coin", "coin", "coin", "diamond"];
    const type = weightedChoice(types);

    /* ------------------------------------------------------------
       World height baseline (slightly above ground)
       ------------------------------------------------------------ */
    const groundY = 1080 - 200; // approx, renderer adjusts final visuals

    /* ------------------------------------------------------------
       Generate single item
       ------------------------------------------------------------ */
    list.push({
        type,
        x: baseX,
        y: groundY - (50 + Math.random() * 150), // varied height
        radius: type === "diamond" ? 40 : 30,
        collected: false,
        pulse: 0,
    });

    return list;
}

/* ============================================================================
   Weighted random selection helper
   ============================================================================ */
function weightedChoice(arr: string[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}
