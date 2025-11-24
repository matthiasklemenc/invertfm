/* ============================================================================
   CLEAN + STABLE GAME LOOP ENGINE (VERSION B)
   Auto-runner, fullscreen, correct sprite placement.
   ============================================================================ */

import { PlayerRenderer } from "../rendering/PlayerRenderer";
import { GroundRenderer } from "../rendering/GroundRenderer";
import { BackgroundRenderer } from "../rendering/BackgroundRenderer";
import { ObstacleRenderer } from "../rendering/ObstacleRenderer";
import { CoinRenderer } from "../rendering/CoinRenderer";

export class GameLoop {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    running = false;
    lastTime = 0;

    /* ---------------- Player ---------------- */
    player = {
        x: 180,
        y: 0,
        width: 140,
        height: 180,
        vy: 0,
        grounded: true,
        animFrame: 0,
        animTime: 0,
        mode: "run" as "run" | "push" | "idle",
    };

    /* ---------------- World ---------------- */
    groundY = 0;
    scrollSpeed = 6;

    obstacles: any[] = [];
    coins: any[] = [];

    /* ---------------- Renderers ---------------- */
    playerRenderer: PlayerRenderer;
    groundRenderer: GroundRenderer;
    backgroundRenderer: BackgroundRenderer;
    obstacleRenderer: ObstacleRenderer;
    coinRenderer: CoinRenderer;

    constructor(canvas: HTMLCanvasElement, characterId: string) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;

        this.groundY = canvas.height - 140;

        this.playerRenderer = new PlayerRenderer();
        this.groundRenderer = new GroundRenderer();
        this.backgroundRenderer = new BackgroundRenderer();
        this.obstacleRenderer = new ObstacleRenderer();
        this.coinRenderer = new CoinRenderer();

        this.spawnInitialObjects();
    }

    /* ============================================================================
       INIT TEST OBJECTS
       ============================================================================ */
    spawnInitialObjects() {
        // obstacles
        this.obstacles = [
            { x: 900, y: this.groundY - 80, width: 60, height: 80 },
            { x: 1500, y: this.groundY - 100, width: 80, height: 100 },
        ];

        // coins
        this.coins = [
            { x: 700, y: this.groundY - 150 },
            { x: 1150, y: this.groundY - 160 },
            { x: 1550, y: this.groundY - 140 },
        ];
    }

    /* ============================================================================
       PUBLIC API
       ============================================================================ */
    resetGame() {
        this.player.y = this.groundY - this.player.height;
        this.player.vy = 0;
        this.player.grounded = true;
        this.player.mode = "run";
        this.player.animFrame = 0;
        this.player.animTime = 0;

        this.spawnInitialObjects();
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
       UPDATE WORLD
       ============================================================================ */
    update(dt: number) {
        /* ----- Gravity + Ground ----- */
        if (!this.player.grounded) {
            this.player.vy += 2000 * dt;
        }

        this.player.y += this.player.vy * dt;

        if (this.player.y + this.player.height >= this.groundY) {
            this.player.y = this.groundY - this.player.height;
            this.player.vy = 0;
            this.player.grounded = true;
        }

        /* ----- Animation ----- */
        this.player.animTime += dt;

        let frameDuration =
            this.player.mode === "run" ? 1 / 8 : 1 / 4; // run=8fps, push=4fps

        if (this.player.animTime >= frameDuration) {
            this.player.animFrame++;
            this.player.animTime = 0;

            if (this.player.mode === "run" && this.player.animFrame >= 4)
                this.player.animFrame = 0;

            if (this.player.mode === "push" && this.player.animFrame >= 2)
                this.player.animFrame = 0;
        }

        /* ----- Scroll World ----- */
        this.obstacles.forEach((o) => (o.x -= this.scrollSpeed));
        this.coins.forEach((c) => (c.x -= this.scrollSpeed));
    }

    /* ============================================================================
       RENDER
       ============================================================================ */
    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        /* background */
        this.backgroundRenderer.render(ctx);

        /* ground */
        this.groundRenderer.render(ctx, this.groundY);

        /* obstacles */
        this.obstacleRenderer.render(ctx, this.obstacles);

        /* coins */
        this.coinRenderer.render(ctx, this.coins);

        /* player */
        this.playerRenderer.render(ctx, this.player, 16.66); // 16ms ~ 60fps
    }
}
