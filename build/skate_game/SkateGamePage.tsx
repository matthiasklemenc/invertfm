import React, { useEffect, useRef, useState } from "react";

import { createGameLoop } from "./engine/game-loop";
import { createPhysicsWorld, createPlayerPhysics, physicsUpdate } from "./engine/physics";
import { createObstacleManager } from "./engine/obstacles";
import { createCollectibleManager } from "./engine/collectibles";
import { createPlayerActions } from "./engine/player-actions";

import { Renderer } from "./DrawingHelpers";
import { SoundManager } from "./SoundManager";

// ------------------------------------------------------------
//  MAIN GAME COMPONENT
// ------------------------------------------------------------
export default function SkateGamePage() {

    // Canvas references
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Loop + engine states
    const loopRef = useRef<any>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    // Engine systems
    const worldRef = useRef<any>(null);
    const playerRef = useRef<any>(null);
    const obstaclesRef = useRef<any>(null);
    const collectiblesRef = useRef<any>(null);
    const actionsRef = useRef<any>(null);

    // HUD states
    const [score, setScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // handle screen resize
    const resizeCanvas = () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const rect = container.getBoundingClientRect();

        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;

        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            ctxRef.current = ctx;
        }
    };

    // ------------------------------------------------------------
    // INITIALIZATION
    // ------------------------------------------------------------
    const initGame = () => {

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctxRef.current = ctx;

        // Create game loop
        const loop = createGameLoop();
        loopRef.current = loop;

        // Create world + player
        const world = createPhysicsWorld();
        worldRef.current = world;

        const player = createPlayerPhysics();
        playerRef.current = player;

        // Managers
        const obstacles = createObstacleManager(world.groundY, canvas.width);
        obstaclesRef.current = obstacles;

        const collectibles = createCollectibleManager(world.groundY, canvas.width);
        collectiblesRef.current = collectibles;

        const actions = createPlayerActions(player);
        actionsRef.current = actions;

        // Sounds
        SoundManager.init();

        // Hook update callback
        loop.onUpdate((dt: number) => {
            if (isPaused) return;
            updateGame(dt);
        });

        // Hook render callback
        loop.onRender((ctx: CanvasRenderingContext2D) => {
            if (!ctx) return;
            renderGame(ctx);
        });

        loop.setContext(ctx);
        loop.start();
    };

    // ------------------------------------------------------------
    // GAME UPDATE
    // ------------------------------------------------------------
    const updateGame = (dt: number) => {
        const player = playerRef.current;
        const world = worldRef.current;
        const obstacles = obstaclesRef.current;
        const collectibles = collectiblesRef.current;
        const actions = actionsRef.current;

        // Physics
        physicsUpdate(player, world, dt);

        // Actions
        actions.update(dt);

        // Obstacles
        obstacles.spawn(dt * 1000);
        obstacles.update(dt);

        // Collectibles
        collectibles.spawn(dt);
        collectibles.update(dt);

        // Pickup scoring
        const gained = collectibles.tryPickup(
            player.x,
            player.y - player.height / 2,
            24
        );

        if (gained > 0) {
            setScore((s) => s + gained);
            SoundManager.play("coin");
        }

        // Death condition
        const hit = obstacles.obstacles.some((o: any) => {
            return o.type === "gap" && player.y > world.groundY + 40;
        });

        if (hit) {
            resetGame();
        }

        // Landing checks
        if (player.grounded) {
            actions.handleLanding();
        }
    };

    // ------------------------------------------------------------
    // GAME RENDER
    // ------------------------------------------------------------
    const renderGame = (ctx: CanvasRenderingContext2D) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const w = canvas.clientWidth;
        const h = canvas.clientHeight;

        // Clear
        ctx.clearRect(0, 0, w, h);

        // Background
        Renderer.drawParallaxCity(ctx, playerRef.current.x, w, h);

        // Obstacles
        for (const o of obstaclesRef.current.obstacles) {
            Renderer.drawObstacle(ctx, o);
        }

        // Collectibles
        for (const c of collectiblesRef.current.items) {
            Renderer.drawCollectible(ctx, c);
        }

        // Shadow
        Renderer.drawPlayerShadow(
            ctx,
            playerRef.current.x,
            worldRef.current.groundY + 5,
            1,
            0.5
        );

        // Player
        Renderer.drawPlayer(ctx, playerRef.current, 1);
    };

    // ------------------------------------------------------------
    // RESET GAME
    // ------------------------------------------------------------
    const resetGame = () => {
        setScore(0);
        const player = createPlayerPhysics();
        playerRef.current = player;
        obstaclesRef.current.reset();
        collectiblesRef.current.reset();
    };


    // ------------------------------------------------------------
    // EFFECT — INITIAL MOUNT
    // ------------------------------------------------------------
    useEffect(() => {
        resizeCanvas();
        initGame();
        window.addEventListener("resize", resizeCanvas);

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            loopRef.current?.stop();
        };
    }, []);

    // ------------------------------------------------------------
    // CONTROLS — Keyboard
    // ------------------------------------------------------------
    const handleKeyDown = (e: KeyboardEvent) => {
        const actions = actionsRef.current;
        if (!actions) return;

        switch (e.code) {
            case "Space":
            case "ArrowUp":
            case "KeyW":
                actions.jump();
                break;

            case "KeyF": // flip trick
            case "ArrowLeft":
                actions.flip();
                break;

            case "KeyM": // manual
                actions.startManual(-1);
                break;

            case "KeyN": // nose manual
                actions.startManual(1);
                break;

            case "KeyS": // natas
                actions.startNatas();
                break;

            case "Escape":
                togglePause();
                break;
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        const actions = actionsRef.current;
        if (!actions) return;

        switch (e.code) {
            case "KeyM":
            case "KeyN":
                actions.stopManual();
                break;

            case "KeyS":
                actions.stopNatas();
                break;
        }
    };

    // ------------------------------------------------------------
    // CONTROLS — Touch (Mobile)
    // ------------------------------------------------------------
    const leftTouch  = useRef(false);
    const rightTouch = useRef(false);
    const jumpTouch  = useRef(false);

    const handleTouchStart = (e: TouchEvent) => {
        const touch = e.changedTouches[0];
        const x = touch.clientX;
        const screenW = window.innerWidth;

        const actions = actionsRef.current;

        // LEFT side = flip
        if (x < screenW * 0.33) {
            leftTouch.current = true;
            actions.flip();
            SoundManager.play("tap");
            return;
        }

        // RIGHT side = jump
        if (x > screenW * 0.66) {
            rightTouch.current = true;
            actions.jump();
            SoundManager.play("jump");
            return;
        }

        // CENTER = manual
        jumpTouch.current = true;
        actions.startManual(1);
        SoundManager.play("tap");
    };

    const handleTouchEnd = (e: TouchEvent) => {
        const actions = actionsRef.current;

        if (leftTouch.current) {
            leftTouch.current = false;
        }

        if (rightTouch.current) {
            rightTouch.current = false;
        }

        if (jumpTouch.current) {
            jumpTouch.current = false;
            actions.stopManual();
        }
    };

    // ------------------------------------------------------------
    // CONTROL HOOK
    // ------------------------------------------------------------
    useEffect(() => {
        // keyboard
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        // mobile touch
        window.addEventListener("touchstart", handleTouchStart);
        window.addEventListener("touchend", handleTouchEnd);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);

            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, []);

    // ------------------------------------------------------------
    // PAUSE / RESUME / EXIT LOGIC
    // ------------------------------------------------------------
    const togglePause = () => {
        setIsPaused((p) => {
            const newState = !p;

            if (newState === true) {
                SoundManager.pauseMusic?.();
            } else {
                SoundManager.resumeMusic?.();
            }

            return newState;
        });
    };

    const exitGame = () => {
        // reset state
        loopRef.current?.stop();
        SoundManager.stopAll?.();
        window.history.back();   // navigate to previous page
    };

    // ------------------------------------------------------------
    // PAUSE OVERLAY RENDERING
    // ------------------------------------------------------------
    const PauseOverlay = () => {
        if (!isPaused) return null;

        return (
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "100%",
                    height: "100%",
                    backdropFilter: "blur(4px)",
                    background: "rgba(0,0,0,0.45)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 30,
                }}
            >
                <div
                    style={{
                        background: "rgba(30,30,30,0.9)",
                        border: "2px solid #fff",
                        borderRadius: 12,
                        padding: "25px 40px",
                        textAlign: "center",
                        color: "white",
                        fontSize: 28,
                        width: "70%",
                        maxWidth: 380,
                    }}
                >
                    <div style={{ marginBottom: 20, fontWeight: "bold", fontSize: 32 }}>
                        GAME PAUSED
                    </div>

                    <button
                        onClick={togglePause}
                        style={{
                            width: "100%",
                            marginBottom: 15,
                            padding: "12px 0",
                            background: "#ffffff",
                            color: "#000",
                            borderRadius: 8,
                            fontSize: 22,
                            fontWeight: "bold",
                            cursor: "pointer",
                            border: "none",
                        }}
                    >
                        Resume
                    </button>

                    <button
                        onClick={resetGame}
                        style={{
                            width: "100%",
                            marginBottom: 15,
                            padding: "12px 0",
                            background: "#ff9800",
                            color: "#000",
                            borderRadius: 8,
                            fontSize: 22,
                            cursor: "pointer",
                            border: "none",
                        }}
                    >
                        Restart
                    </button>

                    <button
                        onClick={exitGame}
                        style={{
                            width: "100%",
                            padding: "12px 0",
                            background: "#ef233c",
                            color: "white",
                            borderRadius: 8,
                            fontSize: 22,
                            cursor: "pointer",
                            border: "none",
                        }}
                    >
                        Exit
                    </button>
                </div>
            </div>
        );
    };

    // ------------------------------------------------------------
    // HUD (Score + Pause button)
    // ------------------------------------------------------------
    const HUD = () => {
        return (
            <div
                style={{
                    position: "absolute",
                    top: 10,
                    left: 0,
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0 15px",
                    zIndex: 20,
                    pointerEvents: "none",
                }}
            >
                {/* Score */}
                <div
                    style={{
                        color: "white",
                        fontSize: 28,
                        fontWeight: "bold",
                        textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
                        pointerEvents: "none",
                    }}
                >
                    {score}
                </div>

                {/* Pause button */}
                <button
                    onClick={togglePause}
                    style={{
                        pointerEvents: "auto",
                        background: "rgba(255,255,255,0.85)",
                        borderRadius: 10,
                        padding: "8px 14px",
                        fontSize: 20,
                        fontWeight: "bold",
                        border: "2px solid #000",
                        cursor: "pointer",
                    }}
                >
                    ||
                </button>
            </div>
        );
    };

    // ------------------------------------------------------------
    // FINAL JSX LAYOUT
    // ------------------------------------------------------------
    return (
        <div
            ref={containerRef}
            style={{
                position: "relative",
                width: "100%",
                height: "100vh",
                overflow: "hidden",
                background: "#111",
                touchAction: "none",
            }}
        >
            {/* Canvas */}
            <canvas
                ref={canvasRef}
                style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    background: "#000",
                }}
            />

            {/* HUD (Score + Pause Button) */}
            <HUD />

            {/* Pause Overlay */}
            <PauseOverlay />

            {/* Touch Control Regions (mobile) */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "33%",
                    height: "100%",
                    zIndex: 10,
                    pointerEvents: "none",
                }}
            />

            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: "33%",
                    width: "34%",
                    height: "100%",
                    zIndex: 10,
                    pointerEvents: "none",
                }}
            />

            <div
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "33%",
                    height: "100%",
                    zIndex: 10,
                    pointerEvents: "none",
                }}
            />
        </div>
    );
}

