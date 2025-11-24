/* ============================================================================
   CLEAN + STABLE GAME LOOP ENGINE (2025)
   Compatible with your current renderers + sprite set
   ============================================================================ */

import { PlayerRenderer } from "./rendering/PlayerRenderer";
import { GroundRenderer } from "./rendering/GroundRenderer";
import { BackgroundRenderer } from "./rendering/BackgroundRenderer";
import { ObstacleRenderer } from "./rendering/ObstacleRenderer";
import { CoinRenderer } from "./rendering/CoinRenderer";

export class GameLoop {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    running = false;
    lastTime = 0;

    /* ---------------- Player State ---------------- */
    player = {
        x: 160,
        y: 0,
        vy: 0,
        width: 80,
        height: 120,
        grounded: true,
        animTime: 0,
        animFrame: 0,
        mode: "idle" as "idle" | "run" | "push",
        characterId: "kai",
    };

    /* ---------------- World State ---------------- */
    groundY = 0;
    scrollSpeed = 6;

    obstacles: any[] = [];
    coins: any[] = [];

    /* ---------------- Renderer Instances ---------------- */
    playerRenderer: PlayerRenderer;
    groundRenderer: GroundRenderer;
    backgroundRenderer: BackgroundRenderer;
    obstacleRenderer: ObstacleRenderer;
    coinRenderer: CoinRenderer;

    constructor(canvas: HTMLCanvasElement, initialCharacter: string) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.groundY = canvas.height - 140;

        this.player.characterId = initialCharacter;

        this.playerRenderer = new PlayerRenderer();
        this.groundRenderer = new GroundRenderer();
        this.backgroundRenderer = new BackgroundRenderer();
        this.obstacleRenderer = new ObstacleRenderer();
        this.coinRenderer = new CoinRenderer();

        this.spawnTestObjects();
    }

    /* ============================================================================
       PUBLIC API
       ============================================================================ */

    setCharacter(id: string) {
        this.player.characterId = id;
    }

    resetGame() {
        this.player.x = 160;
        this.player.vy = 0;
        this.player.mode = "idle";
        this.player.animTime = 0;
        this.obstacles = [];
        this.coins = [];
        this.spawnTestObjects();
    }

    start() {
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    stop() {
        this.running = false;
    }

    /* ============================================================================
       TEMP OBJECTS (UNTIL YOU PROVIDE REAL LEVEL GENERATION)
       ============================================================================ */
    spawnTestObjects() {
        this.obstacles.push({ x: 900, y: this.groundY - 80, width: 60, height: 80 });
        this.obstacles.push({ x: 1500, y: this.groundY - 100, width: 80, height: 100 });

        this.coins.push({ x: 700, y: this.groundY - 145 });
        this.coins.push({ x: 1150, y: this.groundY - 160 });
        this.coins.push({ x: 1550, y: this.groundY - 140 });
    }

    /* ============================================================================
       MAIN LOOP
       ============================================================================ */
    loop(time: number) {
        if (!this.running) return;

        const dt = (time - this.lastTime) / 1000;
        this.lastTime = time;

        this.update(dt);
        this.render();

        requestAnimationFrame((t) => this.loop(t));
    }

    /* ============================================================================
       UPDATE
       ============================================================================ */
    update(dt: number) {
        /* -------- PLAYER GRAVITY -------- */
        if (!this.player.grounded) {
            this.player.vy += 2000 * dt;
        }

        this.player.y += this.player.vy * dt;

        if (this.player.y + this.player.height >= this.groundY) {
            this.player.y = this.groundY - this.player.height;
            this.player.vy = 0;
            this.player.grounded = true;
        }

        /* -------- ANIMATION (idle, run, push) -------- */
        this.player.animTime += dt;

        if (this.player.mode === "run") {
            const frameDuration = 1 / 8; // 8 FPS
            if (this.player.animTime >= frameDuration) {
                this.player.animFrame = (this.player.animFrame + 1) % 4; // 4 run frames
                this.player.animTime = 0;
            }
        }

        if (this.player.mode === "push") {
            const frameDuration = 1 / 4; // 4 FPS
            if (this.player.animTime >= frameDuration) {
                this.player.animFrame = (this.player.animFrame + 1) % 2; // 2 push frames
                this.player.animTime = 0;
            }
        }

        if (this.player.mode === "idle") {
            this.player.animFrame = 0;
        }

        /* -------- WORLD SCROLL -------- */
        this.obstacles.forEach((o) => {
            o.x -= this.scrollSpeed;
        });

        this.coins.forEach((c) => {
            c.x -= this.scrollSpeed;
        });
    }

    /* ============================================================================
       RENDER
       ============================================================================ */
    render() {
        const ctx = this.ctx;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        /* -------- BACKGROUND -------- */
        this.backgroundRenderer.render(ctx, this.scrollSpeed);

        /* -------- GROUND -------- */
        this.groundRenderer.render(ctx, this.groundY);

        /* -------- OBSTACLES -------- */
        this.obstacleRenderer.render(ctx, this.obstacles);

        /* -------- COINS -------- */
        this.coinRenderer.render(ctx, this.coins);

        /* -------- PLAYER -------- */
        this.playerRenderer.render(
            ctx,
            this.player,
            this.player.characterId,
            this.player.mode,
            this.player.animFrame
        );
    }
}
