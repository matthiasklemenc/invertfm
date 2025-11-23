// FULL NEW SkateGamePage.tsx GENERATED
// (See ChatGPT message for explanation)

import React, { useEffect, useRef, useState } from "react";
import { startGameLoop } from "./engine/game-loop";
import { createPhysicsState } from "./engine/physics";
import { createObstacleManager } from "./engine/obstacles";
import { createPlayerInput } from "./engine/player-actions";
import { createCollectibleManager } from "./engine/collectibles";

import { BackgroundRenderer } from "./engine/rendering/BackgroundRenderer";
import { GroundRenderer } from "./engine/rendering/GroundRenderer";
import { ObstacleRenderer } from "./engine/rendering/ObstacleRenderer";
import { CoinRenderer } from "./engine/rendering/CoinRenderer";
import { PlayerRenderer } from "./engine/rendering/PlayerRenderer";

import { loadAllSprites } from "./engine/assetLoader";

export default function SkateGamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stopLoop: null | (() => void) = null;

    loadAllSprites()
      .then((sprites) => {
        setLoading(false);

        const physics = createPhysicsState();
        const obstacles = createObstacleManager();
        const coins = createCollectibleManager();
        const input = createPlayerInput(canvas);

        const backgroundRenderer = new BackgroundRenderer();
        const groundRenderer = new GroundRenderer();
        const obstacleRenderer = new ObstacleRenderer();
        const coinRenderer = new CoinRenderer();
        const playerRenderer = new PlayerRenderer(sprites);

        stopLoop = startGameLoop((dt) => {
          if (paused) return;

          physics.update(dt, input);
          obstacles.update(dt, physics.playerX);
          coins.update(dt, physics.playerX);

          setScore(coins.collected);

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          backgroundRenderer.render(ctx, physics);
          groundRenderer.render(ctx, physics);
          obstacleRenderer.render(ctx, obstacles.list);
          coinRenderer.render(ctx, coins.list);
          playerRenderer.render(ctx, physics, input);
        });
      })
      .catch((err) => console.error("Sprite load failed:", err));

    return () => {
      if (stopLoop) stopLoop();
    };
  }, [paused]);

  const togglePause = () => setPaused((p) => !p);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#0c1424",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "20px",
      }}
    >
      <h2 style={{ color: "white", marginBottom: "10px" }}>Skate Game</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <button
          style={{
            padding: "10px 18px",
            borderRadius: "6px",
            background: "#ff4b4b",
            color: "white",
            border: "none",
          }}
          onClick={() => (window.location.href = "/invertfm/")}
        >
          Exit Game
        </button>

        <button
          style={{
            padding: "10px 18px",
            borderRadius: "6px",
            background: paused ? "#00d98a" : "#ffaa33",
            color: "white",
            border: "none",
          }}
          onClick={togglePause}
        >
          {paused ? "Resume" : "Pause"}
        </button>
      </div>

      {loading && (
        <div style={{ color: "white", marginBottom: "10px" }}>
          Loading sprites…
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={900}
        height={450}
        style={{
          border: "2px solid white",
          background: "black",
          maxWidth: "100%",
        }}
      />

      <div style={{ marginTop: "20px", color: "white", fontSize: "22px" }}>
        Score: {score}
      </div>
    </div>
  );
}
