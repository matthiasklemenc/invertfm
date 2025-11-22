
import React, { useEffect, useRef, useState } from 'react';
import { getSoundManager } from './SoundManager';
import { drawStickman, drawObstacle, drawCityBackground, drawUnderworldBackground, drawCollectible, drawTransitionPipe, CharacterType, CHARACTERS, ObstacleType } from './DrawingHelpers';
import SkateboardIcon from '../skate_session_review/SkateboardIcon';
import Carousel3D from '../Carousel3D';
import CharacterPreview from './CharacterPreview';

// --- TYPES ---
type GameState = 'MENU' | 'PLAYING' | 'GAME_OVER';
type PlayerState = 'RUNNING' | 'COASTING' | 'JUMPING' | 'GRINDING' | 'CRASHED' | 'TUMBLING' | 'NATAS_SPIN' | 'ARRESTED';
type WorldState = 'NORMAL' | 'TRANSITION_DOWN' | 'UNDERWORLD'; // Removed TRANSITION_UP

interface Player {
    x: number; // Visual offset for cutscenes (default 100)
    y: number;
    vy: number;
    state: PlayerState;
    rotation: number; // For tricks
    trickName: string;
    isFakie: boolean;
    pushTimer: number; // Used for state duration
    pushCount: number; // Number of pushes in current sequence
    targetPushes: number; // Random target (1-5) before coasting
    coastingDuration: number; // Target duration for next coast
    natasSpinCount: number; // How many 360s done
    natasSpinTarget: number; // Target rotation (accumulated 360s)
    natasTapCount: number; // Taps for current spin extension
    lastNatasTapTime: number; // For tap speed calculation
    platformId: number | null; // ID of the platform currently standing on
}

interface Obstacle {
    id: number;
    x: number;
    y: number; 
    w: number;
    h: number;
    type: ObstacleType;
    isGrindable: boolean;
    isGap: boolean;
    isPlatform?: boolean; // Marked true for ramps now too
    passed: boolean;
    sprayingWater?: boolean; // Hydrant visual state
    doorOpen?: boolean; // Police car visual state
    firecrackerTriggered?: boolean; // For stairs effect
}

interface Collectible {
    id: number;
    x: number;
    y: number;
    type: 'COIN' | 'DIAMOND';
    collected: boolean;
}

interface FloatingText {
    id: number;
    x: number;
    y: number;
    text: string;
    color: string;
    life: number;
}

const GRAVITY = 0.6;
const JUMP_FORCE = -18; 
const BASE_FLOOR_Y = 250; 
const SPEED = 7;

// UPDATED: Ramp width increased to 160 for easier boosting
const STANDARD_OBSTACLES: { type: ObstacleType, w: number, h: number, grind: boolean, gap: boolean, isPlatform?: boolean, yOffset?: number }[] = [
    { type: 'hydrant', w: 30, h: 40, grind: true, gap: false }, 
    { type: 'police_car', w: 100, h: 50, grind: false, gap: false }, 
    { type: 'cybertruck', w: 120, h: 50, grind: true, gap: false },
    { type: 'cart', w: 50, h: 50, grind: false, gap: false },
    { type: 'ledge', w: 150, h: 30, grind: true, gap: false },
    { type: 'curb', w: 40, h: 15, grind: true, gap: false },
    { type: 'rail', w: 100, h: 40, grind: true, gap: false }, 
    { type: 'flat_rail', w: 120, h: 20, grind: true, gap: false }, 
    { type: 'bin', w: 40, h: 60, grind: false, gap: false },
    { type: 'grey_bin', w: 40, h: 60, grind: false, gap: false },
    { type: 'ramp', w: 160, h: 40, grind: false, gap: false, isPlatform: true }, // Ramp is a platform now
    { type: 'gap', w: 100, h: 10, grind: false, gap: true, yOffset: 10 }, 
];

const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75-.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
    </svg>
);

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
);

const SpeakerWaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
        <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
    </svg>
);

const SpeakerXMarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" />
    </svg>
);

