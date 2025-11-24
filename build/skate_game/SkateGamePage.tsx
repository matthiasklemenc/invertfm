/* ============================================================================
   SKATE GAME PAGE — FINAL, WORKING VERSION
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
       INITIAL SETUP — PREPARE CANVAS SIZE
       ============================================================================ */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const resizeHandler = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", resizeHandler);
        return () => window.removeEventListener("resize", resizeHandler);
    }, []);

    /* ============================================================================
       START GAME — CLICK ON CHARACTER
       ============================================================================ */
    const startGame = (charId: string) => {
        setSelectedChar(charId);
        setGameStarted(true);

        // Delay to allow canvas to mount
        setTimeout(() => {
            const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
            if (!canvas) {
                console.error("Canvas not found!");
                return;
            }

            // Create the game loop engine if not created
            if (!gameRef.current) {
                gameRef.current = new GameLoop(canvas, charId);
            }

            // Tell engine which character to use
            gameRef.current.setCharacter(charId);
            gameRef.current.resetGame();
            gameRef.current.start();
        }, 120);
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
                {/* GAME LOGO */}
                <img
                    src="/invertfm/skate_game/sprites/game_logo.png"
                    style={{
                        width: "230px",
                        marginBottom: "12px",
                        filter: "drop-shadow(0 0 12px rgba(255,255,255,0.4))",
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
            </div>
        );
    }

    /* ============================================================================
       GAME CANVAS (FULLSCREEN)
       ============================================================================ */
    return (
        <canvas
            id="game-canvas"
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
