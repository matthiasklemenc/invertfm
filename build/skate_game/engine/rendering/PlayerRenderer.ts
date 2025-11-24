/* ============================================================================
   PLAYER RENDERER — INVERT FM SKATE GAME
   Supports run, push, ollie, natas, crash, falling animations.
   Rotation is handled for quarterpipe & spins.
   ============================================================================ */

interface AnimationDef {
    img: HTMLImageElement;
    frames: number;
    fps: number;
}

export class PlayerRenderer {
    rotation = 0;
    frameTimer = 0;
    currentFrame = 0;

    animations: Record<string, AnimationDef> = {};
    activeAnim: string = "run";

    spriteWidth = 256;
    spriteHeight = 256;

    ready = false;

    constructor() {
        this.loadSprites();
    }

    /* ============================================================================
       LOAD ALL PLAYER SPRITES
       ============================================================================ */
    async loadSprites() {
        const names = ["run", "push", "ollie", "natas", "crash", "falling"];
        const fps = { run: 12, push: 10, ollie: 8, natas: 10, crash: 6, falling: 6 };
        const frames = { run: 6, push: 6, ollie: 4, natas: 6, crash: 4, falling: 4 };

        for (const n of names) {
            const img = new Image();
            img.src = `/skate_game/assets/kai_${n}.png`;

            await new Promise(res => (img.onload = res));

            this.animations[n] = {
                img,
                frames: frames[n],
                fps: fps[n]
            };
        }

        this.ready = true;
    }

    /* ============================================================================
       UPDATE ANIMATION
       ============================================================================ */
    update(dt: number, player: any) {
        if (!this.ready) return;

        if (this.activeAnim !== player.anim) {
            this.activeAnim = player.anim;
            this.currentFrame = 0;
            this.frameTimer = 0;
        }

        const anim = this.animations[this.activeAnim];
        if (!anim) return;

        this.frameTimer += dt;
        const frameDuration = 1 / anim.fps;

        while (this.frameTimer > frameDuration) {
            this.frameTimer -= frameDuration;
            this.currentFrame = (this.currentFrame + 1) % anim.frames;
        }
    }

    /* ============================================================================
       RENDER
       ============================================================================ */
    render(ctx: CanvasRenderingContext2D, player: any) {
        if (!this.ready) return;

        const anim = this.animations[this.activeAnim];
        if (!anim) return;

        const frameX = this.currentFrame * this.spriteWidth;
        const img = anim.img;

        const drawX = player.x - this.spriteWidth / 2;
        const drawY = player.y - this.spriteHeight;

        ctx.save();

        /* --------------------------------------------
           Apply player rotation (quarterpipe etc.)
        -------------------------------------------- */
        if (this.rotation !== 0) {
            ctx.translate(player.x, player.y - this.spriteHeight / 2);
            ctx.rotate(this.rotation);
            ctx.translate(-player.x, -(player.y - this.spriteHeight / 2));
        }

        /* --------------------------------------------
           Draw current frame
        -------------------------------------------- */
        ctx.drawImage(
            img,
            frameX, 0, this.spriteWidth, this.spriteHeight,
            drawX, drawY, this.spriteWidth, this.spriteHeight
        );

        ctx.restore();
    }
}
