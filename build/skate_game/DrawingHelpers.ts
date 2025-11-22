
import React from 'react';

export type CharacterType = 'male_short' | 'male_cap' | 'female_long' | 'female_short' | 'alien';

export const CHARACTERS: {id: CharacterType, name: string, defaultName: string}[] = [
    { id: 'female_long', name: 'Bali', defaultName: 'Bali' },
    { id: 'female_short', name: 'Rayssa', defaultName: 'Rayssa' },
    { id: 'male_short', name: 'Dubs', defaultName: 'Dubs' },
    { id: 'male_cap', name: 'Kai', defaultName: 'Kai' },
    { id: 'alien', name: 'Area 51', defaultName: 'Gnarls' },
];

export function drawTransitionPipe(ctx: CanvasRenderingContext2D, width: number, height: number, offsetY: number) {
    const startY = 250; // Surface level
    const endY = 1000;  // Deep underground
    
    // Fill background sky first, as we might scroll up past the earth
    ctx.fillStyle = '#0f172a'; // Sky color matching city background
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    // Apply the vertical scroll to the world elements
    ctx.translate(0, offsetY);
    
    // Earth fill surrounding the pipe
    ctx.fillStyle = '#2c1810'; // Dark brown soil
    ctx.fillRect(0, startY, width, endY - startY + 1500); 
    
    // Pipe Geometry: Steeper drop
    const pipeWidth = 160;
    const startX = 180;
    const endX = startX + 300; // Steep diagonal drop
    
    // 1. Draw the black void of the pipe
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY); // Top edge
    ctx.lineTo(endX - pipeWidth * 0.5, endY + pipeWidth); // Bottom edge end
    ctx.lineTo(startX - pipeWidth * 0.5, startY + pipeWidth); // Bottom edge start
    ctx.closePath();
    ctx.fillStyle = '#0f0f0f';
    ctx.fill();
    
    // 2. Draw the Pipe Interior (Gradient)
    const grad = ctx.createLinearGradient(startX, startY, startX, startY + pipeWidth);
    grad.addColorStop(0, '#111');
    grad.addColorStop(0.2, '#222');
    grad.addColorStop(0.5, '#3a3a3a'); // Shine in middle
    grad.addColorStop(0.8, '#222');
    grad.addColorStop(1, '#111');
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.lineTo(endX - pipeWidth * 0.5, endY + pipeWidth);
    ctx.lineTo(startX - pipeWidth * 0.5, startY + pipeWidth);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    
    // 3. Pipe Ribs/Segments for visual speed/depth
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.3;
    
    const segments = 20;
    const dx = (endX - startX) / segments;
    const dy = (endY - startY) / segments;
    
    for(let i=0; i<segments; i++) {
        const px = startX + dx * i;
        const py = startY + dy * i;
        
        // Draw an ellipse segment to simulate a round pipe joint
        ctx.beginPath();
        ctx.ellipse(px, py + pipeWidth/2, 30, pipeWidth/2, Math.PI/5, 0, Math.PI*2);
        ctx.stroke();
    }
    
    ctx.restore();
}

