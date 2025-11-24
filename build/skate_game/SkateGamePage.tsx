/* ============================================================================
   SKATE GAME PAGE — INVERT FM SKATE GAME
   Main React component mounting the canvas and connecting to GameLoop engine.
   ============================================================================ */

import React, { useEffect, useRef, useState } from "react";

import Carousel3D from "./Carousel3D";
import CharacterPreview from "./CharacterPreview";

import { GameLoop } from "./engine/game-loop";

export default function SkateGamePage() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const gameRef = useRef<GameLoop | null>(null);

    const [selectedChar, setSelectedChar] = useState("kai");
    const [gameStarted, setGameStarted] = useState(false);

    /* ============================================================================
       INITIALIZE GAME LOOP (ONCE)
       ============================================================================ */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Correct canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Create game instance only ONCE
        if (!gameRef.current) {
            gameRef.current = new GameLoop(canvas);
        }

        const handleResize = () => {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    /* ============================================================================
       START GAME
       ============================================================================ */
    const startGame = () => {
        if (!gameRef.current) return;
        setGameStarted(true);
        gameRef.current.resetGame?.();
        gameRef.current.start();
    };

    /* ============================================================================
       CONTENT RENDER
       ============================================================================ */
    if (!gameStarted) {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100vh",
                    background: "#000",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    color: "#fff"
                }}
            >
                <h1
                    style={{
                        marginBottom: "10px",
                        fontSize: "2.2rem",
                        fontWeight: "bold",
                        letterSpacing: "2px",
                        textShadow: "0 0 10px rgba(255,255,255,0.5)"
                    }}
                >
                    SELECT YOUR SKATER
                </h1>

                {/* 3D character carousel */}
                <Carousel3D
                    selected={selectedChar}
                    onSelect={(id) => setSelectedChar(id)}
                />

                {/* Large character preview */}
                <CharacterPreview selected={selectedChar} />

                {/* START BUTTON */}
                <button
                    onClick={startGame}
                    style={{
                        marginTop: "30px",
                        padding: "14px 26px",
                        fontSize: "22px",
                        background: "#c52323",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                        cursor: "pointer",
                        boxShadow: "0 0 10px rgba(255,0,0,0.4)"
                    }}
                >
                    START GAME
                </button>
            </div>
        );
    }

    /* ============================================================================
       GAME RUNNING — SHOW CANVAS ONLY
       ============================================================================ */
    return (
        <div
            style={{
                width: "100%",
                height: "100vh",
                overflow: "hidden",
                background: "#000"
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    background: "#000"
                }}
            />
        </div>
    );
}
