/* ============================================================================
   SKATE GAME PAGE — CLEAN VERSION WITHOUT PREVIEW IMAGE
   ============================================================================ */

import React, { useEffect, useRef, useState } from "react";
import Carousel3D from "./Carousel3D";
import { CHARACTERS } from "./characters";
import { GameLoop } from "./engine/game-loop";

export default function SkateGamePage() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const gameRef = useRef<GameLoop | null>(null);

    const [selectedChar, setSelectedChar] = useState("kai");
    const [gameStarted, setGameStarted] = useState(false);

    /* ============================================================================
       INITIALIZE GAME LOOP
       ============================================================================ */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        if (!gameRef.current) {
            // ALWAYS give a valid character to the engine
            gameRef.current = new GameLoop(canvas, selectedChar);
        }

        const resizeHandler = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", resizeHandler);

        return () => window.removeEventListener("resize", resizeHandler);
    }, []);

    /* ============================================================================
       SAFE START GAME — FIXES BLANK SCREEN
       ============================================================================ */
    const startGame = (charId: string | null = null) => {
        const finalChar = charId ?? selectedChar;
        setSelectedChar(finalChar);

        // Switch screen immediately
        setGameStarted(true);

        if (!gameRef.current) return;

        // Make sure character is set BEFORE starting
        if (gameRef.current.setCharacter) {
            gameRef.current.setCharacter(finalChar);
        }

        gameRef.current.resetGame?.();
        gameRef.current.start?.();
    };

    /* ============================================================================
       START SCREEN
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
                    paddingTop: "20px",
                    color: "#fff",
                    textAlign: "center",
                    overflow: "hidden",
                }}
            >
                {/* LOGO */}
                <img
                    src="/invertfm/skate_game/sprites/game_logo.png"
                    style={{
                        width: "230px",
                        marginBottom: "12px",
                        filter: "drop-shadow(0 0 12px rgba(255,255,255,0.4))"
                    }}
                />

                <h1
                    style={{
                        marginBottom: "10px",
                        fontSize: "2rem",
                        fontWeight: "bold",
                        letterSpacing: "2px",
                        textShadow: "0 0 10px rgba(255,255,255,0.5)",
                    }}
                >
                    SELECT YOUR SKATER
                </h1>

                {/* CAROUSEL — CLICK STARTS GAME */}
                <Carousel3D
                    selected={selectedChar}
                    onSelect={(id) => setSelectedChar(id)}
                    onCharacterClick={(id) => startGame(id)}
                />

                {/* START BUTTON (OPTIONAL) */}
                <button
                    onClick={() => startGame()}
                    style={{
                        marginTop: "25px",
                        padding: "14px 30px",
                        fontSize: "22px",
                        fontWeight: "bold",
                        background: "#c52323",
                        borderRadius: "14px",
                        color: "#fff",
                        border: "0",
                        cursor: "pointer",
                        boxShadow: "0 0 12px rgba(255,0,0,0.5)",
                    }}
                >
                    START GAME
                </button>
            </div>
        );
    }

    /* ============================================================================
       GAME CANVAS — ALWAYS SHOW IF gameStarted
       ============================================================================ */
    return (
        <canvas
            ref={canvasRef}
            style={{
                width: "100vw",
                height: "100vh",
                display: "block",
                background: "#000",
            }}
        />
    );
}