export default function SkateGamePage({ onClose }: { onClose: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number | null>(null);

    const stateRef = useRef<{
        status: GameState,
        score: number,
        jumpsPerformed: number,
        count180: number, 
        count360: number, 
        grindsPerformed: number,
        lives: number,
        frame: number,
        player: Player,
        obstacles: Obstacle[],
        floatingTexts: FloatingText[],
        selectedChar: CharacterType,
        lastTapTime: number,
        tapCount: number, 
        touchStartY: number,
        currentFloorY: number, 
        nextObstacleDist: number,
        totalScroll: number,
        arrestTimer: number,
        world: WorldState,
        underworldTimer: number,
        spawnedExit: boolean,
        transitionY: number,
        collectibles: Collectible[]
    }>({
        status: 'MENU',
        score: 0,
        jumpsPerformed: 0,
        count180: 0,
        count360: 0,
        grindsPerformed: 0,
        lives: 3,
        frame: 0,
        player: { 
            x: 100, // Visual X position
            y: 0, vy: 0, state: 'RUNNING', rotation: 0, trickName: '', isFakie: false,
            pushTimer: 0, pushCount: 0, targetPushes: 3, coastingDuration: 0,
            natasSpinCount: 0, natasSpinTarget: 0,
            natasTapCount: 0, lastNatasTapTime: 0,
            platformId: null
        },
        obstacles: [],
        floatingTexts: [],
        selectedChar: 'female_long',
        lastTapTime: 0,
        tapCount: 0,
        touchStartY: 0,
        currentFloorY: BASE_FLOOR_Y,
        nextObstacleDist: 0,
        totalScroll: 0,
        arrestTimer: 0,
        world: 'NORMAL',
        underworldTimer: 0,
        spawnedExit: false,
        transitionY: 0,
        collectibles: []
    });

    const [uiState, setUiState] = useState<GameState>('MENU');
    const [score, setScore] = useState(0);
    const [stats, setStats] = useState({ grinds: 0, jumps: 0, c180: 0, c360: 0 });
    const [lives, setLives] = useState(3);
    const [character, setCharacter] = useState<CharacterType>('female_long');
    const [highScore, setHighScore] = useState(0);
    const [userName, setUserName] = useState("");
    
    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(getSoundManager().isMuted);

    useEffect(() => {
        try {
            const storedScore = localStorage.getItem('invert-skate-highscore');
            if (storedScore) setHighScore(parseInt(storedScore, 10));
            const storedName = localStorage.getItem('invert-skate-username');
            if (storedName) setUserName(storedName);
        } catch(e) { console.error(e); }
        
        return () => {
            try { getSoundManager().stopMusic(); } catch {}
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const saveHighScore = (newScore: number) => {
        if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('invert-skate-highscore', newScore.toString());
        }
    };

    const togglePause = () => {
        const nextPaused = !isPaused;
        setIsPaused(nextPaused);
        if (nextPaused) {
            getSoundManager().pauseMusic();
        } else {
            getSoundManager().resumeMusic();
        }
    };

    const toggleMute = () => {
        const sm = getSoundManager();
        sm.toggleMute();
        setIsMuted(sm.isMuted);
    };
    
    const enterUnderworld = () => {
        const state = stateRef.current;
        state.world = 'TRANSITION_DOWN';
        state.transitionY = 0;
        // We assume pipe entry starts near where player is or resets x
        state.player.x = 180; // Snap to pipe start X
        state.player.state = 'COASTING';
        state.player.vy = 0;
        state.player.platformId = null;
        state.spawnedExit = false; // Reset exit spawn flag
        // Play transition sounds
        getSoundManager().playMetalHit();
        getSoundManager().playUnderworldMusic(); // Switch music
    };

    const exitUnderworld = () => {
        const state = stateRef.current;
        
        // Direct switch to normal world
        state.world = 'NORMAL';
        
        // Position player
        state.player.x = 100; 
        // To make it look like a jump up, set high negative vy
        state.player.vy = -25; 
        state.player.y = 0; 
        
        state.player.state = 'JUMPING'; 
        state.player.platformId = null;
        state.player.rotation = 0;
        
        state.transitionY = 0; 
        state.underworldTimer = 0;
        state.spawnedExit = false;
        state.nextObstacleDist = 400; // Give some space before next obstacle
        state.obstacles = []; // Clear old obstacles
        state.collectibles = []; // Clear collectibles
        
        getSoundManager().playLaunch();
        getSoundManager().playMainMusic(); 
    };
    
    // Synchronous respawn to prevent game loop errors
    const forceUnderworldRespawn = () => {
        const state = stateRef.current;
        
        // 1. Clear everything to prevent loops
        state.obstacles = [];
        state.collectibles = [];
        
        // 2. Create a very long "Safety Platform" at x=0
        const safePlatY = BASE_FLOOR_Y - 50;
        const safePlat = {
            id: Date.now(), x: 0, y: safePlatY, w: 1000, h: 20,
            type: 'platform' as ObstacleType, isGrindable: false, isGap: false, isPlatform: true, passed: false
        };
        state.obstacles.push(safePlat);
        
        // 3. Snap player onto it immediately
        state.player.platformId = safePlat.id;
        state.currentFloorY = safePlatY; 
        state.player.x = 100; // Reset X visual
        state.player.y = 0;   // On ground
        state.player.vy = 0;
        state.player.state = 'RUNNING';
        state.player.pushTimer = 0;
        state.player.rotation = 0;
        state.player.trickName = '';
        state.spawnedExit = false;
        
        // 4. Ensure next obstacle spawns right after this one
        state.nextObstacleDist = 0; 
        
        // 5. Decrement Life
        state.lives--;
        setLives(state.lives);
        if (state.lives <= 0) {
            state.status = 'GAME_OVER';
            setUiState('GAME_OVER');
            saveHighScore(state.score);
            getSoundManager().stopMusic();
        }
        
        getSoundManager().playCrash();
    };

    const loop = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const state = stateRef.current;
        
        if (state.status === 'PLAYING' && !isPaused) {
            state.frame++;
            
            const isNatas = state.player.state === 'NATAS_SPIN';
            const isArrested = state.player.state === 'ARRESTED';
            
            // --- WORLD STATE MANAGEMENT ---

            if (state.world === 'TRANSITION_DOWN') {
                // Cutscene: Player "slides down steep pipe"
                const startX = 180;
                const startY = 250; 
                const endX = startX + 300; // Much steeper geometry
                const endY = 1000;
                const totalDistX = endX - startX;
                
                // Calculate slope for Y position
                const slope = (endY - startY) / totalDistX;
                
                // Move player forward along X
                state.player.x += 6; 
                
                // Calculate current Y
                const currentPipeY = startY + (state.player.x - startX) * slope;
                state.player.y = currentPipeY - BASE_FLOOR_Y;
                
                // Lock rotation
                state.player.rotation = Math.atan(slope);
                state.player.state = 'JUMPING'; 
                
                // Camera follow (Parallax the pipe up as player goes down)
                // Map progress 0..1 to transitionY 0..-750
                const progress = (state.player.x - startX) / totalDistX;
                state.transitionY = -progress * 750;

                if (progress >= 1 || state.player.x >= endX) {
                     // Arrived at bottom
                     state.world = 'UNDERWORLD';
                     state.obstacles = []; // Clear normal obstacles
                     state.collectibles = [];
                     state.underworldTimer = 0;
                     state.transitionY = 0;
                     state.currentFloorY = BASE_FLOOR_Y;
                     state.player.rotation = 0;
                     state.player.x = 100; // Reset visual position for game view
                     
                     // SPAWN SAFE START PLATFORM IMMEDIATELY
                     const startPlatY = BASE_FLOOR_Y - 50;
                     const startPlat = {
                        id: Date.now(), x: 50, y: startPlatY, w: 800, h: 20, 
                        type: 'platform' as ObstacleType, isGrindable: false, isGap: false, isPlatform: true, passed: false
                     };
                     state.obstacles.push(startPlat);
                     
                     state.player.platformId = startPlat.id;
                     state.currentFloorY = startPlatY;
                     state.player.y = 0; 
                     state.player.vy = 0;
                     state.player.state = 'RUNNING';
                     state.player.pushTimer = 0;

                     state.nextObstacleDist = 0; 
                     state.spawnedExit = false;
                }
            } else {
                // --- NORMAL & UNDERWORLD GAMEPLAY ---

                // World Scroll (Pauses on specific states)
                if (!isNatas && !isArrested) {
                    state.score++;
                    state.totalScroll += SPEED;
                    state.nextObstacleDist -= SPEED;
                    state.obstacles.forEach(obs => obs.x -= SPEED);
                    state.collectibles.forEach(c => c.x -= SPEED);
                }

                // --- UNDERWORLD LOGIC ---
                if (state.world === 'UNDERWORLD') {
                    state.underworldTimer++;
                    
                    // Check for fall
                    if (state.player.y > 200) {
                        forceUnderworldRespawn();
                        requestRef.current = requestAnimationFrame(loop);
                        return; // Exit loop immediately
                    }

                    // Timer exit check
                    if (state.underworldTimer > 420 && !state.spawnedExit) {
                        if (state.nextObstacleDist > 0) state.nextObstacleDist = 0;
                    }
                }

                // --- ARREST ANIMATION ---
                if (isArrested) {
                     state.arrestTimer++;
                     const policeCar = state.obstacles.find(o => o.type === 'police_car' && o.doorOpen);
                     
                     if (policeCar) {
                          const targetX = policeCar.x + policeCar.w / 2; // Center of door
                          // Slide player towards door
                          if (state.player.x < targetX) state.player.x += 2;
                          
                          if (state.arrestTimer > 120) {
                               resetAfterArrest();
                          }
                     } else {
                         resetAfterArrest();
                     }
                }

                // --- PUSHING LOGIC ---
                if (state.player.state === 'RUNNING') {
                    if (state.player.isFakie) {
                        state.player.state = 'COASTING';
                    } else {
                        state.player.pushTimer++;
                        if (state.player.pushTimer > 90) {
                            state.player.state = 'COASTING';
                            state.player.pushTimer = 0;
                            state.player.coastingDuration = 120 + Math.random() * 180; // 2-5 seconds coast
                        }
                    }
                } else if (state.player.state === 'COASTING') {
                    state.player.pushTimer++;
                    if (state.player.pushTimer > state.player.coastingDuration) {
                        if (!state.player.isFakie) {
                            state.player.state = 'RUNNING';
                        }
                        state.player.pushTimer = 0;
                    }
                }

                // --- OBSTACLE SPAWNING ---
                if (state.nextObstacleDist <= 0 && !isArrested) {
                    const spawnX = canvas.width + 50;
                    
                    if (state.world === 'UNDERWORLD') {
                         // UNDERWORLD SPAWNING
                         if (state.underworldTimer > 420 && !state.spawnedExit) {
                             // Spawn Exit Ramp
                             const lastPlat = state.obstacles.filter(o => o.isPlatform).pop();
                             const surfaceY = lastPlat ? lastPlat.y : BASE_FLOOR_Y;
                             const rampH = 250;
                             
                             state.obstacles.push({
                                id: Date.now(), x: spawnX, 
                                y: surfaceY - rampH, 
                                w: 300, h: rampH, 
                                type: 'mega_ramp', isGrindable: false, isGap: false, isPlatform: true, passed: false
                             });
                             state.spawnedExit = true; 
                             state.nextObstacleDist = 99999; 
                         } else if (!state.spawnedExit) {
                             // Platforms + Coins
                             const gapSize = 60 + Math.random() * 100; 
                             const platW = 300 + Math.random() * 200; 
                             
                             const lastPlat = state.obstacles[state.obstacles.length - 1];
                             let platY = BASE_FLOOR_Y - 80;
                             if (lastPlat && lastPlat.isPlatform) {
                                 platY = lastPlat.y + (Math.random() > 0.5 ? 30 : -30);
                                 if (platY > BASE_FLOOR_Y - 40) platY = BASE_FLOOR_Y - 40;
                                 if (platY < BASE_FLOOR_Y - 150) platY = BASE_FLOOR_Y - 150;
                             }

                             state.obstacles.push({
                                id: Date.now(), x: spawnX, y: platY, w: platW, h: 20, 
                                type: 'platform', isGrindable: false, isGap: false, isPlatform: true, passed: false
                             });

                             const coinSpacing = 50;
                             const numCoins = Math.floor((platW - 100) / coinSpacing);
                             
                             for(let i = 0; i < numCoins; i++) {
                                 if (Math.random() > 0.1) { 
                                     state.collectibles.push({
                                         id: Date.now() + i * 10, 
                                         x: spawnX + 50 + (i * coinSpacing), 
                                         y: platY - 40, 
                                         type: 'COIN', 
                                         collected: false
                                     });
                                 }
                             }
                             
                             const currentDiamonds = state.collectibles.filter(c => c.type === 'DIAMOND').length; 
                             if (Math.random() > 0.9 && currentDiamonds === 0) {
                                  state.collectibles.push({
                                     id: Date.now() + 999, x: spawnX + platW/2, y: platY - 80, type: 'DIAMOND', collected: false
                                 });
                             }

                             state.nextObstacleDist = platW + gapSize;
                         }
                    } else {
                        // NORMAL WORLD SPAWNING
                        if (Math.random() < 0.15) {
                            // UNIFIED STRUCTURE LOGIC
                            const rampW = 100;
                            const platW = Math.random() > 0.5 ? 150 : 300;
                            const totalW = rampW + platW;
                            const structureHeight = 50;
                            
                            state.obstacles.push({
                                id: Date.now(),
                                x: spawnX,
                                y: BASE_FLOOR_Y - structureHeight,
                                w: totalW,
                                h: structureHeight,
                                type: 'concrete_structure',
                                isGrindable: false,
                                isGap: false,
                                isPlatform: true,
                                passed: false
                            });
                            
                            const stairW = 120;
                            state.obstacles.push({
                                id: Date.now()+1,
                                x: spawnX + totalW,
                                y: BASE_FLOOR_Y - structureHeight, 
                                w: stairW,
                                h: structureHeight,
                                type: 'stairs_down',
                                isGrindable: true, 
                                isGap: false,
                                isPlatform: true, 
                                passed: false
                            });
                            
                            state.obstacles.push({
                                id: Date.now()+2,
                                x: spawnX + totalW + stairW,
                                y: BASE_FLOOR_Y, 
                                w: 200,
                                h: 0, 
                                type: 'platform',
                                isGrindable: false,
                                isGap: false,
                                isPlatform: true,
                                passed: false
                            });
                            
                            state.nextObstacleDist = totalW + stairW + 300; 
                        } 
                        else {
                            const template = STANDARD_OBSTACLES[Math.floor(Math.random() * STANDARD_OBSTACLES.length)];
                            state.obstacles.push({
                                id: Date.now(),
                                x: spawnX,
                                y: BASE_FLOOR_Y - template.h + (template.yOffset || 0),
                                w: template.w,
                                h: template.h,
                                type: template.type,
                                isGrindable: template.grind,
                                isGap: template.gap,
                                isPlatform: template.isPlatform,
                                passed: false
                            });

                            if (Math.random() > 0.5) {
                                state.collectibles.push({
                                    id: Date.now() + 99, x: spawnX + template.w/2, y: BASE_FLOOR_Y - template.h - 60, type: 'COIN', collected: false
                                });
                            }

                            state.nextObstacleDist = Math.random() * 300 + 300; 
                        }
                    }
                }

                state.obstacles = state.obstacles.filter(obs => obs.x + obs.w > -200);
                state.collectibles = state.collectibles.filter(c => c.x > -200 && !c.collected);

                // Manage floating texts
                state.floatingTexts.forEach(ft => {
                    ft.y -= 1; // Float up
                    ft.life--;
                });
                state.floatingTexts = state.floatingTexts.filter(ft => ft.life > 0);

                // --- PHYSICS & FLOOR ---
                const playerX = state.player.x;
                
                // FORCE MOUNT MEGA RAMP (To prevent driving through it)
                // IMPORTANT FIX: We remove the check for !state.player.platformId so this triggers even if on a platform
                const megaRamp = state.obstacles.find(o => o.type === 'mega_ramp' && playerX >= o.x && playerX <= o.x + o.w + 50);
                if (megaRamp) {
                    // If we are overlapping the Mega Ramp, FORCE snapping to it.
                    state.player.platformId = megaRamp.id;
                } else if (!state.player.platformId) {
                    // Only check for OTHER mountable obstacles if we aren't already on one
                    if (state.player.y > -20 && state.player.vy >= 0) {
                        const ramp = state.obstacles.find(o => 
                            (o.type === 'ramp' || o.type === 'ramp_up' || o.type === 'concrete_structure') && 
                            playerX >= o.x && 
                            playerX <= o.x + o.w
                        );
                        
                        if (ramp) {
                             state.player.platformId = ramp.id;
                             let newY = ramp.y;
                             if (ramp.type === 'concrete_structure') {
                                 const rampW = 100;
                                 const relativeX = playerX - ramp.x;
                                 if (relativeX < rampW) {
                                     const progress = Math.max(0, relativeX / rampW);
                                     newY = (ramp.y + ramp.h) - (ramp.h * progress);
                                 } else {
                                     newY = ramp.y;
                                 }
                             } else {
                                 const progress = (playerX - ramp.x) / ramp.w;
                                 newY = (ramp.y + ramp.h) - (ramp.h * progress);
                             }
                             
                             state.currentFloorY = newY;
                             state.player.y = 0;
                             state.player.vy = 0;
                        }
                    }
                }

                // --- PLATFORM LOCKING LOGIC ---
                if (state.player.platformId) {
                    const activePlatform = state.obstacles.find(o => o.id === state.player.platformId);
                    if (activePlatform) {
                        // Check if we walked off
                        if (playerX < activePlatform.x || playerX > activePlatform.x + activePlatform.w) {
                            
                            // MEGA RAMP (QUARTER PIPE) AUTO LAUNCH
                            if (activePlatform.type === 'mega_ramp' && playerX > activePlatform.x + activePlatform.w) {
                                 // Force a cleaner exit
                                 exitUnderworld();
                            }
                            // NORMAL RAMP AUTO LAUNCH
                            else if (activePlatform.type === 'ramp' && playerX > activePlatform.x + activePlatform.w) {
                                state.player.vy = JUMP_FORCE;
                                state.player.state = 'JUMPING';
                                state.player.platformId = null;
                                getSoundManager().playLaunch();
                            } else {
                                // Chaining logic for other platforms
                                const nextPlat = state.obstacles.find(o => 
                                    o.isPlatform && 
                                    o.id !== activePlatform.id &&
                                    playerX >= o.x && 
                                    playerX <= o.x + o.w
                                );

                                if (nextPlat) {
                                    state.player.platformId = nextPlat.id;
                                    let newFloorY = nextPlat.y;
                                    // Interpolate Y for ramps
                                    if (nextPlat.type === 'ramp' || nextPlat.type === 'ramp_up') {
                                        const progress = (playerX - nextPlat.x) / nextPlat.w;
                                        newFloorY = (nextPlat.y + nextPlat.h) - (nextPlat.h * progress);
                                    } else if (nextPlat.type === 'mega_ramp') {
                                        // Circular Arc Physics for chaining
                                        const rampW = nextPlat.w;
                                        const rampH = nextPlat.h;
                                        const relativeX = playerX - nextPlat.x;
                                        
                                        const safeW = Math.max(rampW, 1);
                                        const safeH = Math.max(rampH, 1);
                                        const xc = (safeW*safeW - safeH*safeH) / (2*safeW);
                                        const R = safeW - xc;
                                        
                                        const distFromCenterX = relativeX - xc;
                                        const term = R*R - distFromCenterX*distFromCenterX;
                                        
                                        if (term >= 0) {
                                             newFloorY = nextPlat.y + Math.sqrt(term);
                                        } else {
                                             const progress = Math.max(0, Math.min(1, relativeX / rampW));
                                             newFloorY = (nextPlat.y + nextPlat.h) - (nextPlat.h * progress);
                                        }
                                    } else if (nextPlat.type === 'stairs_down') {
                                        const progress = (playerX - nextPlat.x) / nextPlat.w;
                                        newFloorY = nextPlat.y + (nextPlat.h * progress);
                                    } else if (nextPlat.type === 'concrete_structure') {
                                        const rampW = 100;
                                        const relativeX = playerX - nextPlat.x;
                                        if (relativeX < rampW) {
                                            const progress = relativeX / rampW;
                                            newFloorY = (nextPlat.y + nextPlat.h) - (nextPlat.h * progress);
                                        } else {
                                            newFloorY = nextPlat.y;
                                        }
                                    }
                                    state.currentFloorY = newFloorY;
                                    state.player.y = 0;
                                    state.player.vy = 0;
                                } else {
                                    // Walked off into air
                                    const prevY = state.currentFloorY;
                                    state.player.platformId = null;
                                    state.currentFloorY = BASE_FLOOR_Y;
                                    if (prevY < BASE_FLOOR_Y) {
                                        state.player.y = prevY - BASE_FLOOR_Y; 
                                    } else {
                                        state.player.y = 0;
                                    }
                                }
                            }
                        } else {
                            // Still on platform - update Y
                            // RAMP SLOPE LOGIC
                            if (activePlatform.type === 'ramp' || activePlatform.type === 'ramp_up') {
                                const progress = (playerX - activePlatform.x) / activePlatform.w;
                                state.currentFloorY = (activePlatform.y + activePlatform.h) - (activePlatform.h * progress);
                            } else if (activePlatform.type === 'mega_ramp') {
                                // Circular Arc Physics
                                const rampW = activePlatform.w;
                                const rampH = activePlatform.h;
                                const relativeX = playerX - activePlatform.x;
                                
                                const safeW = Math.max(rampW, 1);
                                const safeH = Math.max(rampH, 1);
                                const xc = (safeW*safeW - safeH*safeH) / (2*safeW);
                                const R = safeW - xc;
                                
                                const distFromCenterX = relativeX - xc;
                                const term = R*R - distFromCenterX*distFromCenterX;
                                
                                if (term >= 0) {
                                     state.currentFloorY = activePlatform.y + Math.sqrt(term);
                                     // Calculate slope angle for rotation
                                     const y_rel = Math.sqrt(term);
                                     const x_rel_center = relativeX - xc;
                                     const slope = -x_rel_center / y_rel; 
                                     state.player.rotation = -Math.atan(slope);
                                } else {
                                     const progress = Math.max(0, Math.min(1, relativeX / rampW));
                                     state.currentFloorY = (activePlatform.y + activePlatform.h) - (activePlatform.h * progress);
                                }
                            } else if (activePlatform.type === 'stairs_down') {
                                const progress = (playerX - activePlatform.x) / activePlatform.w;
                                state.currentFloorY = activePlatform.y + (activePlatform.h * progress);
                                
                                if (state.frame % 5 === 0 && (state.player.state === 'RUNNING' || state.player.state === 'COASTING')) {
                                    state.score += 10;
                                    getSoundManager().playFirecracker();
                                    if (!activePlatform.firecrackerTriggered) {
                                        activePlatform.firecrackerTriggered = true;
                                        addFloatingText(playerX, state.currentFloorY - 80, "Firecracker +100", "#ef4444");
                                        state.score += 100;
                                    }
                                }
                            } else if (activePlatform.type === 'concrete_structure') {
                                 const rampW = 100;
                                 const relativeX = playerX - activePlatform.x;
                                 if (relativeX < rampW) {
                                     const progress = Math.max(0, relativeX / rampW);
                                     state.currentFloorY = (activePlatform.y + activePlatform.h) - (activePlatform.h * progress);
                                 } else {
                                     state.currentFloorY = activePlatform.y;
                                 }
                            } else {
                                state.currentFloorY = activePlatform.y;
                            }
                            
                            state.player.y = 0;
                            state.player.vy = 0;
                        }
                    } else {
                        state.player.platformId = null;
                        state.currentFloorY = BASE_FLOOR_Y;
                    }
                } else {
                    // Not locked to a platform
                    state.currentFloorY = BASE_FLOOR_Y;
                    // Mount logic handled in FORCE MOUNT block above
                }

                // Apply Gravity
                if (!state.player.platformId && state.player.state !== 'GRINDING' && state.player.state !== 'NATAS_SPIN' && state.player.state !== 'ARRESTED') {
                    state.player.vy += GRAVITY;
                    state.player.y += state.player.vy;
                }
                
                // Calculate absolute feet Y
                const absFeetY = state.currentFloorY + state.player.y;

                // TUMBLING LOGIC
                if (state.player.state === 'TUMBLING') {
                    state.player.rotation += 0.4; // Fast spin
                    if (state.player.y >= 0 && state.player.vy > 0) {
                        state.player.y = 0;
                        state.player.vy = 0;
                        state.player.rotation = 0;
                        state.player.state = 'RUNNING';
                        state.player.pushTimer = 0;
                    }
                }
                // NATAS SPIN LOGIC
                else if (state.player.state === 'NATAS_SPIN') {
                     state.player.rotation += 0.1; 
                     if (state.player.rotation >= state.player.natasSpinTarget) {
                          if (state.player.rotation >= state.player.natasSpinTarget) {
                              state.player.state = 'JUMPING';
                              state.player.vy = -5; 
                              state.player.rotation = 0;
                              state.player.trickName = '';
                          }
                     }
                     const fullRotations = Math.floor(state.player.rotation / (Math.PI * 2));
                     if (fullRotations > state.player.natasSpinCount) {
                          state.player.natasSpinCount = fullRotations;
                          if (fullRotations <= 3) { 
                               state.score += 300;
                               addFloatingText(120, state.currentFloorY - 80, "Natas Spin +300", "#fbbf24");
                               getSoundManager().playGrind(); 
                          }
                     }
                }
                // LANDING ON PLATFORMS (Mid-Air Check)
                else if (state.player.vy > 0 && !state.player.platformId) {
                     const potentialPlatforms = state.obstacles.filter(o => 
                         o.isPlatform && 
                         playerX >= o.x && 
                         playerX <= o.x + o.w
                     );
                     
                     for (const plat of potentialPlatforms) {
                         let platY = plat.y;
                         if (plat.type === 'ramp' || plat.type === 'ramp_up') {
                            const progress = (playerX - plat.x) / plat.w;
                            platY = (plat.y + plat.h) - (plat.h * progress);
                         } else if (plat.type === 'mega_ramp') {
                            const rampW = plat.w;
                            const rampH = plat.h;
                            const relativeX = playerX - plat.x;
                            const safeW = Math.max(rampW, 1);
                            const safeH = Math.max(rampH, 1);
                            const xc = (safeW*safeW - safeH*safeH) / (2*safeW);
                            const R = safeW - xc;
                            const distFromCenterX = relativeX - xc;
                            const term = R*R - distFromCenterX*distFromCenterX;
                            if (term >= 0) {
                                 platY = plat.y + Math.sqrt(term);
                            } else {
                                 const progress = Math.max(0, Math.min(1, relativeX / rampW));
                                 platY = (plat.y + plat.h) - (plat.h * progress);
                            }
                         } else if (plat.type === 'stairs_down') {
                            const progress = (playerX - plat.x) / plat.w;
                            platY = plat.y + (plat.h * progress);
                         } else if (plat.type === 'concrete_structure') {
                             const rampW = 100;
                             const relativeX = playerX - plat.x;
                             if (relativeX < rampW) {
                                 const progress = Math.max(0, relativeX / rampW);
                                 platY = (plat.y + plat.h) - (plat.h * progress);
                             } else {
                                 platY = plat.y;
                             }
                         }
                         
                         const prevAbsY = absFeetY - state.player.vy;
                         if (prevAbsY <= platY + 15 && absFeetY >= platY) {
                             state.player.platformId = plat.id;
                             state.currentFloorY = platY;
                             state.player.y = 0;
                             state.player.vy = 0;
                             state.player.state = 'RUNNING';
                             state.player.pushTimer = 0;
                             getSoundManager().playGrind();
                             break;
                         }
                     }
                }
                
                // NORMAL LANDING (Base Floor collision)
                if (state.player.y > 0 && !state.player.platformId) { 
                    if (state.world === 'UNDERWORLD') {
                        // DO NOTHING. Let player fall. 
                    } else {
                        // NORMAL WORLD: Check gaps
                        let inGap = false;
                        for (const obs of state.obstacles) {
                            if (obs.isGap && playerX > obs.x && playerX < obs.x + obs.w) {
                                inGap = true;
                                break;
                            }
                        }
    
                        if (inGap) {
                            // Fall through floor hole
                            if (state.player.state !== 'CRASHED') {
                                 state.player.vy += 0.5; 
                                 if (state.player.y > 50) handleCrash(); 
                            }
                        } else {
                            // SOLID GROUND LANDING
                            state.player.y = 0;
                            state.player.vy = 0;
    
                            if (state.player.trickName) {
                                const rot = Math.abs(state.player.rotation % (Math.PI * 2));
                                const dist0 = rot; 
                                const dist180 = Math.abs(rot - Math.PI);
                                const dist360 = Math.abs(rot - Math.PI * 2);
                                const threshold = 0.6;
    
                                const isLanded = dist0 < threshold || dist180 < threshold || dist360 < threshold;
    
                                if (isLanded) {
                                    if (state.player.trickName === '180') {
                                        state.score += 50;
                                        state.count180++;
                                        addFloatingText(playerX, state.currentFloorY - 80, "180 +50", "#fbbf24");
                                    } else if (state.player.trickName === '360') {
                                        state.score += 100;
                                        state.count360++;
                                        addFloatingText(playerX, state.currentFloorY - 80, "360 +100", "#fbbf24");
                                    } else {
                                        state.score += 500; 
                                    }
                                } else {
                                     addFloatingText(playerX, state.currentFloorY - 80, "Sketchy", "#94a3b8");
                                }
                                
                                state.player.rotation = 0; 
                                state.player.trickName = '';
                                getSoundManager().playGrind(); 
                            }
    
                            if (state.player.state !== 'CRASHED' && state.player.state !== 'ARRESTED' && state.player.state !== 'TUMBLING') {
                                state.player.state = state.player.isFakie ? 'COASTING' : 'RUNNING';
                                state.player.pushTimer = 0;
                            } 
                        }
                    }
                }

                // Tricks Rotation
                if (state.player.trickName === 'KICKFLIP') {
                    state.player.rotation += 0.4; 
                    if (state.player.rotation > Math.PI * 2) {
                        state.player.rotation = 0;
                        state.player.trickName = '';
                        state.score += 100; 
                    }
                } else if (state.player.trickName === '180') {
                    if (state.player.rotation < Math.PI) state.player.rotation += 0.15;
                } else if (state.player.trickName === '360') {
                    if (state.player.rotation < Math.PI * 2) state.player.rotation += 0.3;
                }

                // Check Collectibles
                const playerRect = { x: state.player.x, y: state.currentFloorY + state.player.y - 50, w: 30, h: 50 };
                state.collectibles.forEach(c => {
                    if (
                        playerRect.x < c.x + 20 &&
                        playerRect.x + playerRect.w > c.x - 20 &&
                        playerRect.y < c.y + 20 &&
                        playerRect.y + playerRect.h > c.y - 20
                    ) {
                        c.collected = true;
                        const points = c.type === 'COIN' ? 100 : 500;
                        state.score += points;
                        addFloatingText(c.x, c.y, `+${points}`, c.type === 'COIN' ? '#fbbf24' : '#22d3ee');
                        getSoundManager().playMetalHit();
                    }
                });

                const pHit = { x: state.player.x, y: state.currentFloorY + state.player.y - 40, w: 20, h: 40 }; 
                
                let onGrind = false;

                // --- COLLISION DETECTION LOOP ---
                for (const obs of state.obstacles) {
                    if (obs.type === 'stairs_down' && !obs.passed) {
                         if (playerX > obs.x + obs.w) {
                            obs.passed = true;
                            if (state.player.state === 'JUMPING') {
                                state.score += 200; 
                                addFloatingText(playerX, state.currentFloorY - 100, "STAIRS +200", "#22c55e");
                                getSoundManager().playJump();
                            }
                         }
                    }
                    
                    if (obs.isPlatform && !obs.isGrindable) continue; 

                    if (obs.x < pHit.x + pHit.w && obs.x + obs.w > pHit.x) {
                        
                        if ((state.player.state as PlayerState) === 'TUMBLING' || state.player.state === 'CRASHED' || state.player.state === 'ARRESTED') continue;

                        // Ignore ramp collision if jumping over it
                        if (obs.type === 'ramp' && state.player.y < -10) continue;

                        // Specific Gap Wall Collision
                        if (obs.isGap) {
                            const boardFront = state.player.x + 15;
                            if (boardFront > obs.x && boardFront < obs.x + 20 && state.player.y > 0) {
                                handleCrash();
                            }
                            continue;
                        }
                        
                        // GREEN BIN UNDERWORLD LOGIC
                        if (obs.type === 'bin' && state.world === 'NORMAL' && !obs.passed) {
                             const feetAbsY = state.currentFloorY + state.player.y;
                             const binTop = obs.y;
                             if (state.player.vy > 0 && Math.abs(feetAbsY - binTop) < 20) {
                                  enterUnderworld();
                                  obs.passed = true;
                                  continue; 
                             }
                        }

                        // Check grind
                        const feetY = state.currentFloorY + state.player.y;
                        
                        let targetGrindY = obs.y;
                        if (obs.type === 'stairs_down') {
                            const progress = Math.max(0, Math.min(1, (playerX - obs.x) / obs.w));
                            targetGrindY = (obs.y - 15) + (obs.h * progress);
                        } else if (obs.type === 'flat_rail') {
                             targetGrindY = obs.y + obs.h - 10;
                        } else if (obs.type === 'rail') {
                             targetGrindY = obs.y + 5;
                        } else if (obs.type === 'ledge' || obs.type === 'curb' || obs.type === 'cybertruck' || obs.type === 'hydrant') {
                             targetGrindY = obs.y;
                        }

                        const distY = Math.abs(feetY - targetGrindY);
                        const isCloseEnough = distY < 35; 
                        
                        if (isCloseEnough && obs.isGrindable && state.player.vy > 0) {
                            if (obs.type === 'hydrant') {
                                 state.player.y = obs.y - state.currentFloorY;
                                 state.player.vy = 0;
                                 state.player.state = 'NATAS_SPIN';
                                 state.player.rotation = 0;
                                 state.player.natasSpinCount = 0;
                                 state.player.natasSpinTarget = Math.PI * 2; 
                                 state.player.natasTapCount = 0;
                                 if (!obs.passed) {
                                     obs.passed = true;
                                     getSoundManager().playGrind();
                                 }
                            } else {
                                state.player.y = targetGrindY - state.currentFloorY;
                                state.player.vy = 0;
                                state.player.state = 'GRINDING';
                                onGrind = true;
                                if (!obs.passed) {
                                    getSoundManager().playGrind();
                                    obs.passed = true; 
                                    state.grindsPerformed++;
                                    
                                    if (obs.type === 'stairs_down') {
                                        state.score += 300;
                                        addFloatingText(120, state.currentFloorY - 50, "300", "#fbbf24");
                                    } else if (obs.type === 'rail') {
                                        state.score += 200;
                                        addFloatingText(120, state.currentFloorY - 50, "200", "#fbbf24");
                                    } else if (obs.type === 'flat_rail' || obs.type === 'ledge' || obs.type === 'curb' || obs.type === 'cybertruck') {
                                        state.score += 100;
                                        addFloatingText(120, state.currentFloorY - 50, "100", "#fbbf24");
                                    } else {
                                        state.score += 100;
                                    }
                                }
                            }
                        } else if (!isCloseEnough && !obs.isPlatform && obs.type !== 'ramp_up' && obs.type !== 'stairs_down' && obs.type !== 'concrete_structure') {
                            // Collision! 
                            if (obs.type === 'rail' || obs.type === 'flat_rail') {
                                 continue;
                            }
                            
                            const feetYCheck = state.currentFloorY + state.player.y;
                            const isInsideY = feetYCheck > obs.y + 5; 

                            if (isInsideY) {
                                if (obs.type === 'police_car') {
                                    if (!obs.passed) {
                                        obs.passed = true;
                                        obs.doorOpen = true;
                                        state.player.state = 'ARRESTED';
                                        state.score -= 1000;
                                        addFloatingText(120, state.currentFloorY - 100, "Fine -1000", "#ef4444");
                                        getSoundManager().playSiren();
                                        state.arrestTimer = 0;
                                    }
                                } else if (obs.type === 'bin') {
                                    if (!obs.passed) {
                                        obs.passed = true;
                                        state.score -= 500;
                                        addFloatingText(120, state.currentFloorY - 50, "-500", "#ef4444");
                                        triggerTumble();
                                    }
                                } else if (obs.type === 'grey_bin') {
                                    if (!obs.passed) {
                                        obs.passed = true;
                                        state.score -= 300;
                                        addFloatingText(120, state.currentFloorY - 50, "-300", "#94a3b8");
                                        triggerTumble();
                                    }
                                } else if (obs.type === 'cart') {
                                    if (!obs.passed) {
                                        obs.passed = true;
                                        state.score -= 400;
                                        addFloatingText(120, state.currentFloorY - 50, "-400", "#cbd5e1");
                                        getSoundManager().playMetalHit();
                                        triggerTumble();
                                    }
                                } else if (obs.type === 'cybertruck') {
                                    if (!obs.passed) {
                                        obs.passed = true;
                                        state.score -= 1000;
                                        addFloatingText(120, state.currentFloorY - 100, "-1000", "#ef4444");
                                        triggerMarsLaunch();
                                    }
                                } else if (obs.type === 'hydrant') {
                                     if (!obs.passed) {
                                         obs.passed = true;
                                         obs.sprayingWater = true;
                                         state.score -= 200;
                                         triggerHydrantLaunch();
                                     }
                                } else {
                                    handleCrash();
                                }
                            }
                        }
                    }
                }
                
                if (state.player.state === 'GRINDING' && !onGrind) {
                    state.player.state = 'JUMPING';
                }

                setScore(state.score);
                setStats({
                    grinds: state.grindsPerformed,
                    jumps: state.jumpsPerformed,
                    c180: state.count180,
                    c360: state.count360
                });
            }
        }

        draw(ctx, state);
        requestRef.current = requestAnimationFrame(loop);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(loop);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPaused]);

    const addFloatingText = (x: number, y: number, text: string, color: string) => {
        stateRef.current.floatingTexts.push({
            id: Date.now(),
            x, y, text, color,
            life: 60 
        });
    };

    const triggerTumble = () => {
        const state = stateRef.current;
        state.player.state = 'TUMBLING';
        state.player.vy = -8; 
        state.player.rotation = 0;
        getSoundManager().playCrash(); 
    };

    const triggerHydrantLaunch = () => {
         const state = stateRef.current;
         state.player.state = 'TUMBLING';
         state.player.vy = -25; 
         state.player.rotation = 0;
         getSoundManager().playLaunch();
         addFloatingText(120, state.currentFloorY - 80, "Slam!", "#38bdf8");
    };

    const triggerMarsLaunch = () => {
        const state = stateRef.current;
        state.player.state = 'TUMBLING';
        state.player.vy = -45; 
        state.player.rotation = 0;
        getSoundManager().playLaunch();
    };

    const resetAfterArrest = () => {
        const state = stateRef.current;
        state.player.state = 'RUNNING';
        state.player.x = 100;
        state.player.y = 0;
        state.player.vy = 0;
        state.player.rotation = 0;
        state.obstacles = state.obstacles.filter(o => o.x > 400); 
        state.arrestTimer = 0;
    };

    const handleCrash = () => {
        const state = stateRef.current;
        if (state.player.state === 'CRASHED') return; 

        state.player.state = 'CRASHED';
        getSoundManager().playCrash();
        state.lives--;
        setLives(state.lives);

        if (state.lives <= 0) {
            state.status = 'GAME_OVER';
            setUiState('GAME_OVER');
            saveHighScore(state.score);
            getSoundManager().stopMusic();
        } else {
            setTimeout(() => {
                if (state.world === 'UNDERWORLD') {
                    forceUnderworldRespawn();
                } else {
                    state.player.y = -200; 
                    state.player.vy = 0;
                    state.player.state = 'JUMPING';
                    state.player.platformId = null; 
                    state.obstacles = state.obstacles.filter(o => o.x > 400); 
                }
                
                if (state.nextObstacleDist > 2000) state.nextObstacleDist = 500;

                state.player.rotation = 0;
                state.player.trickName = '';
                state.player.isFakie = false; 
            }, 1000);
        }
    };

    const draw = (ctx: CanvasRenderingContext2D, state: any) => {
        let viewOffsetY = state.transitionY; 
        if (state.player.y < -150) {
            viewOffsetY = -state.player.y - 150; 
        }

        // BACKGROUND
        if (state.world === 'UNDERWORLD') {
            drawUnderworldBackground(ctx, ctx.canvas.width, ctx.canvas.height, state.totalScroll);
        } else if (state.world === 'TRANSITION_DOWN') {
             // Draw pipe for transitions down
             drawTransitionPipe(ctx, ctx.canvas.width, ctx.canvas.height, viewOffsetY);
        } else {
            drawCityBackground(ctx, ctx.canvas.width, ctx.canvas.height, state.totalScroll, BASE_FLOOR_Y, viewOffsetY);
        }

        ctx.save();
        ctx.translate(0, viewOffsetY);

        // Floor Line 
        if (state.world === 'NORMAL') {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.beginPath();

            const gaps = state.obstacles
                .filter((o: Obstacle) => o.type === 'gap')
                .sort((a: Obstacle, b: Obstacle) => a.x - b.x);

            let currentX = 0;
            const floorY = BASE_FLOOR_Y;

            gaps.forEach((gap: Obstacle) => {
                if (gap.x + gap.w > 0 && gap.x < ctx.canvas.width) {
                    if (gap.x > currentX) {
                        ctx.moveTo(currentX, floorY);
                        ctx.lineTo(gap.x, floorY);
                    }
                    currentX = Math.max(currentX, gap.x + gap.w);
                }
            });

            if (currentX < ctx.canvas.width) {
                ctx.moveTo(currentX, floorY);
                ctx.lineTo(ctx.canvas.width, floorY);
            }
            ctx.stroke();
        }

        // OBSTACLES - Only draw in normal or underworld, NOT during transition down
        if (state.world !== 'TRANSITION_DOWN') {
             state.obstacles.forEach((obs: Obstacle) => {
                drawObstacle(ctx, obs.type, obs.x, obs.y, obs.w, obs.h, obs.sprayingWater, obs.doorOpen);
             });
        }

        // COLLECTIBLES
        state.collectibles.forEach((c: Collectible) => {
            if (!c.collected) {
                drawCollectible(ctx, c.type, c.x, c.y, state.frame);
            }
        });

        // PLAYER
        if (state.status !== 'GAME_OVER') {
            const isHiddenInCar = state.player.state === 'ARRESTED' && state.arrestTimer > 40;
            
            if (!isHiddenInCar) {
                const drawY = state.currentFloorY + state.player.y;
                drawStickman(
                    ctx, 
                    state.selectedChar, 
                    state.player.x, 
                    drawY - 25, 
                    state.frame, 
                    state.player.state,
                    state.player.rotation,
                    state.player.trickName,
                    state.player.isFakie
                );
            }
        }
        
        if (state.player.trickName && state.player.state !== 'CRASHED') {
            ctx.fillStyle = '#c52323';
            ctx.font = 'bold 20px Arial';
            ctx.fillText(state.player.trickName, 90, state.currentFloorY + state.player.y - 70);
        }

        state.floatingTexts.forEach((ft: FloatingText) => {
            ctx.save();
            ctx.fillStyle = ft.color;
            ctx.font = 'bold 24px Arial';
            ctx.globalAlpha = ft.life / 30; 
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
        });

        ctx.restore(); 
    };

    const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
        const target = e.target as HTMLElement;
        // Prevent jumping when clicking the carousel or buttons
        if (target.closest('.hud-button') || target.closest('.c3d-area')) return;

        if (uiState !== 'PLAYING' || isPaused) return;
        const state = stateRef.current;
        
        if (state.player.state === 'ARRESTED') return; 

        if ('touches' in e) state.touchStartY = e.touches[0].clientY;
        else state.touchStartY = e.clientY;
        
        const now = Date.now();
        if (now - state.lastTapTime < 300) state.tapCount++;
        else state.tapCount = 1;
        state.lastTapTime = now;

        if (state.player.state === 'NATAS_SPIN') {
             if (state.player.natasSpinCount < 3) {
                 const currentTime = Date.now();
                 if (currentTime - state.player.lastNatasTapTime > 200) {
                     state.player.natasTapCount = 0; 
                 }
                 state.player.natasTapCount++;
                 state.player.lastNatasTapTime = currentTime;

                 if (state.player.natasTapCount >= 3) {
                     if (state.player.natasSpinTarget < Math.PI * 6) {
                         state.player.natasSpinTarget += Math.PI * 2;
                         addFloatingText(state.player.x, state.currentFloorY - 120, "SPIN +1", "#fbbf24");
                         getSoundManager().playGrind();
                     }
                     state.player.natasTapCount = 0; 
                 }
             }
             return;
        }

        const currentState = state.player.state; 

        if (currentState === 'RUNNING' || currentState === 'COASTING' || currentState === 'GRINDING') {
            // RAMP BOOST CHECK: Player jumps WHILE riding up a ramp
            const activePlat = state.obstacles.find(o => o.id === state.player.platformId);
            const isRidingRamp = activePlat && activePlat.type === 'ramp';

            // Calculate absolute Y before detaching from platform
            if (state.player.platformId) {
                 const absY = state.currentFloorY + state.player.y;
                 state.player.y = absY - BASE_FLOOR_Y;
                 state.player.platformId = null;
            }

            if (isRidingRamp) {
                 state.player.vy = JUMP_FORCE * 1.8; // Boosted Jump
                 state.score += 500;
                 addFloatingText(state.player.x, state.currentFloorY - 100, "RAMP BOOST +500", "#3b82f6");
                 getSoundManager().playLaunch();
            } else {
                 state.player.vy = JUMP_FORCE;
                 getSoundManager().playJump();
            }

            state.player.state = 'JUMPING';
            state.player.y -= 1; 
            state.jumpsPerformed++;
            
            if (currentState === 'COASTING' && !state.player.isFakie) {
                 state.player.state = 'RUNNING';
            }

        } else if (currentState === 'JUMPING') {
            if (state.tapCount === 2) {
                state.player.trickName = '180';
                state.player.rotation = 0;
                state.player.isFakie = !state.player.isFakie;
                getSoundManager().playDoubleJump();
            } else if (state.tapCount === 3) {
                state.player.trickName = '360';
                state.player.rotation = 0;
                state.player.isFakie = !state.player.isFakie;
                getSoundManager().playDoubleJump();
            }
        }
    };

    const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
         if (uiState !== 'PLAYING' || isPaused) return;
         const state = stateRef.current;
         
         if (state.player.state === 'ARRESTED') return;

         let clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;

         const deltaY = clientY - state.touchStartY;
         if (Math.abs(deltaY) > 30 && state.player.state !== 'NATAS_SPIN') {
             state.player.trickName = 'KICKFLIP';
             state.player.rotation = 0;
             getSoundManager().playTrick();
         } else {
             if (state.player.state === 'JUMPING' && state.player.vy < -5) {
                 state.player.vy *= 0.4;
             }
         }
    };

    const startGame = () => {
        const state = stateRef.current;
        state.status = 'PLAYING';
        state.score = 0;
        state.lives = 3;
        state.obstacles = [];
        state.player.x = 100;
        state.player.y = 0;
        state.player.state = 'RUNNING';
        state.player.trickName = '';
        state.player.isFakie = false;
        state.selectedChar = character; // Use the character selected in the Carousel
        state.nextObstacleDist = 0;
        state.currentFloorY = BASE_FLOOR_Y;
        state.jumpsPerformed = 0;
        state.count180 = 0;
        state.count360 = 0;
        state.grindsPerformed = 0;
        state.totalScroll = 0;
        state.player.pushTimer = 0;
        state.player.pushCount = 0;
        state.player.targetPushes = 3; 
        state.arrestTimer = 0;
        
        state.player.natasSpinCount = 0;
        state.player.natasSpinTarget = 0;
        state.player.natasTapCount = 0;
        state.player.lastNatasTapTime = 0;
        state.player.platformId = null;
        state.world = 'NORMAL';
        state.underworldTimer = 0;
        state.spawnedExit = false;
        state.transitionY = 0;
        state.collectibles = [];
        
        setScore(0);
        setStats({ grinds: 0, jumps: 0, c180: 0, c360: 0 });
        setLives(3);
        setUiState('PLAYING');
        setIsPaused(false);
        getSoundManager().startMusic();
    };

    const formatScore = (s: number) => {
        const absScore = Math.abs(s).toString().padStart(6, '0');
        return s < 0 ? `-${absScore}` : absScore;
    };

    // Get default name for current character
    const currentCharacterInfo = CHARACTERS.find(c => c.id === character);
    const defaultName = currentCharacterInfo ? currentCharacterInfo.defaultName.toUpperCase() : "PLAYER";
    const currentCharacterIndex = CHARACTERS.findIndex(c => c.id === character);

    return (
        <div 
            className="min-h-screen bg-gray-900 text-white flex flex-col relative"
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* HUD */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-10 pointer-events-none">
                
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#c52323] to-red-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                        INVERT <span className="text-white not-italic font-bold text-lg tracking-normal">- THE GAME</span>
                    </h1>
                    
                    <div className="flex flex-col">
                         <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">High Score</span>
                         <div className="font-mono text-xl font-bold text-white/80 drop-shadow-sm">
                            {formatScore(highScore)}
                        </div>
                    </div>
                    
                    <div className="font-mono text-4xl font-bold text-white drop-shadow-md mt-1">
                        {formatScore(score)}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3 pointer-events-auto">
                    <div className="flex gap-1 p-2 bg-black/40 rounded-full backdrop-blur-sm border border-white/5 items-center">
                        {Array.from({length: 3}).map((_, i) => (
                            <SkateboardIcon 
                                key={i} 
                                className={`w-6 h-6 transition-all duration-300 ${i < lives ? 'text-[#c52323] drop-shadow-[0_0_5px_rgba(197,35,35,0.8)]' : 'text-gray-700'}`} 
                            />
                        ))}
                    </div>
                    
                    <div className="flex gap-2">
                        <button 
                            onClick={toggleMute} 
                            className="hud-button bg-gray-800 p-2 rounded-full hover:bg-gray-700 border border-gray-600"
                            title={isMuted ? "Unmute" : "Mute"}
                        >
                            {isMuted ? <SpeakerXMarkIcon /> : <SpeakerWaveIcon />}
                        </button>
                        
                        <button 
                            onClick={togglePause} 
                            className="hud-button bg-gray-800 p-2 rounded-full hover:bg-gray-700 border border-gray-600"
                            title={isPaused ? "Resume" : "Pause"}
                        >
                            {isPaused ? <PlayIcon /> : <PauseIcon />}
                        </button>

                        <button onClick={onClose} className="hud-button bg-gray-800 px-3 py-2 rounded hover:bg-gray-700 border border-gray-600">
                            Exit
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Box - Bottom Left (Beneath Game) - CORRECTED: Single Row */}
            {uiState === 'PLAYING' && (
                <div className="absolute bottom-6 left-4 z-10 pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md border-l-4 border-[#c52323] p-3 rounded-r-lg shadow-lg flex flex-row gap-4 items-center">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] uppercase tracking-wider text-gray-400">Grinds</span>
                            <span className="font-bold text-white text-lg leading-none">{stats.grinds}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] uppercase tracking-wider text-gray-400">Jumps</span>
                            <span className="font-bold text-white text-lg leading-none">{stats.jumps}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] uppercase tracking-wider text-yellow-400">180s</span>
                            <span className="font-bold text-white text-lg leading-none">{stats.c180}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] uppercase tracking-wider text-cyan-400">360s</span>
                            <span className="font-bold text-white text-lg leading-none">{stats.c360}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* PAUSE OVERLAY */}
            {isPaused && uiState === 'PLAYING' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-600 text-center shadow-2xl">
                        <h2 className="text-3xl font-bold mb-4">PAUSED</h2>
                        <button 
                            onClick={togglePause}
                            className="hud-button bg-[#c52323] text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg hover:bg-red-600"
                        >
                            RESUME
                        </button>
                    </div>
                </div>
            )}

            <canvas 
                ref={canvasRef} 
                width={window.innerWidth > 800 ? 800 : window.innerWidth} 
                height={400}
                className="w-full h-full object-contain flex-grow bg-gray-900"
            />

            {uiState === 'MENU' && (
                <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20 p-6 overflow-y-auto">
                    <button 
                        onClick={onClose}
                        className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="font-bold tracking-wider">EXIT</span>
                    </button>

                    <img 
                        src="https://github.com/user-attachments/assets/d747b126-c6a0-4433-ab22-37a68c8c6298" 
                        alt="INVERT THE GAME"
                        className="w-32 max-w-full h-auto mb-2 object-contain drop-shadow-[0_0_15px_rgba(197,35,35,0.5)]"
                    />
                    
                    <div className="mb-4 text-center">
                         <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">High Score</span>
                         <div className="text-2xl font-mono font-bold text-[#c52323]">{highScore}</div>
                    </div>

                    <p className="text-gray-400 mb-4 text-center text-xs md:text-sm max-w-md leading-relaxed">
                        Tap=Ollie | Swipe=Flip | 2xTap=180 | 3xTap=360<br/>
                        Rapid Tap on Hydrant = Natas Spin
                    </p>

                    {/* NEW 3D CAROUSEL */}
                    <Carousel3D 
                        items={CHARACTERS.map(c => ({
                            id: c.id,
                            label: c.name,
                            content: <CharacterPreview charId={c.id} />
                        }))}
                        selectedIndex={currentCharacterIndex !== -1 ? currentCharacterIndex : 0}
                        onSelect={(index) => {
                            if (index === currentCharacterIndex) {
                                startGame();
                            } else {
                                setCharacter(CHARACTERS[index].id);
                            }
                        }}
                    />
                    
                    <div className="relative group w-full max-w-xs mb-8 text-center">
                        <label className="block text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold mb-2">
                            Choose your own name
                        </label>
                        <input 
                            type="text"
                            value={userName}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                                setUserName(e.target.value);
                                localStorage.setItem('invert-skate-username', e.target.value);
                            }}
                            placeholder={defaultName}
                            className="bg-transparent border-b border-gray-700 w-full text-white text-center font-bold text-xl py-2 focus:border-[#c52323] outline-none uppercase tracking-widest transition-colors placeholder-gray-600 focus:placeholder-gray-800"
                        />
                    </div>
                </div>
            )}

            {uiState === 'GAME_OVER' && (
                <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center z-20 p-6">
                    <h2 className="text-5xl font-black text-white mb-4">GAME OVER</h2>
                    <div className="text-3xl font-mono mb-2">{formatScore(score)}</div>
                    <div className="text-sm text-white/80 mb-8">
                        High Score: {highScore}
                    </div>
                    
                    <div className="flex gap-4 text-center mb-8 bg-black/20 p-4 rounded-lg">
                         <div>
                            <div className="font-bold text-xl">{stats.grinds}</div>
                            <div className="text-xs text-gray-300">GRINDS</div>
                         </div>
                         <div>
                            <div className="font-bold text-xl">{stats.c180}</div>
                            <div className="text-xs text-gray-300">180s</div>
                         </div>
                         <div>
                            <div className="font-bold text-xl">{stats.c360}</div>
                            <div className="text-xs text-gray-300">360s</div>
                         </div>
                    </div>

                    <button 
                        onClick={startGame}
                        className="bg-white text-black font-bold py-3 px-8 rounded-xl text-lg shadow-lg"
                    >
                        TRY AGAIN
                    </button>
                    <button 
                        onClick={() => setUiState('MENU')}
                        className="mt-4 text-white/70 hover:text-white"
                    >
                        Menu
                    </button>
                </div>
            )}
        </div>
    );
}
