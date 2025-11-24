import React from "react";
import { CHARACTERS } from "./characters";

interface Props {
    selected: string;
}

export default function CharacterPreview({ selected }: Props) {
    const char = CHARACTERS.find(c => c.id === selected);
    if (!char) return null;

    return (
        <div style={{ textAlign: "center" }}>
            <img
                src={char.img}
                alt={char.name}
                style={{
                    width: "140px",
                    height: "140px",
                    objectFit: "contain",
                    filter: "drop-shadow(0 5px 10px rgba(0,0,0,0.4))"
                }}
            />
            <div
                style={{
                    marginTop: "6px",
                    fontSize: "22px",
                    fontWeight: "bold",
                    letterSpacing: "2px",
                }}
            >
                {char.name}
            </div>
        </div>
    );
}
