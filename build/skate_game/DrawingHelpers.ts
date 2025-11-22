// DrawingHelpers.ts — Modular Renderer (Part 1)
// Cleaner but same look as original game
// Supports both canvas-drawn graphics and future PNG sprites.

export interface RenderContext {
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    scale: number;
}

//
// ---------------------------------------------------------
//  BACKGROUND RENDERING
// ---------------------------------------------------------
//

export function drawParallaxCity(ctx: CanvasRenderingContext2D, scrollX: number, width: number, height: number) {

    ctx.save();

    // Sky background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#1b1e2b");
    gradient.addColorStop(1, "#2d3142");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Layered city silhouettes (similar look to your old file)
    const layers = [
        { color: "#3a3f55", speed: 0.2, height: height * 0.55 },
        { color: "#2e3246", speed: 0.4, height: height * 0.65 },
        { color: "#242839", speed: 0.65, height: height * 0.75 },
        { color: "#1d1f2e", speed: 1.0, height: height * 0.85 },
    ];

    layers.forEach(layer => {
        ctx.fillStyle = layer.color;
        const offset = -(scrollX * layer.speed) % width;

        drawRepeatingBuildingBlock(ctx, offset, layer.height, width);
        drawRepeatingBuildingBlock(ctx, offset + width, layer.height, width);
    });

    ctx.restore();
}

function drawRepeatingBuildingBlock(
    ctx: CanvasRenderingContext2D,
    offsetX: number,
    baseline: number,
    width: number
) {
    const blockWidth = width * 0.1;

    for (let i = 0; i < 20; i++) {
        const x = offsetX + i * blockWidth;

        const w = blockWidth;
        const h = Math.random() * 80 + 40;

        ctx.fillRect(x, baseline - h, w, h);
    }
}

//
// ---------------------------------------------------------
//  PLAYER RENDERING
// ---------------------------------------------------------
//

export interface PlayerRenderState {
    x: number;
    y: number;
    rotation: number;
    flipRotation: number;
    isManual: boolean;
    manualLean: number;
    inAir: boolean;
    natasActive: boolean;
    natasRotation: number;
}

export function drawPlayer(
    ctx: CanvasRenderingContext2D,
    p: PlayerRenderState,
    scale: number
) {

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation + p.flipRotation) * Math.PI / 180);
    ctx.scale(scale, scale);

    drawSkateboard(ctx, p);
    drawStickman(ctx, p);

    ctx.restore();
}

//
// ---------------------------------------------------------
//  SKATEBOARD
// ---------------------------------------------------------
//

