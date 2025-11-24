//------------------------------------------------------------
//  INVERT THE GAME – CLEAN ENGINE CORE (AUTO-RUN)
//------------------------------------------------------------

import { PlayerRenderer } from "./rendering/PlayerRenderer";
import { GroundRenderer } from "./rendering/GroundRenderer";
import { BackgroundRenderer } from "./rendering/BackgroundRenderer";
import { ObstacleRenderer } from "./rendering/ObstacleRenderer";
import { CoinRenderer } from "./rendering/CoinRenderer";

//------------------------------------------------------------
//  CANVAS + CONTEXT
//------------------------------------------------------------
export function startGameLoop(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    //--------------------------------------------------------
    //  FULLSCREEN MODE
    //--------------------------------------------------------
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    //--------------------------------------------------------
    // CONSTANTS
    //--------------------------------------------------------
    const GROUND_Y = canvas.height * 0.78;
    const PLAYER_SCALE = 0.35;
    const SPEED = 6;

    //--------------------------------------------------------
    // INITIALIZE RENDERERS
    //--------------------------------------------------------
    const background = new BackgroundRenderer(canvas, ctx);
    const ground = new GroundRenderer(canvas, ctx, GROUND_Y);

    const player = new PlayerRenderer(
        canvas,
        ctx,
        GROUND_Y,
        PLAYER_SCALE,
        8,      // RUN FPS
        4       // PUSH FPS
    );

    const obstacleRenderer = new ObstacleRenderer(canvas, ctx);
    const coinRenderer = new CoinRenderer(canvas, ctx);

    //--------------------------------------------------------
    // GAME STATE
    //--------------------------------------------------------
    let obstacles: any[] = [];
    let coins: any[] = [];
    let lastObstacle = 0;
    let lastCoin = 0;
    let time = 0;

    //--------------------------------------------------------
    // GENERATION HELPERS
    //--------------------------------------------------------
    function spawnObstacle() {
        obstacles.push({
            x: canvas.width + 50,
            y: GROUND_Y - 60,
            width: 50,
            height: 50,
        });
    }

    function spawnCoin() {
        coins.push({
            x: canvas.width + 50,
            y: GROUND_Y - 150 - Math.random() * 40,
            size: 40,
        });
    }

    //--------------------------------------------------------
    // COLLISION
    //--------------------------------------------------------
    function checkCollision(a: any, b: any) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    //--------------------------------------------------------
    // GAME LOOP
    //--------------------------------------------------------
    function loop(timestamp: number) {
        const delta = timestamp - time;
        time = timestamp;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //----------------------------------------------------
        //  RENDER BACKGROUND + GROUND
        //----------------------------------------------------
        background.render(delta);
        ground.render(delta);

        //----------------------------------------------------
        //  PLAYER UPDATE
        //----------------------------------------------------
        player.update(delta);
        player.render();

        //----------------------------------------------------
        //  SPAWN OBSTACLES
        //----------------------------------------------------
        if (timestamp - lastObstacle > 1800) {
            spawnObstacle();
            lastObstacle = timestamp;
        }

        //----------------------------------------------------
        //  SPAWN COINS
        //----------------------------------------------------
        if (timestamp - lastCoin > 1200) {
            spawnCoin();
            lastCoin = timestamp;
        }

        //----------------------------------------------------
        //  UPDATE OBSTACLES
        //----------------------------------------------------
        obstacles = obstacles.filter((obs) => {
            obs.x -= SPEED;

            obstacleRenderer.render(obs.x, obs.y);

            const playerBox = player.getHitbox();
            if (checkCollision(playerBox, { x: obs.x, y: obs.y, width: 50, height: 50 })) {
                console.log("❌ HIT OBSTACLE");
            }

            return obs.x > -200;
        });

        //----------------------------------------------------
        //  UPDATE COINS
        //----------------------------------------------------
        coins = coins.filter((coin) => {
            coin.x -= SPEED;

            coinRenderer.render(coin.x, coin.y);

            const playerBox = player.getHitbox();
            if (
                playerBox.x < coin.x + coin.size &&
                playerBox.x + playerBox.width > coin.x &&
                playerBox.y < coin.y + coin.size &&
                playerBox.y + playerBox.height > coin.y
            ) {
                console.log("⭐ COIN COLLECTED");
                return false;
            }

            return coin.x > -200;
        });

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}
