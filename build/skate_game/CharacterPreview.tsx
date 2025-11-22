// CharacterPreview.tsx
import React from "react";

export default function CharacterPreview() {
  return (
    <div style={{ color: "white", marginTop: "10px" }}>
      <h2>Character Preview</h2>
      <div
        style={{
          width: 120,
          height: 120,
          background: "#222",
          borderRadius: 10,
          border: "2px solid #555",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
        }}
      >
        🛹
      </div>
    </div>
  );
}