function drawSkateboard(
    ctx: CanvasRenderingContext2D,
    p: PlayerRenderState
) {
    ctx.save();

    // Deck
    ctx.fillStyle = "#2b2d42";
    ctx.strokeStyle = "#ef233c";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(-40, -8, 80, 16, 8);
    ctx.fill();
    ctx.stroke();

    // Wheels
    ctx.fillStyle = "#edf2f4";
    ctx.beginPath();
    ctx.arc(-28, 10, 6, 0, Math.PI * 2);
    ctx.arc(28, 10, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

//
// ---------------------------------------------------------
//  STICKMAN (Player Character)
// ---------------------------------------------------------
//

function drawStickman(
    ctx: CanvasRenderingContext2D,
    p: PlayerRenderState
) {
    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ffffff";

    // Head
    ctx.beginPath();
    ctx.arc(0, -35, 12, 0, Math.PI * 2);
    ctx.stroke();

    // Body
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(0, 18);
    ctx.stroke();

    // Arms
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(-20, 5);
    ctx.moveTo(0, -15);
    ctx.lineTo(20, 5);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(0, 18);
    ctx.lineTo(-20, 40);
    ctx.moveTo(0, 18);
    ctx.lineTo(20, 40);
    ctx.stroke();

    ctx.restore();
}

//
// ---------------------------------------------------------
//  OBSTACLE RENDERING
// ---------------------------------------------------------
//

// Generic helper for simple rectangular obstacles (fallback style)
export function drawBasicObstacle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.fillRect(x, y - height, width, height);
    ctx.restore();
}

// Main obstacle renderer — selects the style based on type
export function drawObstacle(
    ctx: CanvasRenderingContext2D,
    obstacle: {
        x: number;
        y: number;
        width: number;
        height: number;
        type: string;
        animationFrame?: number;
        state?: any;
    }
) {
    ctx.save();

    const { x, y, width, height, type } = obstacle;

    switch (type) {

        // -----------------------------
        // ☑ HYDRANT (Water Animation)
        // -----------------------------
        case "hydrant":
            drawHydrant(ctx, x, y, width, height, obstacle.state);
            break;

        // -----------------------------
        // ☑ POLICE CAR
        // -----------------------------
        case "police_car":
            drawPoliceCar(ctx, x, y, width, height, obstacle.animationFrame || 0);
            break;

        // -----------------------------
        // ☑ RAIL
        // -----------------------------
        case "rail":
            drawRail(ctx, x, y, width, height);
            break;

        // -----------------------------
        // ☑ FLAT LEDGE
        // -----------------------------
        case "ledge":
            drawLedge(ctx, x, y, width, height);
            break;

        // -----------------------------
        // ☑ TRASH BIN
        // -----------------------------
        case "trash_bin":
            drawBin(ctx, x, y, width, height, "#6a6f7f");
            break;

        // -----------------------------
        // ☑ GREEN BIN
        // -----------------------------
        case "green_bin":
            drawBin(ctx, x, y, width, height, "#4caf50");
            break;

        // -----------------------------
        // ☑ STAIRS
        // -----------------------------
        case "stairs":
            drawStairs(ctx, x, y, width, height);
            break;

        // -----------------------------
        // ☑ RAMP (Quarterpipe)
        // -----------------------------
        case "ramp":
            drawRamp(ctx, x, y, width, height);
            break;

        // -----------------------------
        // ☑ GAP
        // -----------------------------
        case "gap":
            drawGap(ctx, x, y, width, height);
            break;

        // -----------------------------
        // ☑ DEFAULT PLACEHOLDER
        // -----------------------------
        default:
            drawBasicObstacle(ctx, x, y, width, height, "#c33");
            break;
    }

    ctx.restore();
}

//
// ---------------------------------------------------------
//  INDIVIDUAL OBSTACLE DRAWING FUNCTIONS
// ---------------------------------------------------------
//

// HYDRANT
function drawHydrant(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    state?: { waterTimer?: number }
) {
    ctx.save();

    // Body
    ctx.fillStyle = "#dd2c2c";
    ctx.beginPath();
    ctx.roundRect(x, y - height, width, height, 6);
    ctx.fill();

    // Cap
    ctx.fillStyle = "#b52020";
    ctx.fillRect(x - 5, y - height - 8, width + 10, 10);

    // Water spray (animated)
    if (state?.waterTimer && state.waterTimer > 0) {
        const spray = Math.sin(state.waterTimer * 0.3) * 12 + 20;

        ctx.strokeStyle = "rgba(150,200,255,0.7)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y - height + 10);
        ctx.lineTo(x + width / 2 + spray, y - height - 20);
        ctx.stroke();
    }

    ctx.restore();
}

// POLICE CAR
function drawPoliceCar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    frame: number
) {
    ctx.save();

    // Car body
    ctx.fillStyle = "#1a1d2d";
    ctx.fillRect(x, y - height, width, height);

    // Stripe
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + 10, y - height + 20, width - 20, 10);

    // Wheels
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(x + 15, y - 5, 8, 0, Math.PI * 2);
    ctx.arc(x + width - 15, y - 5, 8, 0, Math.PI * 2);
    ctx.fill();

    // Flashing lights
    const isBlue = Math.floor(frame / 10) % 2 === 0;

    ctx.fillStyle = isBlue ? "#4fc3f7" : "#ef5350";
    ctx.fillRect(x + width / 2 - 10, y - height - 10, 20, 8);

    ctx.restore();
}

// RAIL
function drawRail(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
) {
    ctx.save();
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x, y - height);
    ctx.lineTo(x + width, y - height);
    ctx.stroke();
    ctx.restore();
}

// LEDGE
function drawLedge(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
) {
    ctx.save();
    ctx.fillStyle = "#888";
    ctx.fillRect(x, y - height, width, height);
    ctx.fillStyle = "#aaa";
    ctx.fillRect(x, y - height - 10, width, 10);
    ctx.restore();
}

