
// SkateGamePage.tsx — FULL UPDATED VERSION with Pause System (canvas-only overlay)

import React, { useEffect, useRef, useState } from 'react';

// Engine modules
import { GameLoop } from './engine/game-loop';
import { PhysicsEngine, PlayerPhysicsState } from './engine/physics';
import { ObstacleSystem } from './engine/obstacles';
import { CollectibleSystem } from './engine/collectibles';
import { PlayerActions } from './engine/player-actions';

// Helpers & Components
import { drawPlayer, drawObstacle, drawCollectible, clearCanvas } from './DrawingHelpers';
import { SoundManager } from './SoundManager';
import CharacterPreview from './CharacterPreview';
import Carousel3D from './Carousel3D';
import SkateboardGraphic from './SkateboardGraphic';

const GAME_WIDTH = 900;
const GAME_HEIGHT = 400;

export default function SkateGamePage({ onClose }: { onClose?: () => void }) {

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sound = useRef(new SoundManager());

  const physics = useRef(
    new PhysicsEngine({
      gravity: 0.45,
      jumpForce: -12,
      maxFallSpeed: 18,
      friction: 0.90,
    })
  );

  const obstacles = useRef(
    new ObstacleSystem({
      baseSpeed: 6,
      spawnInterval: 2.0,
      speedGrowthRate: 0.003,
    })
  );

  const collectibles = useRef(
    new CollectibleSystem({
      baseSpeed: 6,
      spawnInterval: 1.8,
      floatingTextDuration: 1.2,
    })
  );

  const player = useRef<PlayerPhysicsState>({
    x: 180,
    y: 260,
    vx: 0,
    vy: 0,
    onGround: true,
    rotation: 0,
    rotationSpeed: 0,
  });

  const tricks = useRef({
    isManual: false,
    manualTimer: 0,
    natas: false,
    natasRotation: 0,
    natasSpeed: 0,
    flipRotation: 0,
    flipActive: false,
    scoreBuffer: 0,
  });

  const actions = useRef(
    new PlayerActions({
      manualDifficulty: 120,
      natasRotationSpeed: 3.8,
      flipSpeed: 8.0,
      flipReward: 400,
    })
  );

  const loop = useRef<GameLoop | null>(null);

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);

  // UPDATE
  const update = (delta: number) => {
    if (paused || gameOver) return;

    physics.current.simulate(player.current, delta);
    obstacles.current.update(delta);
    collectibles.current.update(delta);
    actions.current.update(tricks.current, delta);

    const hit = obstacles.current.checkCollision(
      player.current.x, player.current.y, 60, 60
    );
    if (hit) {
      setGameOver(true);
      sound.current.playCrash();
      return;
    }

    const collected = collectibles.current.checkCollision(
      player.current.x, player.current.y, 60, 60
    );
    if (collected) {
      const value = collectibles.current.collect(collected);
      setScore(prev => prev + value);
      sound.current.playCoin();
    }

    const trickReward = actions.current.getBufferedScore(tricks.current);
    if (trickReward > 0) {
      setScore(prev => prev + trickReward);
    }

    if (player.current.y >= 260) {
      player.current.y = 260;
      player.current.vy = 0;
      player.current.onGround = true;
    } else {
      player.current.onGround = false;
    }
  };

  // RENDER
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    clearCanvas(ctx, GAME_WIDTH, GAME_HEIGHT);

    for (const o of obstacles.current.getObstacles()) {
      drawObstacle(ctx, o);
    }
    for (const c of collectibles.current.getCollectibles()) {
      drawCollectible(ctx, c);
    }

    drawPlayer(ctx, player.current, tricks.current);

    for (const ft of collectibles.current.getFloatingTexts()) {
      ctx.globalAlpha = ft.opacity;
      ctx.fillStyle = "#ffd700";
      ctx.font = "20px Arial";
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.globalAlpha = 1;
    }
  };

  // EFFECT
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    loop.current = new GameLoop({ update, render });
    loop.current.start();

    sound.current.playMusic();

    return () => {
      loop.current?.stop();
      sound.current.stopMusic();
    };
  }, [gameOver, paused]);

  // INPUT HANDLERS
  const handleJump = () => {
    if (paused || gameOver) return;
    if (player.current.onGround) {
      physics.current.jump(player.current);
      sound.current.playJump();
    }
  };

  const handleKickflip = () => {
    if (!paused && !gameOver) {
      actions.current.startKickflip(tricks.current);
      sound.current.playFlip();
    }
  };

  const handleManualStart = () => {
    if (!paused && !gameOver) {
      actions.current.startManual(tricks.current);
    }
  };

  const handleManualStop = () => {
    if (!paused && !gameOver) {
      actions.current.stopManual(tricks.current);
    }
  };

  const handleNatasStart = () => {
    if (!paused && !gameOver) {
      actions.current.startNatasSpin(tricks.current);
      sound.current.playGrind();
    }
  };

  const handleNatasStop = () => {
    if (!paused && !gameOver) {
      actions.current.stopNatasSpin(tricks.current);
    }
  };

  const restartGame = () => {
    setGameOver(false);
    setScore(0);
    setPaused(false);

    sound.current.stopMusic();
    sound.current.playMusic();

    player.current = {
      x: 180,
      y: 260,
      vx: 0,
      vy: 0,
      onGround: true,
      rotation: 0,
      rotationSpeed: 0,
    };

    tricks.current = {
      isManual: false,
      manualTimer: 0,
      natas: false,
      natasRotation: 0,
      natasSpeed: 0,
      flipRotation: 0,
      flipActive: false,
      scoreBuffer: 0,
    };

    obstacles.current = new (obstacles.current.constructor as any)(obstacles.current.config);
    collectibles.current = new (collectibles.current.constructor as any)(collectibles.current.config);
  };

  const togglePause = () => {
    setPaused(prev => {
      const newVal = !prev;
      if (newVal) sound.current.stopMusic();
      else sound.current.playMusic();
      return newVal;
    });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px", position: "relative" }}>
      <h1 style={{ color: "#fff", fontFamily: "Arial" }}>Skate Game</h1>

      {/* Exit Game Button */}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: "#ff4444",
            color: "white",
            border: "none",
            padding: "10px 20px",
            fontSize: "18px",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "10px",
            marginRight: "10px"
          }}
        >
          Exit Game
        </button>
      )}

      {/* Pause Button */}
      <button
        onClick={togglePause}
        style={{
          background: paused ? "#33cc33" : "#ffaa00",
          color: "black",
          border: "none",
          padding: "10px 20px",
          fontSize: "18px",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "20px"
        }}
      >
        {paused ? "Resume" : "Pause"}
      </button>

      {/* Canvas wrapper */}
      <div style={{ position: "relative", display: "inline-block" }}>
        <canvas
          ref={canvasRef}
          style={{
            border: "2px solid white",
            background: "#111",
            width: GAME_WIDTH,
            height: GAME_HEIGHT,
          }}
        />

        {/* Pause Overlay — canvas only */}
        {paused && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: GAME_WIDTH,
              height: GAME_HEIGHT,
              background: "rgba(0,0,0,0.75)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              zIndex: 10,
            }}
          >
            <h2 style={{ marginBottom: "20px" }}>PAUSED</h2>

            <button
              onClick={togglePause}
              style={{
                padding: "10px 20px",
                background: "#33cc33",
                borderRadius: "6px",
                border: "none",
                fontSize: "20px",
                marginBottom: "15px",
                cursor: "pointer",
              }}
            >
              Resume
            </button>

            {onClose && (
              <button
                onClick={onClose}
                style={{
                  padding: "10px 20px",
                  background: "#ff4444",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                Exit Game
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{ color: "white", fontSize: "24px", marginTop: "20px" }}>
        Score: {score}
      </div>

      {gameOver && (
        <div style={{ marginBottom: "20px", color: "red", fontSize: "28px" }}>
          GAME OVER
          <br />
          <button
            onClick={restartGame}
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            Restart
          </button>
        </div>
      )}

      <div style={{ marginTop: "40px" }}>
        <Carousel3D />
      </div>

      <div style={{ marginTop: "20px" }}>
        <CharacterPreview />
      </div>

      <div style={{ marginTop: "30px" }}>
        <SkateboardGraphic />
      </div>
    </div>
  );
}
