/* ============================================================================
   CHARACTER PREVIEW — INVERT FM SKATE GAME
   Now uses the central CHARACTERS list.
   ============================================================================ */

import React from "react";
import { CHARACTERS } from "./characters";  // <-- NEW

interface Props {
    selected: string;
}

export default function CharacterPreview({ selected }: Props) {
    const char = CHARACTERS.find(c => c.id === selected);

    if (!char) {
        return (
            <div style={{ textAlign: "center", padding: "20px", color: "#ccc" }}>
                Character not found
            </div>
        );
    }

    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginTop: "10px",
            }}
        >
            <img
                src={char.img}
                alt={char.name}
                style={{
                    width: "240px",
                    height: "240px",
                    objectFit: "contain",
                    imageRendering: "pixelated",
                    filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.35))",
                }}
            />

            <div
                style={{
                    marginTop: "10px",
                    fontSize: "26px",
                    fontWeight: "bold",
                    letterSpacing: "2px",
                    color: "#fff",
                    textShadow: "0 0 6px rgba(255,255,255,0.4)",
                }}
            >
                {char.name}
            </div>
        </div>
    );
}
