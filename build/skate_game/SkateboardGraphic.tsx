// SkateboardGraphic.tsx
import React from "react";

export default function SkateboardGraphic() {
  return (
    <div style={{ marginTop: 20 }}>
      <h2 style={{ color: "white" }}>Skateboard Graphic</h2>
      <div
        style={{
          width: 300,
          height: 100,
          background: "#333",
          borderRadius: 50,
          border: "3px solid #666",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "cyan",
          fontSize: 24,
        }}
      >
        🛹 Deck Art
      </div>
    </div>
  );
}
