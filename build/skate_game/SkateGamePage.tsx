/* ============================================================================
   SKATE GAME PAGE — INVERT FM SKATE GAME
   Main React component mounting the canvas and connecting to GameLoop engine.
   ============================================================================ */

import React, { useEffect, useRef, useState } from "react";

import Carousel3D from "./Carousel3D";
import CharacterPreview from "./CharacterPreview";
import { CHARACTERS } from "./characters";

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

        // Fullscreen canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Create the game loop once
        if (!gameRef.current) {
            gameRef.current = new GameLoop(canvas, selectedChar);
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

        // Pass selected character into engine (if supported)
        if (gameRef.current.setCharacter) {
            gameRef.current.setCharacter(selectedChar);
        }

        gameRef.current.resetGame?.();
        gameRef.current.start();
    };

    /* ============================================================================
       CHARACTER SELECT SCREEN
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
                    justifyContent: "flex-start",
                    overflow: "hidden",
                    color: "#fff",
                    paddingTop: "40px",
                }}
            >
                <h1
                    style={{
                        marginBottom: "20px",
                        fontSize: "2.4rem",
                        fontWeight: "bold",
                        letterSpacing: "3px",
                        textShadow: "0 0 12px rgba(255,255,255,0.6)",
                    }}
                >
                    SELECT YOUR SKATER
                </h1>

                {/* Character carousel */}
                <Carousel3D
                    selected={selectedChar}
                    onSelect={(id) => setSelectedChar(id)}
                />

                {/* Preview below carousel */}
                <div style={{ marginTop: "10px" }}>
                    <CharacterPreview selected={selectedChar} />
                </div>

                {/* Start button */}
                <button
                    onClick={startGame}
                    style={{
                        marginTop: "28px",
                        padding: "16px 32px",
                        fontSize: "24px",
                        fontWeight: "bold",
                        background: "#c52323",
                        border: "none",
                        borderRadius: "14px",
                        color: "#fff",
                        cursor: "pointer",
                        boxShadow: "0 0 14px rgba(255,0,0,0.5)",
                        letterSpacing: "1px",
                    }}
                >
                    START GAME
                </button>
            </div>
        );
    }

    /* ============================================================================
       GAME RUNNING
       ============================================================================ */
    return (
        <div
            style={{
                width: "100%",
                height: "100vh",
                overflow: "hidden",
                background: "#000",
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
        </div>
    );
}
