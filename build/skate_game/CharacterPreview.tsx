/* ============================================================================
   CHARACTER PREVIEW — INVERT FM SKATE GAME
   Displays the selected character in large preview form.
   ============================================================================ */

import React from "react";

interface CharInfo {
    id: string;
    name: string;
    img: string;
}

const characters: CharInfo[] = [
    { id: "kai", name: "KAI", img: "/skate_game/assets/char_kai.png" },
    { id: "mila", name: "MILA", img: "/skate_game/assets/char_mila.png" },
    { id: "rex", name: "REX", img: "/skate_game/assets/char_rex.png" },
    { id: "luna", name: "LUNA", img: "/skate_game/assets/char_luna.png" }
];

interface Props {
    selected: string;
}

export default function CharacterPreview({ selected }: Props) {
    const char = characters.find(c => c.id === selected);

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