// TRASH BINS
function drawBin(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y - height, width, height, 4);
    ctx.fill();
    ctx.fillStyle = "#222";
    ctx.fillRect(x + 5, y - height - 8, width - 10, 6);
    ctx.restore();
}

// STAIRS
function drawStairs(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
) {
    ctx.save();
    const steps = 5;
    const stepHeight = height / steps;

    ctx.fillStyle = "#999";

    for (let i = 0; i < steps; i++) {
        ctx.fillRect(
            x,
            y - height + i * stepHeight,
            width,
            stepHeight - 2
        );
    }

    ctx.restore();
}

// RAMP (Quarterpipe)
function drawRamp(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
) {
    ctx.save();

    ctx.fillStyle = "#666";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + width * 0.6, y - height, x + width, y - height);
    ctx.lineTo(x + width, y);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

// GAP
function drawGap(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
) {
    ctx.save();
    ctx.fillStyle = "#222";
    ctx.fillRect(x, y, width, 12);
    ctx.restore();
}

//
// ---------------------------------------------------------
//  COLLECTIBLES RENDERING (Coins, Gems)
// ---------------------------------------------------------
//

export function drawCollectible(
    ctx: CanvasRenderingContext2D,
    c: {
        x: number;
        y: number;
        type: string;
        radius: number;
        frame: number;
    }
) {
    ctx.save();

    const { x, y, radius, type, frame } = c;

    switch (type) {

        // -----------------------------
        // 🟡 COIN (Rotating effect)
        // -----------------------------
        case "coin":
            drawCoin(ctx, x, y, radius, frame);
            break;

        // -----------------------------
        // 🔷 GEM (Shining)
        // -----------------------------
        case "gem":
            drawGem(ctx, x, y, radius, frame);
            break;

        default:
            drawCoin(ctx, x, y, radius, frame);
            break;
    }

    ctx.restore();
}

function drawCoin(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    frame: number
) {
    ctx.save();

    // Rotation scale effect
    const wobble = Math.sin(frame * 0.15) * 0.4 + 1;

    ctx.translate(x, y);
    ctx.scale(wobble, 1);

    const gradient = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r);
    gradient.addColorStop(0, "#fff7a1");
    gradient.addColorStop(1, "#d4a537");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Rim
    ctx.strokeStyle = "#b48729";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
}

function drawGem(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    frame: number
) {
    ctx.save();

    // Flickering shine
    const glow = 0.5 + Math.sin(frame * 0.2) * 0.5;

    ctx.shadowColor = `rgba(0, 255, 255, ${0.6 + glow * 0.4})`;
    ctx.shadowBlur = 12 + glow * 10;

    ctx.fillStyle = "#4ef2ff";
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r * 0.6, y - r * 0.3);
    ctx.lineTo(x + r * 0.4, y + r * 0.8);
    ctx.lineTo(x - r * 0.4, y + r * 0.8);
    ctx.lineTo(x - r * 0.6, y - r * 0.3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

//
// ---------------------------------------------------------
//  PARTICLE EFFECTS
//  (Dust clouds, sparks when grinding, landing impact)
// ---------------------------------------------------------
//

export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    alpha: number;
    size: number;
    color: string;
}

