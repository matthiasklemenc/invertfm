/* ============================================================================
   FULL GAME LOOP ENGINE — INVERT FM SKATE GAME
   File: /build/skate_game/engine/game-loop.ts
   Complete rebuild (2025)
   ============================================================================ */

import { PlayerRenderer } from "./rendering/PlayerRenderer";
import { GroundRenderer } from "./rendering/GroundRenderer";
import { BackgroundRenderer } from "./rendering/BackgroundRenderer";
import { ObstacleRenderer } from "./rendering/ObstacleRenderer";
import { CoinRenderer } from "./rendering/CoinRenderer";

import { loadImage } from "./assetLoader";
import { generateObstacles } from "./obstacles";
import { generateCollectibles } from "./collectibles";

/* ============================================================================
   CONSTANTS
   ============================================================================ */

const GRAVITY = 2400;
const JUMP_VELOCITY = -900;
const PLAYER_SPEED = 420;
const MAX_FALL_SPEED = 1400;

const AUTO_PUSH_INTERVAL = 10;
const AUTO_PUSH_LENGTH = 2;

const UNDERWORLD_DURATION = 10;

const CAMERA_LERP = 0.10;

/* ============================================================================
   GAME LOOP CLASS
   ============================================================================ */

export class GameLoop {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    /* ---------------- RENDERERS ---------------- */
    playerRenderer = new PlayerRenderer();
    groundRenderer = new GroundRenderer();
    bgRenderer = new BackgroundRenderer();
    obstacleRenderer = new ObstacleRenderer();
    coinRenderer = new CoinRenderer();

    /* ---------------- PLAYER STATE ---------------- */
    player = {
        x: 200,
        y: 0,
        vy: 0,
        anim: "run",
        facing: 1,
        onGround: true,
        falling: false,
        spinCount: 1,
        crashType: null as string | null,
        inUnderworld: false,
        underworldTime: 0,
        lives: 3,
        quarterX: 0,
        quarterY: 0
    };

    /* ---------------- WORLD STATE ---------------- */
    obstacles: any[] = [];
    collectibles: any[] = [];
    coins: any[] = [];

    underworldPlatforms: any[] = [];
    underworldLines: any[] = [];
    underworldGenerated = false;

    quarterpipeActive = false;
    quarterpipeTimer = 0;
    quarterpipeImg: HTMLImageElement | null = null;

    /* ---------------- CAMERA ---------------- */
    cameraY = 0;

    /* ---------------- GAME FLOW ---------------- */
    lastTime = 0;
    pushTimer = 0;
    pushActive = false;
    running = false;

    score = 0;
    distance = 0;

    /* ============================================================================
       CONSTRUCTOR
       ============================================================================ */

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;

