/* ============================================================================
   SKATE GAME PAGE — CLEAN START SCREEN WITH LOGO + SMALL CAROUSEL
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
       INITIALIZE GAME LOOP
       ============================================================================ */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        if (!gameRef.current) {
            gameRef.current = new GameLoop(canvas, selectedChar);
        }

        const handleResize = () => {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    /* ============================================================================
       START GAME
       ============================================================================ */
    const startGame = (characterID?: string) => {
        const finalChar = characterID ?? selectedChar;

        setSelectedChar(finalChar);
        setGameStarted(true);

        if (gameRef.current?.setCharacter) {
            gameRef.current.setCharacter(finalChar);
        }

        gameRef.current?.resetGame?.();
        gameRef.current?.start?.();
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
                    overflow: "hidden",
                    color: "#fff",
                    paddingTop: "20px",
                    textAlign: "center"
                }}
            >

                {/* GAME LOGO */}
                <img
                    src="/invertfm/skate_game/sprites/game_logo.png"
                    alt="Game Logo"
                    style={{
                        width: "230px",
                        height: "auto",
                        marginBottom: "10px",
                        filter: "drop-shadow(0 0 12px rgba(255,255,255,0.4))"
                    }}
                />

                <h1
                    style={{
                        marginBottom: "10px",
                        fontSize: "2rem",
                        fontWeight: "bold",
                        letterSpacing: "2px",
                        textShadow: "0 0 10px rgba(255,255,255,0.5)"
                    }}
                >
                    SELECT YOUR SKATER
                </h1>

                {/* Smaller Carousel */}
                <Carousel3D
                    selected={selectedChar}
                    onSelect={(id) => setSelectedChar(id)}
                    onCharacterClick={(id) => startGame(id)}
                />

                {/* Character Preview */}
                <div style={{ marginTop: "5px" }}>
                    <CharacterPreview selected={selectedChar} />
                </div>

                {/* Start Game Button */}
                <button
                    onClick={() => startGame()}
                    style={{
                        marginTop: "14px",
                        padding: "14px 30px",
                        fontSize: "22px",
                        fontWeight: "bold",
                        background: "#c52323",
                        border: "none",
                        borderRadius: "14px",
                        color: "#fff",
                        cursor: "pointer",
                        boxShadow: "0 0 12px rgba(255,0,0,0.5)",
                        letterSpacing: "1px"
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
        <div style={{ width: "100%", height: "100vh", overflow: "hidden", background: "#000" }}>
            <canvas
                ref={canvasRef}
                style={{ width: "100%", height: "100%", display: "block", background: "#000" }}
            />
        </div>
    );
}