export function drawParticles(
    ctx: CanvasRenderingContext2D,
    particles: Particle[]
) {
    ctx.save();

    for (const p of particles) {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

//
// ---------------------------------------------------------
//  SHADOWS
// ---------------------------------------------------------
//

export function drawPlayerShadow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    alpha: number
) {
    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    ctx.ellipse(x, y, 35 * scale, 10 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

//
// ---------------------------------------------------------
//  UNDERWORLD BACKGROUND
// ---------------------------------------------------------
//

export function drawUnderworld(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scrollX: number
) {
    ctx.save();

    // Base deep gradient
    const g = ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, "#090909");
    g.addColorStop(1, "#1c1c1c");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    // Moving glowing orbs (creepy underworld vibe)
    for (let i = 0; i < 6; i++) {
        const ox = (i * 300 - scrollX * 0.3) % (width + 200) - 100;
        const oy = height * 0.4 + Math.sin((scrollX + i * 200) * 0.002) * 40;

        ctx.fillStyle = `rgba(255,0,100,0.1)`;
        ctx.beginPath();
        ctx.arc(ox, oy, 90, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

//
// ---------------------------------------------------------
//  UNDERWORLD TRANSITION PIPE
// ---------------------------------------------------------
//

export function drawTransitionPipe(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    rotation: number,
    progress: number // 0 to 1 for the animation
) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    const length = 250 * progress;

    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.roundRect(0, -40, length, 80, 20);
    ctx.fill();

    // Glow effect at the entrance
    ctx.shadowColor = "rgba(255,0,100,0.6)";
    ctx.shadowBlur = 25;

    ctx.fillStyle = "#ff0066";
    ctx.fillRect(-10, -50, 20, 100);

    ctx.restore();
}

//
// ---------------------------------------------------------
//  DUST TRAILS (When landing or riding fast)
// ---------------------------------------------------------
//

export interface DustTrailState {
    x: number;
    y: number;
    life: number;     // decreases from 1 → 0
    size: number;
}

export function drawDustTrails(
    ctx: CanvasRenderingContext2D,
    trails: DustTrailState[]
) {
    ctx.save();

    for (const t of trails) {
        ctx.globalAlpha = t.life * 0.4;
        ctx.fillStyle = "rgba(200,200,200,0.9)";

        ctx.beginPath();
        ctx.ellipse(t.x, t.y, t.size, t.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

//
// ---------------------------------------------------------
//  GRINDING SPARKS
// ---------------------------------------------------------
//

export interface Spark {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;    // 1 → 0
}

export function drawSparks(
    ctx: CanvasRenderingContext2D,
    sparks: Spark[]
) {
    ctx.save();

    ctx.fillStyle = "#ffdd55";

    for (const s of sparks) {
        ctx.globalAlpha = s.life;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

//
// ---------------------------------------------------------
//  SPEED TRAIL EFFECTS
//  (Behind the player when moving very fast)
// ---------------------------------------------------------
//

export interface SpeedTrail {
    x: number;
    y: number;
    alpha: number;
    length: number;
}

export function drawSpeedTrails(
    ctx: CanvasRenderingContext2D,
    trails: SpeedTrail[]
) {
    ctx.save();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    for (const t of trails) {
        ctx.globalAlpha = t.alpha;
        ctx.beginPath();
        ctx.moveTo(t.x, t.y);
        ctx.lineTo(t.x - t.length, t.y);
        ctx.stroke();
    }

    ctx.restore();
}

//
// ---------------------------------------------------------
//  ADVANCED PLAYER ANIMATION HELPERS
// ---------------------------------------------------------
//

export function applyPlayerLean(
    ctx: CanvasRenderingContext2D,
    lean: number      // -1 (left) to +1 (right)
) {
    ctx.rotate(lean * 0.15);
}

export function applyManualPose(
    ctx: CanvasRenderingContext2D,
    manualLean: number,
    isManual: boolean
) {
    if (!isManual) return;

    // subtle manual lean animation
    ctx.rotate(manualLean * 0.1);
}

export function applyNatasSpin(
    ctx: CanvasRenderingContext2D,
    active: boolean,
    rotation: number
) {
    if (!active) return;
    ctx.rotate(rotation * Math.PI / 180);
}

//
// ---------------------------------------------------------
//  COMMON UTILITY HELPERS
// ---------------------------------------------------------
//

export function degToRad(d: number) {
    return d * Math.PI / 180;
}

export function drawCenteredText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    color: string,
    size: number = 32
) {
    ctx.save();
    ctx.font = `${size}px Arial`;
    ctx.textAlign = "center";
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
}

//
// ---------------------------------------------------------
//  EXPORT BUNDLE — MAKE ALL HELPERS AVAILABLE
// ---------------------------------------------------------
//

export const Renderer = {
    drawParallaxCity,
    drawUnderworld,
    drawTransitionPipe,

    drawObstacle,
    drawBasicObstacle,

    drawPlayer,
    drawPlayerShadow,

    drawCollectible,
    drawParticles,
    drawDustTrails,
    drawSparks,
    drawSpeedTrails,

    applyPlayerLean,
    applyManualPose,
    applyNatasSpin,

    drawCenteredText,
    degToRad,
};