// ------------------------------------------------------------
//  FINAL CLEANUP & SAFETY HOOKS
// ------------------------------------------------------------

// Prevent mobile scrolling while touching controls
useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
        e.preventDefault();
    };

    document.body.style.overscrollBehavior = "none";
    document.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
        document.removeEventListener("touchmove", preventScroll);
        document.body.style.overscrollBehavior = "";
    };
}, []);

// Stabilize pixel ratio changes on mobile (e.g. zoom glitches)
useEffect(() => {
    const handlePixelRatio = () => {
        resizeCanvas();
    };

    window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
        .addEventListener("change", handlePixelRatio);

    return () => {
        window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
            .removeEventListener("change", handlePixelRatio);
    };
}, []);

// Ensure audio unlock on mobile Safari
useEffect(() => {
    const handler = () => {
        SoundManager.unlock?.();
        window.removeEventListener("touchstart", handler);
        window.removeEventListener("mousedown", handler);
    };

    window.addEventListener("touchstart", handler);
    window.addEventListener("mousedown", handler);

    return () => {
        window.removeEventListener("touchstart", handler);
        window.removeEventListener("mousedown", handler);
    };
}, []);

// Extra: prevent ESC from breaking the canvas focus on desktop
useEffect(() => {
    const escHandler = (e: KeyboardEvent) => {
        if (e.code === "Escape") {
            e.preventDefault();
        }
    };

    window.addEventListener("keydown", escHandler);

    return () => {
        window.removeEventListener("keydown", escHandler);
    };
}, []);

