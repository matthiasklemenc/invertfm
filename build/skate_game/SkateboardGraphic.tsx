/* ============================================================================
   SKATEBOARD GRAPHIC — INVERT FM SKATE GAME
   Clean, stable component to show a skateboard under the selected character.
   ============================================================================ */

import React from "react";

interface Props {
    size?: number; // px
    color?: string; // decorative outline color
}

export default function SkateboardGraphic({
    size = 260,
    color = "#ffffff"
}: Props) {
    const w = size;
    const h = size * 0.32;

    return (
        <div
            style={{
                width: w,
                height: h,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "10px",
            }}
        >
            {/* SHADOW */}
            <div
                style={{
                    position: "absolute",
                    bottom: "-6px",
                    width: w * 0.75,
                    height: h * 0.45,
                    background: "rgba(0,0,0,0.35)",
                    filter: "blur(10px)",
                    borderRadius: "50%",
                    zIndex: 0,
                }}
            />

            {/* DECK */}
            <div
                style={{
                    position: "absolute",
                    width: w,
                    height: h,
                    background: "#302d2b",
                    borderRadius: h / 2,
                    border: `4px solid ${color}`,
                    zIndex: 2,
                    transform: "translateZ(0)",
                }}
            />

            {/* TRUCKS */}
            <div
                style={{
                    position: "absolute",
                    width: w * 0.75,
                    height: h * 0.18,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    display: "flex",
                    justifyContent: "space-between",
                    zIndex: 3,
                }}
            >
                <div
                    style={{
                        width: "22px",
                        height: "22px",
                        background: "#a0a0a0",
                        borderRadius: "50%",
                        border: "3px solid #666",
                    }}
                />
                <div
                    style={{
                        width: "22px",
                        height: "22px",
                        background: "#a0a0a0",
                        borderRadius: "50%",
                        border: "3px solid #666",
                    }}
                />
            </div>

            {/* WHEELS */}
            <div
                style={{
                    position: "absolute",
                    width: w * 0.75,
                    height: h * 0.2,
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    justifyContent: "space-between",
                    zIndex: 1,
                }}
            >
                <div
                    style={{
                        width: "26px",
                        height: "26px",
                        background: "#f2f2f2",
                        borderRadius: "50%",
                        border: "3px solid #666",
                    }}
                />
                <div
                    style={{
                        width: "26px",
                        height: "26px",
                        background: "#f2f2f2",
                        borderRadius: "50%",
                        border: "3px solid #666",
                    }}
                />
            </div>
        </div>
    );
}
