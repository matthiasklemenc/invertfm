// build/skate_game/rendering/PlayerRenderer.ts

export class PlayerRenderer {
    private runFrames: HTMLImageElement[] = [];
    private pushFrames: HTMLImageElement[] = [];
    private currentFrameIndex = 0;
    private frameTimer = 0;
    private fps = 8;

    private spriteWidth = 140;
    private spriteHeight = 180;

    constructor() {
        // Load RUN animation (4 frames)
        for (let i = 1; i <= 4; i++) {
            const img = new Image();
            img.src = `/invertfm/skate_game/sprites/player_run_0${i}.png`;
            this.runFrames.push(img);
        }

        // Load PUSH animation (2 frames)
        for (let i = 1; i <= 2; i++) {
            const img = new Image();
            img.src = `/invertfm/skate_game/sprites/player_push_0${i}.png`;
            this.pushFrames.push(img);
        }
    }

    setAnimationFps(newFps: number) {
        this.fps = newFps;
    }

    render(ctx: CanvasRenderingContext2D, player: any, dt: number) {
        const frames = player.state === "push" ? this.pushFrames : this.runFrames;
        if (frames.length === 0) return;

        // Animation timing
        this.frameTimer += dt;
        const frameDuration = 1000 / this.fps;

        if (this.frameTimer >= frameDuration) {
            this.frameTimer = 0;
            this.currentFrameIndex = (this.currentFrameIndex + 1) % frames.length;
        }

        const frame = frames[this.currentFrameIndex];

        if (!frame.complete) return;

        ctx.drawImage(
            frame,
            player.x,
            player.y,
            this.spriteWidth,
            this.spriteHeight
        );
    }
}
