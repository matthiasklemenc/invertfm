/* ============================================================================
   3D CHARACTER CAROUSEL — INVERT FM SKATE GAME
   Stable + responsive React component
   ============================================================================ */

import React, { useState, useEffect } from "react";

const characters = [
    { id: "kai", name: "KAI", img: "/invertfm/skate_game/sprites/char_kai.png" },
    { id: "mila", name: "MILA", img: "/invertfm/skate_game/sprites/char_mila.png" },
    { id: "rex", name: "REX", img: "/invertfm/skate_game/sprites/char_rex.png" },
    { id: "luna", name: "LUNA", img: "/invertfm/skate_game/sprites/char_luna.png" }
];

interface Props {
    onSelect: (id: string) => void;
    selected: string;
}

export default function Carousel3D({ onSelect, selected }: Props) {
    const [index, setIndex] = useState(
        characters.findIndex(c => c.id === selected)
    );

    useEffect(() => {
        setIndex(characters.findIndex(c => c.id === selected));
    }, [selected]);

    const rotateLeft = () => {
        const newIndex = (index - 1 + characters.length) % characters.length;
        setIndex(newIndex);
        onSelect(characters[newIndex].id);
    };

    const rotateRight = () => {
        const newIndex = (index + 1) % characters.length;
        setIndex(newIndex);
        onSelect(characters[newIndex].id);
    };

    return (
        <div
            style={{
                width: "100%",
                height: "260px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                perspective: "900px",
                marginTop: "20px"
            }}
        >
            <div
                style={{
                    width: "220px",
                    height: "220px",
                    position: "relative",
                    transformStyle: "preserve-3d",
                    transform: `rotateY(${index * -90}deg)`,
                    transition: "transform 0.6s cubic-bezier(.25,.46,.45,.94)"
                }}
            >
                {characters.map((c, i) => {
                    const angle = i * 90;
                    return (
                        <img
                            key={c.id}
                            src={c.img}
                            alt={c.name}
                            style={{
                                position: "absolute",
                                width: "200px",
                                height: "200px",
                                top: "10px",
                                left: "10px",
                                objectFit: "contain",
                                backfaceVisibility: "hidden",
                                transform: `rotateY(${angle}deg) translateZ(320px)`
                            }}
                        />
                    );
                })}
            </div>

            <div style={{ display: "flex", gap: "20px", marginTop: "15px" }}>
                <button onClick={rotateLeft} style={btnStyle}>◀</button>
                <button onClick={rotateRight} style={btnStyle}>▶</button>
            </div>
        </div>
    );
}

const btnStyle: React.CSSProperties = {
    padding: "10px 18px",
    fontSize: "22px",
    borderRadius: "8px",
    background: "#111",
    color: "#fff",
    border: "2px solid #444",
    cursor: "pointer"
};
