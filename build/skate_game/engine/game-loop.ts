// game-loop.ts — rebuilt with stable delta time + fixed timing on all devices

export interface GameLoopAPI {
    start(): void;
    stop(): void;
    onUpdate(callback: (dt: number) => void): void;
    onRender(callback: (ctx: CanvasRenderingContext2D) => void): void;
    setContext(ctx: CanvasRenderingContext2D): void;
}

export function createGameLoop(): GameLoopAPI {

    let lastTime = 0;
    let running = false;

    let updateCallback: (dt: number) => void = () => {};
    let renderCallback: (ctx: CanvasRenderingContext2D) => void = () => {};
    let ctx: CanvasRenderingContext2D | null = null;

    // Fixed timestep for physics stability (60 FPS base)
    const FIXED_STEP = 1000 / 60;

    // Accumulator for fixed-step physics updates
    let accumulator = 0;

    // Safety to prevent delta spikes on mobile (tab switching etc.)
    const MAX_DT = 1000 / 15; // never allow > ~66ms

    function frame(time: number) {
        if (!running) return;

        requestAnimationFrame(frame);

        if (!lastTime) {
            lastTime = time;
            return;
        }

        let dt = time - lastTime;
        lastTime = time;

        // Clamp DT to prevent physics explosions
        if (dt > MAX_DT) dt = MAX_DT;

        accumulator += dt;

        // Run physics at fixed framerate
        while (accumulator >= FIXED_STEP) {
            updateCallback(FIXED_STEP / 1000); // convert to seconds
            accumulator -= FIXED_STEP;
        }

        // Render at full frame rate
        if (ctx) renderCallback(ctx);
    }

    return {

        start() {
            if (running) return;
            running = true;
            lastTime = 0;
            accumulator = 0;
            requestAnimationFrame(frame);
        },

        stop() {
            running = false;
        },

        onUpdate(cb: (dt: number) => void) {
            updateCallback = cb;
        },

        onRender(cb: (ctx: CanvasRenderingContext2D) => void) {
            renderCallback = cb;
        },

        setContext(c: CanvasRenderingContext2D) {
            ctx = c;
        }
    };
}