        window.addEventListener("pointerdown", () => this.handleInput());
        this.loadAssets();
    }

    /* ============================================================================
       LOAD ASSETS
       ============================================================================ */
    async loadAssets() {
        this.quarterpipeImg = await loadImage("/skate_game/assets/quarterpipe_side.png");
    }

    /* ============================================================================
       INPUT
       ============================================================================ */
    handleInput() {
        if (!this.player.inUnderworld) {
            if (this.player.onGround && !this.player.falling) {
                this.player.vy = JUMP_VELOCITY;
                this.player.onGround = false;
                this.player.anim = "ollie";
            }
        } else {
            if (this.player.onGround) {
                this.player.vy = JUMP_VELOCITY;
                this.player.onGround = false;
            }
        }
    }

    /* ============================================================================
       START LOOP
       ============================================================================ */
    start() {
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop);
    }

    loop = (time: number) => {
        if (!this.running) return;

        const dt = (time - this.lastTime) / 1000;
        this.lastTime = time;

        this.update(dt);
        this.render();

        requestAnimationFrame(this.loop);
    };

    /* ============================================================================
       UPDATE (MAIN)
       ============================================================================ */
    update(dt: number) {
        this.updatePushLogic(dt);
        this.updatePhysics(dt);
        this.updateWorldLogic(dt);
        this.updateCamera(dt);

        this.playerRenderer.update(dt, this.player);
    }

    /* ============================================================================
       AUTO PUSH LOGIC
       ============================================================================ */
    updatePushLogic(dt: number) {
        this.pushTimer += dt;

        if (this.pushActive) {
            if (this.pushTimer >= AUTO_PUSH_LENGTH) {
                this.pushActive = false;
                this.player.anim = this.player.onGround ? "run" : "ollie";
                this.pushTimer = 0;
            }
        } else {
            if (this.pushTimer >= AUTO_PUSH_INTERVAL) {
                this.pushActive = true;
                this.pushTimer = 0;
                if (this.player.onGround && !this.player.falling) {
                    this.player.anim = "push";
                }
            }
        }
    }

    /* ============================================================================
       PHYSICS
       ============================================================================ */
    updatePhysics(dt: number) {
        if (!this.player.onGround) {
            this.player.vy += GRAVITY * dt;
            if (this.player.vy > MAX_FALL_SPEED) this.player.vy = MAX_FALL_SPEED;
        }

        this.player.y += this.player.vy * dt;

        if (!this.player.inUnderworld) {
            const groundY = this.canvas.height - 140;
            if (this.player.y >= groundY) {
                this.player.y = groundY;
                this.player.vy = 0;
                this.player.onGround = true;

                if (!this.pushActive && !this.player.falling) {
                    this.player.anim = "run";
                }
            }
        }
    }

    /* ============================================================================
       CAMERA
       ============================================================================ */
    updateCamera(dt: number) {
        const targetY = this.player.y - this.canvas.height * 0.4;
        this.cameraY += (targetY - this.cameraY) * CAMERA_LERP;
    }

    /* ============================================================================
       WORLD LOGIC (MAIN)
       ============================================================================ */

    updateWorldLogic(dt: number) {
        /* --------------------------------------
           WORLD SCROLL / DISTANCE
        -------------------------------------- */
        const scroll = PLAYER_SPEED * dt;
        this.distance += scroll;

        /* --------------------------------------
           OBSTACLE GENERATION
        -------------------------------------- */
        if (this.obstacles.length < 8) {
            const newOnes = generateObstacles(this.distance);
            this.obstacles.push(...newOnes);
        }

        /* --------------------------------------
           MOVE OBSTACLES LEFT
        -------------------------------------- */
        for (const obs of this.obstacles) {
            obs.x -= scroll;
        }

        /* --------------------------------------
           REMOVE OFFSCREEN OBSTACLES
        -------------------------------------- */
        this.obstacles = this.obstacles.filter(o => o.x > -300);

        /* --------------------------------------
           MOVE COLLECTIBLES
        -------------------------------------- */
        for (const c of this.collectibles) {
            c.x -= scroll;
        }

        /* --------------------------------------
           SPAWN NEW COLLECTIBLES
        -------------------------------------- */
        if (this.collectibles.length < 15) {
            const newItems = generateCollectibles(this.distance);
            this.collectibles.push(...newItems);
        }

        /* --------------------------------------
           REMOVE OFFSCREEN COLLECTIBLES
        -------------------------------------- */
        this.collectibles = this.collectibles.filter(c => c.x > -300);

        /* --------------------------------------
           COLLISIONS WITH OBSTACLES
        -------------------------------------- */
        for (const obs of this.obstacles) {
            if (this.checkObstacleCollision(obs)) {
                this.dispatchObstacleCollision(obs);
            }
        }

        /* --------------------------------------
           COLLECTIBLES PICKUP
        -------------------------------------- */
        this.handleCollectibles(dt);

        /* --------------------------------------
           UNDERWORLD LOGIC
        -------------------------------------- */
        if (this.player.inUnderworld) {
            this.updateUnderworld(dt);
        }
    }

    /* ============================================================================
       COLLISION DISPATCHER
       ============================================================================ */
    dispatchObstacleCollision(obs: any) {
        if (obs.type === "hydrant") {
            this.handleHydrantLanding(obs);
            return;
        }

        if (obs.type === "tube_green") {
            this.handleTubeLanding(obs);
            return;
        }

        if (obs.type === "quarterpipe") {
            this.startQuarterpipeEntry(obs);
            return;
        }

        if (obs.type === "truck") {
            this.startCybertruckSequence();
            return;
        }

        // Any other obstacle → crash
        this.playerCrash("default");
    }

    /* ============================================================================
       HANDLE COLLECTIBLES
       ============================================================================ */
    handleCollectibles(dt: number) {
        for (const c of this.collectibles) {
            c.pulse += dt * 2;

            const dx = this.player.x - c.x;
            const dy = this.player.y - c.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < c.radius + 20) {
                if (c.type === "coin") this.addScore(100);
                if (c.type === "diamond") this.addScore(500);
                c.collected = true;
            }
        }

        this.collectibles = this.collectibles.filter(c => !c.collected);
    }

    /* ============================================================================
       QUARTERPIPE ENTRY
       ============================================================================ */
    startQuarterpipeEntry(obs: any) {
        if (this.quarterpipeActive) return;

        this.quarterpipeActive = true;
        this.quarterpipeTimer = 0;

        this.player.quarterX = obs.x;
        this.player.quarterY = this.canvas.height - 140;

        this.player.anim = "ollie";
        this.player.vy = -1400;
        this.player.onGround = false;
    }

    updateQuarterpipe(dt: number) {
        if (!this.quarterpipeActive) return;

        this.quarterpipeTimer += dt;
        const t = this.quarterpipeTimer / 1.2;

        const rise = Math.sin(t * Math.PI * 0.5);
        this.player.y = this.player.quarterY - rise * 420;

        this.playerRenderer.rotation = -Math.PI * 0.4 * rise;

        if (t >= 1) {
            this.quarterpipeActive = false;
            this.playerRenderer.rotation = 0;
            this.player.anim = "run";
            this.player.falling = false;
            this.player.onGround = true;
        }
    }

    /* ============================================================================
       CYBERTRUCK → MARS CUTSCENE (SAFE, NON-BLOCKING)
       ============================================================================ */
    startCybertruckSequence() {
        this.player.crashType = "truck";
        this.player.anim = "crash";

        // Non-blocking stub (keeps game running)
        setTimeout(() => {
            this.player.crashType = null;
            this.player.anim = "run";
        }, 800);
    }

    /* ============================================================================
       CRASH HANDLING
       ============================================================================ */
    playerCrash(type: string) {
        if (this.player.crashType) return;

        this.player.crashType = type;
        this.player.anim = "crash";
        this.player.lives -= 1;

        if (this.player.lives <= 0) {
            this.gameOver();
            return;
        }

        setTimeout(() => {
            this.player.crashType = null;
            this.player.anim = "run";
        }, 900);
    }

    /* ============================================================================
       GAME OVER / RESET
       ============================================================================ */
    gameOver() {
        this.running = false;
    }

    resetGame() {
        this.player.x = 200;
        this.player.y = this.canvas.height - 140;
        this.player.vy = 0;
        this.player.anim = "run";
        this.player.onGround = true;
        this.player.falling = false;
        this.player.lives = 3;
        this.player.inUnderworld = false;
        this.player.underworldTime = 0;

        this.cameraY = 0;
        this.obstacles = [];
        this.collectibles = [];
        this.score = 0;
        this.distance = 0;

        this.running = true;
        this.lastTime = performance.now();
    }

    /* ============================================================================
       UNDERWORLD PLATFORM GENERATION
       ============================================================================ */
    generateUnderworldPlatforms() {
        const lines = [];
        const startY = this.canvas.height - 200;
        const numLines = 18;

        let y = startY;

        for (let i = 0; i < numLines; i++) {
            const gapSize = 120 + Math.random() * 140;
            const platformWidth = 240 + Math.random() * 240;

            lines.push({
                y,
                leftWidth: platformWidth,
                gap: gapSize,
                rightWidth: platformWidth,
            });

            y -= 120;
        }

        this.underworldLines = lines;
    }

    /* ============================================================================
       UNDERWORLD UPDATE LOOP
       ============================================================================ */
    updateUnderworld(dt: number) {
        if (!this.player.inUnderworld) return;

        if (!this.underworldGenerated) {
            this.generateUnderworldPlatforms();
            this.underworldGenerated = true;
            this.player.onGround = false;
            this.player.vy = 0;
        }

        this.player.underworldTime += dt;

        /* ---------------- Move player down ---------------- */
        if (!this.player.onGround) {
            this.player.vy += GRAVITY * 0.4 * dt;
            this.player.y += this.player.vy * dt;
        }

        /* ---------------- Check landing on platforms ---------------- */
        for (const line of this.underworldLines) {
            const top = line.y;
            const px = this.player.x;

            const leftStart = 0;
            const leftEnd = line.leftWidth;

            const rightStart = leftEnd + line.gap;
            const rightEnd = rightStart + line.rightWidth;

            if (this.player.y >= top - 10 && this.player.y <= top + 20) {
                if ((px >= leftStart && px <= leftEnd) ||
                    (px >= rightStart && px <= rightEnd)) {

                    this.player.y = top;
                    this.player.vy = 0;
                    this.player.onGround = true;

                    if (this.player.anim !== "run") this.player.anim = "run";
                }
            }
        }

        /* ---------------- LAVA DEATH ---------------- */
        const lavaY = this.underworldLines[this.underworldLines.length - 1].y + 300;
        if (this.player.y > lavaY) {
            this.handleLavaDeath();
        }

        /* ---------------- TIME TO EXIT ---------------- */
        if (this.player.underworldTime >= UNDERWORLD_DURATION) {
            this.startQuarterpipeExit();
        }
    }

    /* ============================================================================
       HANDLE LAVA DEATH
       ============================================================================ */
    handleLavaDeath() {
        this.player.lives -= 1;

        const nearest = this.underworldLines.find(
            p => this.player.x >= 0 && this.player.x <= p.leftWidth
        );

        if (nearest) {
            this.player.y = nearest.y;
            this.player.vy = 0;
            this.player.onGround = true;
        }

        this.player.anim = "run";
    }

    /* ============================================================================
       QUARTERPIPE EXIT (FROM UNDERWORLD)
       ============================================================================ */
    startQuarterpipeExit() {
        this.player.inUnderworld = false;
        this.player.falling = false;
        this.player.anim = "ollie";
        this.player.underworldTime = 0;

        this.player.vy = -1600;
        this.player.onGround = false;

        this.underworldGenerated = false;
    }

    /* ============================================================================
       SCORE HANDLING
       ============================================================================ */
    addScore(amount: number) {
        this.score += amount;
    }

    /* ============================================================================
       RENDER LOOP
       ============================================================================ */
    render() {
        const ctx = this.ctx;
        ctx.save();

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.translate(0, -this.cameraY);

        /* ---------------- Background ---------------- */
        if (!this.player.inUnderworld)
            this.bgRenderer.render(ctx, this.player);
        else
            this.renderUnderworldBackground(ctx);

        /* ---------------- Ground ---------------- */
        this.groundRenderer.render(ctx, this.player);

        /* ---------------- Obstacles ---------------- */
        this.obstacleRenderer.render(ctx, this.obstacles);

        /* ---------------- Collectibles ---------------- */
        this.coinRenderer.render(ctx, this.collectibles);

        /* ---------------- Quarterpipe image ---------------- */
        if (this.quarterpipeActive && this.quarterpipeImg) {
            ctx.drawImage(
                this.quarterpipeImg,
                this.player.quarterX - this.quarterpipeImg.width / 2,
                this.canvas.height - this.quarterpipeImg.height - 10
            );
        }

        /* ---------------- Player ---------------- */
        this.playerRenderer.render(ctx, this.player);

        ctx.restore();
    }

    /* ============================================================================
       UNDERWORLD BACKGROUND
       ============================================================================ */
    renderUnderworldBackground(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "#1f0020";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillStyle = "#ff0040";
        for (const line of this.underworldLines) {
            ctx.fillRect(0, line.y, line.leftWidth, 8);
            ctx.fillRect(
                line.leftWidth + line.gap,
                line.y,
                line.rightWidth,
                8
            );
        }
    }
}



