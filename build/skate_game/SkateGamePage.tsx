import React, { useEffect, useRef, useState } from "react";

import { createGameLoop } from "./engine/game-loop";
import { createPhysicsWorld, createPlayerPhysics, physicsUpdate } from "./engine/physics";
import { createObstacleManager } from "./engine/obstacles";
import { createCollectibleManager } from "./engine/collectibles";
import { createPlayerActions } from "./engine/player-actions";

import { Renderer } from "./DrawingHelpers";
import { SoundManager } from "./SoundManager";

export default function SkateGamePage() {
    // ------------------------------------------------------------
    // REFS & STATES
    // ------------------------------------------------------------
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const loopRef = useRef<any>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    const worldRef = useRef<any>(null);
    const playerRef = useRef<any>(null);
    const obstaclesRef = useRef<any>(null);
    const collectiblesRef = useRef<any>(null);
    const actionsRef = useRef<any>(null);

    const [score, setScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // ------------------------------------------------------------
    // RESIZE CANVAS
    // ------------------------------------------------------------
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
    // INITIALIZE GAME
    // ------------------------------------------------------------
    const initGame = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctxRef.current = ctx;

        const loop = createGameLoop();
        loopRef.current = loop;

        const world = createPhysicsWorld();
        worldRef.current = world;

        const player = createPlayerPhysics();
        playerRef.current = player;

        const obstacles = createObstacleManager(world.groundY, canvas.width);
        obstaclesRef.current = obstacles;

        const collectibles = createCollectibleManager(world.groundY, canvas.width);
        collectiblesRef.current = collectibles;

        const actions = createPlayerActions(player);
        actionsRef.current = actions;

        SoundManager.init();

        loop.onUpdate((dt: number) => {
            if (!isPaused) updateGame(dt);
        });

        loop.onRender((ctx: CanvasRenderingContext2D) => {
            renderGame(ctx);
        });

        loop.setContext(ctx);
        loop.start();
    };

    // ------------------------------------------------------------
    // UPDATE LOGIC
    // ------------------------------------------------------------
    const updateGame = (dt: number) => {
        const player = playerRef.current;
        const world = worldRef.current;
        const obstacles = obstaclesRef.current;
        const collectibles = collectiblesRef.current;
        const actions = actionsRef.current;

        physicsUpdate(player, world, dt);
        actions.update(dt);

        obstacles.spawn(dt * 1000);
        obstacles.update(dt);

        collectibles.spawn(dt);
        collectibles.update(dt);

        const gained = collectibles.tryPickup(
            player.x,
            player.y - player.height / 2,
            24
        );

        if (gained > 0) {
            setScore((s) => s + gained);
            SoundManager.play("coin");
        }

        if (obstacles.obstacles.some((o: any) => o.type === "gap" && player.y > world.groundY + 40)) {
            resetGame();
        }

        if (player.grounded) actions.handleLanding();
    };

    // ------------------------------------------------------------
    // RENDER GAME
    // ------------------------------------------------------------
    const renderGame = (ctx: CanvasRenderingContext2D) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const w = canvas.clientWidth;
        const h = canvas.clientHeight;

        ctx.clearRect(0, 0, w, h);

        Renderer.drawParallaxCity(ctx, playerRef.current.x, w, h);

        for (const o of obstaclesRef.current.obstacles) {
            Renderer.drawObstacle(ctx, o);
        }

        for (const c of collectiblesRef.current.items) {
            Renderer.drawCollectible(ctx, c);
        }

        Renderer.drawPlayerShadow(
            ctx,
            playerRef.current.x,
            worldRef.current.groundY + 5,
            1,
            0.5
        );

        Renderer.drawPlayer(ctx, playerRef.current, 1);
    };

    // ------------------------------------------------------------
    // RESET GAME
    // ------------------------------------------------------------
    const resetGame = () => {
        setScore(0);
        playerRef.current = createPlayerPhysics();
        obstaclesRef.current.reset();
        collectiblesRef.current.reset();
    };

    // ------------------------------------------------------------
    // PAUSE LOGIC
    // ------------------------------------------------------------
    const togglePause = () => {
        setIsPaused((p) => {
            const newState = !p;
            if (newState) SoundManager.pauseMusic?.();
            else SoundManager.resumeMusic?.();
            return newState;
        });
    };

    const exitGame = () => {
        loopRef.current?.stop();
        SoundManager.stopAll?.();
        window.history.back();
    };

    // ------------------------------------------------------------
    // KEYBOARD CONTROLS
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
            case "ArrowLeft":
            case "KeyF":
                actions.flip();
                break;
            case "KeyM":
                actions.startManual(-1);
                break;
            case "KeyN":
                actions.startManual(1);
                break;
            case "KeyS":
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

        if (e.code === "KeyM" || e.code === "KeyN") actions.stopManual();
        if (e.code === "KeyS") actions.stopNatas();
    };

    // ------------------------------------------------------------
    // TOUCH CONTROLS
    // ------------------------------------------------------------
    const leftTouch = useRef(false);
    const rightTouch = useRef(false);
    const centerTouch = useRef(false);

    const handleTouchStart = (e: TouchEvent) => {
        const x = e.changedTouches[0].clientX;
        const w = window.innerWidth;
        const actions = actionsRef.current;

        if (x < w * 0.33) {
            leftTouch.current = true;
            actions.flip();
            SoundManager.play("tap");
        } else if (x > w * 0.66) {
            rightTouch.current = true;
            actions.jump();
            SoundManager.play("jump");
        } else {
            centerTouch.current = true;
            actions.startManual(1);
        }
    };

    const handleTouchEnd = () => {
        const actions = actionsRef.current;
        leftTouch.current = false;
        rightTouch.current = false;
        if (centerTouch.current) {
            centerTouch.current = false;
            actions.stopManual();
        }
    };

    // ------------------------------------------------------------
    // MOUNT / UNMOUNT
    // ------------------------------------------------------------
    useEffect(() => {
        resizeCanvas();
        initGame();

        window.addEventListener("resize", resizeCanvas);
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("touchstart", handleTouchStart);
        window.addEventListener("touchend", handleTouchEnd);

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchend", handleTouchEnd);
            loopRef.current?.stop();
        };
    }, []);

    // ------------------------------------------------------------
    // FINAL CLEANUP & SAFETY HOOKS (NOW IN CORRECT LOCATION!)
    // ------------------------------------------------------------
    useEffect(() => {
        const preventScroll = (e: TouchEvent) => e.preventDefault();
        document.body.style.overscrollBehavior = "none";
        document.addEventListener("touchmove", preventScroll, { passive: false });

        return () => {
            document.removeEventListener("touchmove", preventScroll);
            document.body.style.overscrollBehavior = "";
        };
    }, []);

    useEffect(() => {
        const onRatio = () => resizeCanvas();
        const mql = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
        mql.addEventListener("change", onRatio);

        return () => mql.removeEventListener("change", onRatio);
    }, []);

    useEffect(() => {
        const unlock = () => {
            SoundManager.unlock?.();
            window.removeEventListener("touchstart", unlock);
            window.removeEventListener("mousedown", unlock);
        };

        window.addEventListener("touchstart", unlock);
        window.addEventListener("mousedown", unlock);

        return () => {
            window.removeEventListener("touchstart", unlock);
            window.removeEventListener("mousedown", unlock);
        };
    }, []);

    useEffect(() => {
        const escHandler = (e: KeyboardEvent) => {
            if (e.code === "Escape") e.preventDefault();
        };

        window.addEventListener("keydown", escHandler);
        return () => window.removeEventListener("keydown", escHandler);
    }, []);

    // ------------------------------------------------------------
    // HUD COMPONENT
    // ------------------------------------------------------------
    const HUD = () => (
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

    // ------------------------------------------------------------
    // PAUSE OVERLAY
    // ------------------------------------------------------------
    const PauseOverlay = () => {
        if (!isPaused) return null;

        return (
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
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
                    <div
                        style={{ marginBottom: 20, fontWeight: "bold", fontSize: 32 }}
                    >
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
    // FINAL JSX RETURN
    // ------------------------------------------------------------
    return (
        <div
            ref={containerRef}
            style={{
                position: "relative",
                width: "100%",
                height: "100vh",
                background: "#111",
                overflow: "hidden",
                touchAction: "none",
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    background: "#000",
                }}
            />

            <HUD />
            <PauseOverlay />

            {/* Touch zones */}
            <div style={{ position:"absolute", top:0, left:0, width:"33%", height:"100%", zIndex:5 }} />
            <div style={{ position:"absolute", top:0, left:"33%", width:"34%", height:"100%", zIndex:5 }} />
            <div style={{ position:"absolute", top:0, right:0, width:"33%", height:"100%", zIndex:5 }} />
        </div>
    );
}
