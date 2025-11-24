import React, { useState, useEffect } from "react";
import { CHARACTERS } from "./characters";

interface Props {
    onSelect: (id: string) => void;
    selected: string;
    onCharacterClick: (id: string) => void;
}

export default function Carousel3D({ onSelect, selected, onCharacterClick }: Props) {
    const [index, setIndex] = useState(
        CHARACTERS.findIndex(c => c.id === selected)
    );

    useEffect(() => {
        setIndex(CHARACTERS.findIndex(c => c.id === selected));
    }, [selected]);

    const rotateLeft = () => {
        const newIndex = (index - 1 + CHARACTERS.length) % CHARACTERS.length;
        setIndex(newIndex);
        onSelect(CHARACTERS[newIndex].id);
    };

    const rotateRight = () => {
        const newIndex = (index + 1) % CHARACTERS.length;
        setIndex(newIndex);
        onSelect(CHARACTERS[newIndex].id);
    };

    return (
        <div
            style={{
                width: "100%",
                height: "220px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                perspective: "900px",
                marginTop: "10px",
            }}
        >
            <div
                style={{
                    width: "160px",
                    height: "160px",
                    position: "relative",
                    transformStyle: "preserve-3d",
                    transform: `rotateY(${index * -90}deg)`,
                    transition: "transform 0.6s cubic-bezier(.25,.46,.45,.94)",
                    cursor: "pointer",
                }}
                onClick={() => onCharacterClick(CHARACTERS[index].id)}
            >
                {CHARACTERS.map((c, i) => {
                    const angle = i * 90;
                    return (
                        <img
                            key={c.id}
                            src={c.img}
                            alt={c.name}
                            style={{
                                position: "absolute",
                                width: "150px",
                                height: "150px",
                                top: "5px",
                                left: "5px",
                                objectFit: "contain",
                                backfaceVisibility: "hidden",
                                transform: `rotateY(${angle}deg) translateZ(250px)`
                            }}
                        />
                    );
                })}
            </div>

            <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
                <button onClick={rotateLeft} style={btnStyle}>◀</button>
                <button onClick={rotateRight} style={btnStyle}>▶</button>
            </div>
        </div>
    );
}

const btnStyle: React.CSSProperties = {
    padding: "8px 14px",
    fontSize: "20px",
    borderRadius: "8px",
    background: "#111",
    color: "#fff",
    border: "2px solid #444",
    cursor: "pointer"
};