export function drawCityBackground(ctx: CanvasRenderingContext2D, width: number, height: number, scroll: number, floorY: number, viewOffsetY: number = 0) {
    // Calculate sky position based on viewOffsetY (camera moving up means sky moves down)
    const skyOffset = viewOffsetY * 0.5; // Parallax for sky

    // 0. Space Layer (Visible when viewOffsetY is large)
    if (viewOffsetY > 100) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        
        // Stars
        const starSeed = Math.floor(scroll / 500); // Slowly changing star field
        for(let i=0; i<100; i++) {
            const sx = (Math.sin(i * 132.1 + starSeed) * width + width) % width;
            const sy = (Math.cos(i * 53.7) * height + height) % height;
            const size = Math.random() * 2;
            ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#aaa';
            ctx.beginPath(); ctx.arc(sx, sy, size, 0, Math.PI*2); ctx.fill();
        }

        // Mars
        const marsY = height * 0.3 + (viewOffsetY * 0.1); // Mars moves slowly
        if (marsY < height + 100) {
            ctx.save();
            ctx.translate(width * 0.7, marsY);
            const gradMars = ctx.createRadialGradient(-20, -20, 10, 0, 0, 80);
            gradMars.addColorStop(0, '#ff6b6b');
            gradMars.addColorStop(1, '#8b0000');
            ctx.fillStyle = gradMars;
            ctx.beginPath(); ctx.arc(0, 0, 60, 0, Math.PI*2); ctx.fill();

            // Small Rocket Landing on Mars
            // Moved further up (-150) and smaller (scale 0.4)
            const time = Date.now() / 500;
            const hoverY = Math.sin(time) * 10; // Bobbing motion
            
            ctx.save();
            ctx.translate(0, -150 + hoverY); // Further from planet, moving towards it
            ctx.scale(0.4, 0.4); // Much smaller
            ctx.rotate(Math.PI + 0.2); // Slight angle
            
            // Rocket Body
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.ellipse(0, 0, 10, 30, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Fins
            ctx.fillStyle = '#c52323';
            ctx.beginPath();
            ctx.moveTo(-10, 10); ctx.lineTo(-18, 25); ctx.lineTo(-5, 20);
            ctx.moveTo(10, 10); ctx.lineTo(18, 25); ctx.lineTo(5, 20);
            ctx.fill();
            
            // Window
            ctx.fillStyle = '#3b82f6';
            ctx.beginPath(); ctx.arc(0, -10, 4, 0, Math.PI*2); ctx.fill();
            ctx.restore();

            ctx.restore();
        }
    }

    // 1. Sky Gradient (The atmosphere)
    // Pushed down by viewOffsetY
    const skyY = viewOffsetY;
    if (skyY < height) {
        const grad = ctx.createLinearGradient(0, skyY, 0, height + skyY);
        grad.addColorStop(0, '#0f172a'); // Deep blue/slate
        grad.addColorStop(1, '#334155'); // Lighter slate
        ctx.fillStyle = grad;
        ctx.fillRect(0, skyY, width, height);

        // 2. Sun/Moon (Only visible if we are essentially on earth or low atmosphere)
        // It fades out as we go up
        if (viewOffsetY < 500) {
            ctx.save();
            ctx.translate(width * 0.8, height * 0.25 + skyY * 0.8);
            ctx.fillStyle = '#c52323'; // Brand red
            ctx.shadowColor = '#c52323';
            ctx.shadowBlur = 40;
            ctx.beginPath();
            ctx.arc(0, 0, 50, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Helper for deterministic pseudo-random numbers based on building index
    const pseudoRandom = (x: number) => {
        return Math.abs(Math.sin(x * 12.9898) * 43758.5453) % 1;
    };

    // 3. Parallax Layers (Buildings)
    // These should move down rapidly as we fly up
    const layers = [
        // Far background
        { speed: 0.05, color: '#1e293b', width: 120, heightMod: 200, baseH: 150, seed: 1, windows: false }, 
        // Mid background
        { speed: 0.15, color: '#334155', width: 80, heightMod: 150, baseH: 80, seed: 2, windows: false },
        // Near background
        { speed: 0.3, color: '#475569', width: 60, heightMod: 100, baseH: 50, seed: 3, windows: true } 
    ];

    const buildingOffsetY = floorY + viewOffsetY; // Buildings are attached to the floor

    // Only draw buildings if they are on screen
    if (buildingOffsetY > -500) {
        layers.forEach(layer => {
            ctx.fillStyle = layer.color;
            const effectiveScroll = scroll * layer.speed;
            
            // Calculate which buildings are visible
            const startIdx = Math.floor(effectiveScroll / layer.width);
            const endIdx = startIdx + Math.ceil(width / layer.width) + 1;

            for (let i = startIdx; i <= endIdx; i++) {
                const hFactor = pseudoRandom(i * layer.seed);
                const h = layer.baseH + hFactor * layer.heightMod;
                const x = Math.floor(i * layer.width - effectiveScroll);
                
                // Draw building rising from the floor line
                const bY = buildingOffsetY - h;
                // Optimization: don't draw if completely off screen
                if (bY < height) {
                    ctx.fillRect(x, bY, layer.width + 1, h + 500); // +500 to extend below floor when view shifts

                    // Windows
                    if (layer.windows && hFactor > 0.4) {
                        ctx.fillStyle = '#1e293b'; 
                        const winSize = 4;
                        const gap = 10;
                        const cols = Math.floor((layer.width - gap) / (winSize + gap));
                        const rows = Math.floor((h - 30) / (winSize + gap));
                        
                        for (let r = 0; r < rows; r++) {
                            for (let c = 0; c < cols; c++) {
                                if (pseudoRandom(i * r * c + layer.seed) > 0.3) {
                                    ctx.fillRect(
                                        x + gap + c * (winSize + gap), 
                                        bY + 15 + r * (winSize + gap), 
                                        winSize, 
                                        winSize
                                    );
                                }
                            }
                        }
                        ctx.fillStyle = layer.color; 
                    }
                }
            }
        });
    }
}

export function drawStickman(
    ctx: CanvasRenderingContext2D, 
    type: CharacterType, 
    x: number, 
    y: number, 
    frame: number, 
    state: 'RUNNING' | 'COASTING' | 'JUMPING' | 'GRINDING' | 'CRASHED' | 'TUMBLING' | 'NATAS_SPIN' | 'ARRESTED',
    trickRotation: number = 0, 
    trickType: string = '',
    isFakie: boolean = false
) {
    ctx.save();
    ctx.translate(x, y);
    
    // Safety check for frame
    const safeFrame = frame || 0;
    
    // --- FAKIE LOGIC ---
    if (isFakie) {
        ctx.scale(-1, 1);
    }

    // --- ROTATION ---
    // Apply rotation for tricks or when riding curves (RUNNING/COASTING/GRINDING with slope)
    if (state === 'TUMBLING' || state === 'RUNNING' || state === 'COASTING' || state === 'GRINDING') {
        ctx.rotate(trickRotation);
    }

    // --- NATAS SPIN (Horizontal Spin Simulation) ---
    if (state === 'NATAS_SPIN') {
        // Simulate 3D horizontal spin by scaling width based on cosine of rotation
        const widthScale = Math.cos(trickRotation);
        ctx.scale(widthScale, 1);
    }

    // --- TRICK ANIMATIONS (180/360) ---
    if (trickType === '180' || trickType === '360') {
        const scaleX = Math.cos(trickRotation);
        ctx.scale(scaleX, 1);
    }

    // Color settings
    const isAlien = type === 'alien';
    const skinColor = isAlien ? '#39ff14' : '#ffffff';
    const strokeColor = isAlien ? '#39ff14' : '#ffffff';
    
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = skinColor;

    // Animation Math
    // Use a simple sine wave for arm swing
    const armAngle = state === 'RUNNING' ? Math.sin(safeFrame * 0.25) * 0.5 : -0.5;
    const crouch = state === 'JUMPING' ? -5 : 0;

    // --- SKATEBOARD ---
    // Don't draw board if crashed, but do draw it if tumbling or arrested
    if (state !== 'CRASHED') {
        ctx.save();
        ctx.translate(0, 25 + crouch);
        
        // Kickflip: Spin board on Z axis
        if (trickType === 'KICKFLIP') {
             ctx.rotate(trickRotation);
        }

        // Deck - REFINED SHAPE
        // Drawing a more realistic side profile with nose and tail
        ctx.fillStyle = '#333'; // Dark grey deck
        ctx.beginPath();
        
        // Start at the tip of the nose (left, slightly up)
        ctx.moveTo(-24, -4);
        // Curve down to the flat part
        ctx.quadraticCurveTo(-18, 0, -12, 0);
        // Flat part
        ctx.lineTo(12, 0);
        // Curve up to the tail (right)
        ctx.quadraticCurveTo(18, 0, 24, -4);
        // Thickness at tail end
        ctx.lineTo(24, -1);
        // Bottom curve back to center
        ctx.quadraticCurveTo(18, 5, 12, 5);
        // Bottom flat
        ctx.lineTo(-12, 5);
        // Bottom curve to nose
        ctx.quadraticCurveTo(-18, 5, -24, -1);
        ctx.closePath();
        ctx.fill();

        // Griptape (Top line)
        ctx.strokeStyle = '#111'; // Almost black
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-23, -4);
        ctx.quadraticCurveTo(-18, 0, -12, 0);
        ctx.lineTo(12, 0);
        ctx.quadraticCurveTo(18, 0, 23, -4);
        ctx.stroke();

        // Wheels - Adjusted position
        ctx.fillStyle = '#fff';
        if (type === 'alien') ctx.fillStyle = '#cc00ff';
        
        // Back wheel
        ctx.beginPath();
        ctx.arc(-13, 5, 3.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Front wheel
        ctx.beginPath();
        ctx.arc(13, 5, 3.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Bearings (detail)
        ctx.fillStyle = '#999';
        ctx.beginPath();
        ctx.arc(-13, 5, 1.5, 0, Math.PI * 2);
        ctx.arc(13, 5, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // --- BODY ---
    ctx.fillStyle = skinColor;
    ctx.strokeStyle = strokeColor; // Reset stroke for body
    ctx.lineWidth = 3;

    // Legs
    ctx.beginPath();
    if (state === 'RUNNING') {
        // CONTINUOUS SINE WAVE PUSHING ANIMATION
        // We use safeFrame to ensure the cycle is always valid.
        // Speed factor 0.25 controls the speed of the push.
        const cycle = safeFrame * 0.25; 
        
        // Leg swings back and forth (X axis)
        // Middle(0) -> Front(+15) -> Middle(0) -> Back(-15) -> Middle(0)
        const xOffset = Math.sin(cycle) * 15; 
        
        // Lift leg during recovery phase (moving forward).
        // Cosine is the derivative of Sine. When Cos is positive, Sin is increasing (moving front).
        // So we lift when Cos > 0.
        const isRecovery = Math.cos(cycle) > 0;
        const lift = isRecovery ? Math.abs(Math.cos(cycle)) * 8 : 0;
        
        // The pushing leg (back leg)
        const backFootX = xOffset - 5; 
        const backFootY = 25 - lift; 

        ctx.moveTo(0, 10); // Hips
        ctx.lineTo(backFootX, backFootY); // Back foot (Pushing leg)
        
        // Front leg (stabilizing on board)
        ctx.moveTo(0, 10);
        ctx.lineTo(10, 25); 
    } else if (state === 'COASTING' || state === 'NATAS_SPIN' || state === 'ARRESTED') {
        // Standing still - Both feet on board
        // Back foot is placed further back on the tail to differentiate from running
        ctx.moveTo(0, 10);
        ctx.lineTo(-12, 25); // Back foot on tail
        ctx.moveTo(0, 10);
        ctx.lineTo(10, 25); // Front foot on nose area
    } else if (state === 'JUMPING' || state === 'GRINDING' || state === 'TUMBLING' || state === 'CRASHED') {
        // Knees bent in air/grind/tumble/crash
        // Fix legs going through board: apply crouch to footY and kneeY
        const footY = 25 + crouch;
        const kneeY = 20 + crouch;

        ctx.moveTo(0, 10);
        ctx.lineTo(-5, kneeY);
        ctx.lineTo(-10, footY);
        ctx.moveTo(0, 10);
        ctx.lineTo(5, kneeY);
        ctx.lineTo(10, footY);
    }
    ctx.stroke();

    // Torso
    ctx.beginPath();
    ctx.moveTo(0, 10); 
    ctx.lineTo(0, -15); 
    ctx.stroke();

    // Arms
    ctx.beginPath();
    ctx.moveTo(0, -10);
    if (state === 'NATAS_SPIN') {
         // Arms out for balance
         ctx.lineTo(-15, -12);
         ctx.moveTo(0, -10);
         ctx.lineTo(15, -12);
    } else if (state === 'ARRESTED') {
        // Hands up!
        ctx.lineTo(-10, -25);
        ctx.moveTo(0, -10);
        ctx.lineTo(10, -25);
    } else {
        // Arm swing logic
        ctx.lineTo(-10, -10 + armAngle * 10);
        ctx.moveTo(0, -10);
        ctx.lineTo(10, -10 - armAngle * 10);
    }
    ctx.stroke();

    // Head
    ctx.beginPath();
    if (isAlien) {
        ctx.ellipse(0, -22, 6, 8, 0, 0, Math.PI*2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.ellipse(-2, -22, 2, 3, 0.2, 0, Math.PI*2);
        ctx.ellipse(2, -22, 2, 3, -0.2, 0, Math.PI*2);
        ctx.fill();
    } else {
        ctx.arc(0, -22, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    // --- ACCESSORIES ---
    ctx.fillStyle = strokeColor;
    
    if (type === 'male_cap') {
        ctx.fillStyle = '#c52323';
        ctx.beginPath();
        ctx.moveTo(-6, -24);
        ctx.lineTo(8, -24); // Bill
        ctx.arc(0, -22, 6.5, Math.PI, 0);
        ctx.fill();
    }

    if (type === 'female_long') {
        ctx.strokeStyle = '#ffcc00'; // Blondeish
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -28);
        ctx.quadraticCurveTo(-10, -20, -8, -10); 
        ctx.stroke();
    }
    
    if (type === 'female_short') {
        ctx.fillStyle = '#8B4513'; // Brown
        ctx.beginPath();
        ctx.arc(0, -22, 7, Math.PI, 0); 
        ctx.lineTo(7, -18);
        ctx.lineTo(-7, -18);
        ctx.fill();
    }

    ctx.restore();
}

export type ObstacleType = 
    | 'hydrant' | 'cone' | 'police_car' | 'cybertruck' | 'cart' 
    | 'ledge' | 'curb' | 'bin' | 'grey_bin' | 'ramp' | 'gap' 
    | 'ramp_up' | 'platform' | 'stairs_down' | 'rail' | 'flat_rail' | 'mega_ramp'
    | 'concrete_structure';

export function drawObstacle(ctx: CanvasRenderingContext2D, type: ObstacleType, x: number, y: number, w: number, h: number, sprayingWater?: boolean, doorOpen?: boolean) {
    ctx.save();
    ctx.translate(x, y);

    switch (type) {
        case 'police_car':
             // Flip horizontally to face left (towards skater)
             ctx.save();
             ctx.translate(w, 0);
             ctx.scale(-1, 1);
             
             // Car dimensions
             const wheelRadius = 9;
             const wheelY = h; 

             // Chassis / Bottom Body (Black)
             ctx.fillStyle = '#111827'; // Slate 900
             ctx.beginPath();
             ctx.moveTo(0, h * 0.4);
             ctx.lineTo(w, h * 0.45); // Slight slope hood
             ctx.lineTo(w, h - 5);
             ctx.lineTo(0, h - 5);
             ctx.closePath();
             ctx.fill();

             // Mid Section (White Doors)
             ctx.fillStyle = '#ffffff';
             ctx.fillRect(w * 0.25, h * 0.4, w * 0.45, h * 0.45);
             
             // Separator line for door
             ctx.strokeStyle = '#d1d5db';
             ctx.lineWidth = 1;
             ctx.beginPath();
             ctx.moveTo(w * 0.48, h * 0.4);
             ctx.lineTo(w * 0.48, h * 0.85);
             ctx.stroke();

             // Roof / Cabin
             ctx.fillStyle = '#ffffff';
             ctx.beginPath();
             ctx.moveTo(w * 0.25, h * 0.4);
             ctx.lineTo(w * 0.3, h * 0.1); // Windshield slope
             ctx.lineTo(w * 0.65, h * 0.1); // Roof top
             ctx.lineTo(w * 0.75, h * 0.4); // Rear window slope
             ctx.closePath();
             ctx.fill();

             // Windows
             ctx.fillStyle = '#38bdf8'; // Light blue
             ctx.globalAlpha = 0.7;
             ctx.beginPath();
             // Front window
             ctx.moveTo(w * 0.32, h * 0.15);
             ctx.lineTo(w * 0.47, h * 0.15);
             ctx.lineTo(w * 0.47, h * 0.4);
             ctx.lineTo(w * 0.28, h * 0.4);
             ctx.closePath();
             ctx.fill();
             // Rear window
             ctx.beginPath();
             ctx.moveTo(w * 0.51, h * 0.15);
             ctx.lineTo(w * 0.62, h * 0.15);
             ctx.lineTo(w * 0.68, h * 0.4);
             ctx.lineTo(w * 0.51, h * 0.4);
             ctx.closePath();
             ctx.fill();
             ctx.globalAlpha = 1.0;

             // Text (Needs to be unflipped)
             ctx.save();
             ctx.translate(w * 0.48, h * 0.65);
             ctx.scale(-1, 1);
             ctx.fillStyle = '#000';
             ctx.font = 'bold 9px sans-serif';
             ctx.textAlign = 'center';
             ctx.fillText('POLICE', 0, 0);
             ctx.restore();

             // Siren Light Bar
             const lightBarW = 18;
             const lightBarH = 5;
             const lightBarX = w * 0.48 - lightBarW / 2;
             const lightBarY = h * 0.1 - lightBarH;
             
             // Base
             ctx.fillStyle = '#374151';
             ctx.fillRect(lightBarX, lightBarY + 2, lightBarW, 3);
             
             // Flashing Lights
             const flashTick = Math.floor(Date.now() / 150) % 2 === 0;
             
             // Red Light
             ctx.fillStyle = flashTick ? '#ef4444' : '#7f1d1d';
             ctx.fillRect(lightBarX, lightBarY, lightBarW/2 - 1, 4);
             
             // Blue Light
             ctx.fillStyle = flashTick ? '#1e3a8a' : '#3b82f6';
             ctx.fillRect(lightBarX + lightBarW/2 + 1, lightBarY, lightBarW/2 - 1, 4);
             
             // Glow effect if flashing
             if (flashTick) {
                 ctx.shadowColor = '#ef4444';
                 ctx.shadowBlur = 10;
                 ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
                 ctx.beginPath(); ctx.arc(lightBarX, lightBarY, 15, 0, Math.PI*2); ctx.fill();
                 ctx.shadowBlur = 0;
             } else {
                 ctx.shadowColor = '#3b82f6';
                 ctx.shadowBlur = 10;
                 ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
                 ctx.beginPath(); ctx.arc(lightBarX + lightBarW, lightBarY, 15, 0, Math.PI*2); ctx.fill();
                 ctx.shadowBlur = 0;
             }

             // Headlight
             ctx.fillStyle = '#fef08a'; // Yellow-ish white
             ctx.beginPath();
             ctx.ellipse(w - 2, h * 0.5, 2, 5, 0, 0, Math.PI*2);
             ctx.fill();

             // Wheels
             const drawTire = (xPos: number) => {
                  ctx.fillStyle = '#111';
                  ctx.beginPath();
                  ctx.arc(xPos, wheelY - 2, wheelRadius, 0, Math.PI*2);
                  ctx.fill();
                  // Rim
                  ctx.fillStyle = '#9ca3af';
                  ctx.beginPath();
                  ctx.arc(xPos, wheelY - 2, wheelRadius * 0.6, 0, Math.PI*2);
                  ctx.fill();
                  // Hub
                  ctx.fillStyle = '#4b5563';
                  ctx.beginPath();
                  ctx.arc(xPos, wheelY - 2, wheelRadius * 0.2, 0, Math.PI*2);
                  ctx.fill();
             };

             drawTire(w * 0.2);
             drawTire(w * 0.8);
             
             // Door Open Visuals (Arrest logic)
             if (doorOpen) {
                 ctx.fillStyle = '#000';
                 ctx.fillRect(w * 0.55, h * 0.42, w * 0.15, h * 0.4);
             }
             
             ctx.restore(); // End flip
             break;

        case 'cybertruck':
             const peakX = w * 0.4;
             ctx.fillStyle = '#c0c0c0'; 
             ctx.beginPath();
             ctx.moveTo(w, h - 15);
             ctx.lineTo(peakX, 0);
             ctx.lineTo(5, h - 20); 
             ctx.lineTo(5, h - 10);
             ctx.lineTo(w, h - 10);
             ctx.closePath();
             ctx.fill();
             
             ctx.strokeStyle = '#999';
             ctx.lineWidth = 1;
             ctx.stroke();

             ctx.fillStyle = '#000';
             ctx.beginPath();
             ctx.moveTo(peakX, 5);
             ctx.lineTo(w - 10, h - 20);
             ctx.lineTo(20, h - 24);
             ctx.closePath();
             ctx.fill();

             ctx.fillStyle = '#fff';
             ctx.shadowColor = '#fff';
             ctx.shadowBlur = 10;
             ctx.fillRect(0, h - 25, 10, 2);
             ctx.shadowBlur = 0;

             ctx.fillStyle = '#f00';
             ctx.shadowColor = '#f00';
             ctx.shadowBlur = 5;
             ctx.fillRect(w - 5, h - 20, 5, 2);
             ctx.shadowBlur = 0;

             ctx.fillStyle = '#111';
             ctx.beginPath(); ctx.arc(25, h - 5, 16, 0, Math.PI*2); ctx.fill();
             ctx.fillStyle = '#333';
             ctx.beginPath(); ctx.arc(25, h - 5, 8, 0, Math.PI*2); ctx.fill();

             ctx.fillStyle = '#111';
             ctx.beginPath(); ctx.arc(w - 30, h - 5, 16, 0, Math.PI*2); ctx.fill();
             ctx.fillStyle = '#333';
             ctx.beginPath(); ctx.arc(w - 30, h - 5, 8, 0, Math.PI*2); ctx.fill();
             break;

        case 'hydrant':
            ctx.fillStyle = '#cc0000';
            ctx.fillRect(w/4, h/3, w/2, h*0.66); 
            ctx.fillRect(0, h/2, w, h/5); 
            ctx.fillStyle = '#990000';
            ctx.beginPath(); ctx.arc(w/2, h/3, w/3, Math.PI, 0); ctx.fill();
            
            if (sprayingWater) {
                 ctx.save();
                 ctx.translate(w/2, 0); // Top of hydrant
                 ctx.rotate(-Math.PI / 4); // Spray angle
                 ctx.strokeStyle = '#38bdf8'; // Light blue
                 ctx.lineWidth = 3;
                 ctx.globalAlpha = 0.8;
                 for(let i=0; i<5; i++) {
                    const len = 30 + Math.random() * 40;
                    const offset = Math.random() * 10 - 5;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.quadraticCurveTo(len/2, offset*2, len, offset * 5);
                    ctx.stroke();
                 }
                 ctx.restore();
            }
            break;

        case 'cart': // SHOPPING CART
            ctx.save();
            // Handle
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(5, 5, 5, 10);
            // Basket wireframe
            ctx.strokeStyle = '#cbd5e1'; // Silver/light grey
            ctx.lineWidth = 2;
            ctx.beginPath();
            // Main basket shape
            ctx.moveTo(10, 15); ctx.lineTo(15, h-10); ctx.lineTo(w-10, h-10); ctx.lineTo(w, 15); ctx.closePath();
            // Grid lines vertical
            ctx.moveTo(20, 15); ctx.lineTo(23, h-10);
            ctx.moveTo(30, 15); ctx.lineTo(31, h-10);
            ctx.moveTo(40, 15); ctx.lineTo(39, h-10);
            // Grid lines horizontal
            ctx.moveTo(12, 25); ctx.lineTo(w-5, 25);
            ctx.moveTo(14, 35); ctx.lineTo(w-8, 35);
            ctx.stroke();
            
            // Base frame
            ctx.strokeStyle = '#64748b';
            ctx.beginPath();
            ctx.moveTo(15, h-10); ctx.lineTo(15, h-5); ctx.lineTo(w-10, h-5);
            ctx.stroke();

            // Wheels
            ctx.fillStyle = '#333';
            ctx.beginPath(); ctx.arc(15, h, 4, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(w-10, h, 4, 0, Math.PI*2); ctx.fill();
            ctx.restore();
            break;

        case 'ledge':
            // Concrete texture
            ctx.fillStyle = '#555';
            ctx.fillRect(0, 0, w, h);
            // Top coping
            ctx.fillStyle = '#777';
            ctx.fillRect(0, 0, w, 4);
            // Side detail
            ctx.fillStyle = '#444';
            ctx.fillRect(0, 4, w, 2);
            break;
            
        case 'curb':
            // Street curb - red zone
            ctx.fillStyle = '#9ca3af'; // Concrete grey
            ctx.fillRect(0, 10, w, h-10);
            // Red painted edge
            ctx.fillStyle = '#ef4444'; 
            ctx.fillRect(0, 10, w, 5);
            // White stripes
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(10, 10, 10, 5);
            ctx.fillRect(30, 10, 10, 5);
            break;
        
        case 'rail':
            ctx.strokeStyle = '#ccc';
            ctx.lineWidth = 4;
            ctx.beginPath();
            // Left leg
            ctx.moveTo(10, h);
            ctx.lineTo(10, 5);
            // Right leg
            ctx.moveTo(w-10, h);
            ctx.lineTo(w-10, 5);
            ctx.stroke();
            // Top bar
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(5, 5);
            ctx.lineTo(w-5, 5);
            ctx.stroke();
            break;

        case 'flat_rail':
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 3;
            ctx.beginPath();
            // Legs (shorter)
            ctx.moveTo(5, h);
            ctx.lineTo(5, h-10);
            ctx.moveTo(w-5, h);
            ctx.lineTo(w-5, h-10);
            ctx.stroke();
            // Bar
            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, h-10);
            ctx.lineTo(w, h-10);
            ctx.stroke();
            break;

        case 'bin': // Green Bin
            ctx.fillStyle = '#2e7d32'; 
            ctx.fillRect(5, 0, w-10, h);
            ctx.fillStyle = '#1b5e20';
            ctx.fillRect(5, 10, w-10, 2);
            ctx.fillRect(5, 25, w-10, 2);
            ctx.fillRect(5, 40, w-10, 2);
            break;

        case 'grey_bin': // Grey Bin
            ctx.fillStyle = '#64748b'; 
            ctx.fillRect(5, 0, w-10, h);
            ctx.fillStyle = '#475569';
            ctx.fillRect(5, 10, w-10, 2);
            ctx.fillRect(5, 25, w-10, 2);
            ctx.fillRect(5, 40, w-10, 2);
            break;
            
        case 'ramp':
            ctx.fillStyle = '#d2b48c'; 
            ctx.beginPath();
            ctx.moveTo(0, h);
            ctx.lineTo(w, h);
            ctx.lineTo(w, 0);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#666';
            ctx.beginPath(); ctx.arc(w, 0, 3, 0, Math.PI*2); ctx.fill();
            break;
            
        case 'gap':
            // Draw hole effect (pit walls)
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, 100);
            ctx.moveTo(w, 0);
            ctx.lineTo(w, 100);
            ctx.stroke();
            
            const holeGrad = ctx.createLinearGradient(0, 0, 0, 100);
            holeGrad.addColorStop(0, 'rgba(0,0,0,0.5)');
            holeGrad.addColorStop(1, 'rgba(0,0,0,0.9)');
            ctx.fillStyle = holeGrad;
            ctx.fillRect(0, 0, w, 100);
            break;

        case 'concrete_structure':
             // UNIFIED RAMP+PLATFORM OBJECT
             const rampW = 100; // Must match physics logic
             ctx.fillStyle = '#444'; // Concrete color
             
             ctx.beginPath();
             ctx.moveTo(0, h);      // Bottom Left
             ctx.lineTo(rampW, 0);  // Top of Ramp (start of platform)
             ctx.lineTo(w, 0);      // Top Right (end of platform)
             ctx.lineTo(w, h);      // Bottom Right
             ctx.closePath();
             ctx.fill();
             
             // Border/Detail
             ctx.strokeStyle = '#555';
             ctx.lineWidth = 2;
             ctx.beginPath();
             ctx.moveTo(0, h);
             ctx.lineTo(rampW, 0);
             ctx.lineTo(w, 0);
             ctx.stroke();
             break;

        case 'platform':
             // Standalone platform (e.g. for underworld)
             ctx.fillStyle = '#444';
             ctx.fillRect(0, 0, w, h);
             ctx.fillStyle = '#333';
             ctx.fillRect(0, 0, w, 2);
             break;

        case 'stairs_down':
             ctx.fillStyle = '#444';
             const steps = 4;
             const stepW = w / steps;
             const stepH = h / steps;
             ctx.beginPath();
             ctx.moveTo(0, 0);
             for(let i=1; i<=steps; i++) {
                ctx.lineTo(i*stepW, (i-1)*stepH); 
                ctx.lineTo(i*stepW, i*stepH);     
             }
             ctx.lineTo(0, h); 
             ctx.closePath();
             ctx.fill();
             
             // Handrail
             ctx.strokeStyle = '#c52323';
             ctx.lineWidth = 3;
             ctx.beginPath();
             ctx.moveTo(0, -15); // Start of rail
             ctx.lineTo(w, h-15); // End of rail
             ctx.stroke();

             // Vertical Supports
             ctx.lineWidth = 2;
             ctx.beginPath();
             ctx.moveTo(10, -12); ctx.lineTo(10, 0);
             ctx.moveTo(w/2, h/2 - 15); ctx.lineTo(w/2, h/2);
             ctx.moveTo(w-10, h-18); ctx.lineTo(w-10, h);
             ctx.stroke();
             break;

        case 'mega_ramp':
             // TRUE CIRCULAR QUARTER PIPE VISUAL WITH SCAFFOLDING
             
             // Calculate Center (xc, 0) and Radius R
             const safeW = Math.max(w, 1);
             const safeH = Math.max(h, 1);
             
             // Formula: xc = (w^2 - h^2) / 2w
             const xc = (safeW*safeW - safeH*safeH) / (2*safeW);
             const R = safeW - xc;
             
             // Angles
             const startAngle = Math.atan2(h, -xc);
             const endAngle = 0; 

             // 1. Draw Scaffolding / Structure (Under the ramp)
             ctx.save();
             ctx.beginPath();
             // Define the shape of the ramp's underside
             ctx.moveTo(0, h); // Bottom left
             ctx.arc(xc, 0, R, startAngle, endAngle, true); // The curve
             ctx.lineTo(w, h); // Down to bottom right
             ctx.lineTo(0, h); // Back to start
             ctx.closePath();
             ctx.clip(); // Clip drawing to inside the ramp wedge

             // Draw truss pattern
             ctx.strokeStyle = '#374151'; // Dark metal lines
             ctx.lineWidth = 2;
             const gridSize = 40;
             
             // Vertical beams
             for (let lx = 0; lx < w; lx += gridSize) {
                 ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, h + 200); ctx.stroke();
             }
             // Horizontal beams
             for (let ly = 0; ly < h; ly += gridSize) {
                 ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(w, ly); ctx.stroke();
             }
             // Diagonal cross bracing
             ctx.globalAlpha = 0.5;
             for (let lx = 0; lx < w; lx += gridSize) {
                 ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx + gridSize, h); ctx.stroke();
             }
             
             ctx.restore();

             // 2. Draw the Riding Surface (Concrete Slab)
             ctx.beginPath();
             // Outline the curve
             ctx.arc(xc, 0, R, startAngle, endAngle, true);
             // Draw top deck extension (runway)
             ctx.lineTo(w + 100, 0);
             // Thickness of slab
             ctx.lineTo(w + 100, 15);
             ctx.lineTo(w, 15); // Back to coping area
             // Return curve (inner edge of slab)
             ctx.arc(xc, 0, R - 15, endAngle, startAngle, false);
             ctx.closePath();
             
             ctx.fillStyle = '#9ca3af'; // Concrete Light Grey
             ctx.fill();
             ctx.strokeStyle = '#d1d5db'; // Highlight edge
             ctx.lineWidth = 2;
             ctx.stroke();

             // 3. Coping (The metal pipe at the top edge of the curve)
             ctx.beginPath();
             ctx.arc(w, 0, 6, 0, Math.PI * 2);
             ctx.fillStyle = '#f3f4f6'; // Shiny metal
             ctx.fill();
             ctx.strokeStyle = '#1f2937';
             ctx.lineWidth = 1;
             ctx.stroke();
             
             // Coping shine
             ctx.beginPath(); ctx.arc(w - 2, -2, 2, 0, Math.PI*2); ctx.fillStyle='white'; ctx.fill();
             
             // 4. Vertical Wall below coping (The back support of the ramp)
             // Draw this BEHIND the curve point (w) so it looks like a box construction
             ctx.fillStyle = '#4b5563';
             ctx.fillRect(w, 10, 100, h); // Solid block behind/under top deck
             
             break;
            
        default:
            ctx.fillStyle = '#c52323';
            ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();
}

export function drawUnderworldBackground(ctx: CanvasRenderingContext2D, width: number, height: number, scroll: number) {
    // Dark red gradient background
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#1a0505');
    grad.addColorStop(1, '#4a0404');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const pseudoRandom = (x: number) => Math.abs(Math.sin(x * 12.9898) * 43758.5453) % 1;

    // Underworld Parallax Layers (Spikes)
    const layers = [
        { speed: 0.2, color: '#2b0a0a', width: 100, heightMod: 100, baseH: 50, seed: 10 }, 
        { speed: 0.5, color: '#450a0a', width: 80, heightMod: 150, baseH: 20, seed: 11 }
    ];

    layers.forEach(layer => {
        ctx.fillStyle = layer.color;
        const effectiveScroll = scroll * layer.speed;
        
        const startIdx = Math.floor(effectiveScroll / layer.width);
        const endIdx = startIdx + Math.ceil(width / layer.width) + 1;

        for (let i = startIdx; i <= endIdx; i++) {
            const hFactor = pseudoRandom(i * layer.seed);
            const h = layer.baseH + hFactor * layer.heightMod;
            const x = Math.floor(i * layer.width - effectiveScroll);
            
            // Spikes growing from bottom
            ctx.beginPath();
            ctx.moveTo(x, height);
            ctx.lineTo(x + layer.width/2, height - h);
            ctx.lineTo(x + layer.width, height);
            ctx.fill();
        }
    });
    
    // Draw solid floor line (Lava base)
    const floorH = 50;
    const floorY = height - floorH;

    // 1. Base Dark Lava
    ctx.fillStyle = '#330000';
    ctx.fillRect(0, floorY, width, floorH);

    // 2. Glowing Top Surface
    const lavaGrad = ctx.createLinearGradient(0, floorY, 0, floorY + 15);
    lavaGrad.addColorStop(0, '#ff4500'); // Orange-Red
    lavaGrad.addColorStop(1, '#8b0000'); // Dark Red
    ctx.fillStyle = lavaGrad;
    ctx.fillRect(0, floorY, width, 15);

    // 3. Bubbles/Texture (Moving with scroll)
    const bubbleScroll = scroll * 0.8;
    const bubbleW = 80;
    const startB = Math.floor(bubbleScroll / bubbleW);
    const endB = startB + Math.ceil(width / bubbleW) + 1;
    
    ctx.fillStyle = '#ff8c00'; // Dark Orange
    for (let i = startB; i <= endB; i++) {
         if (pseudoRandom(i) > 0.6) {
             const bx = Math.floor(i * bubbleW - bubbleScroll);
             const by = floorY + 5 + pseudoRandom(i * 2) * 10;
             const bSize = 4 + pseudoRandom(i * 3) * 6;
             ctx.beginPath();
             ctx.arc(bx, by, bSize, 0, Math.PI*2);
             ctx.fill();
         }
    }
    
    // 4. Top Edge Stroke
    ctx.strokeStyle = '#ffcc00'; // Bright Yellow/Orange Edge
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(width, floorY);
    ctx.stroke();
}

export function drawCollectible(ctx: CanvasRenderingContext2D, type: 'COIN' | 'DIAMOND', x: number, y: number, frame: number) {
    ctx.save();
    ctx.translate(x, y);
    
    const bob = Math.sin(frame * 0.1) * 5;
    ctx.translate(0, bob);
    
    // 3D spin effect
    const scaleX = Math.cos(frame * 0.05);
    ctx.scale(scaleX, 1);

    if (type === 'COIN') {
        ctx.fillStyle = '#fbbf24'; // Gold
        ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 14px monospace'; 
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 1);
    } else if (type === 'DIAMOND') {
        ctx.fillStyle = '#22d3ee'; // Cyan
        ctx.beginPath();
        ctx.moveTo(0, -15); ctx.lineTo(12, -5); ctx.lineTo(0, 15); ctx.lineTo(-12, -5);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#a5f3fc'; // Highlight
        ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(8, -5); ctx.lineTo(0, -5); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
    }

    ctx.restore();
}
