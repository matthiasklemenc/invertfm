// Carousel3D.tsx
import React from "react";

export default function Carousel3D() {
  return (
    <div style={{ marginTop: 20 }}>
      <h2 style={{ color: "white" }}>3D Character Carousel</h2>
      <div
        style={{
          width: 260,
          height: 140,
          background: "linear-gradient(#222, #111)",
          borderRadius: 12,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}
      >
        3D Model Preview
      </div>
    </div>
  );
}
