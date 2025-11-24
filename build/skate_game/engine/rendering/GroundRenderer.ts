export class GroundRenderer {
    groundImg: HTMLImageElement;

    constructor() {
        this.groundImg = new Image();
        this.groundImg.src = "/invertfm/skate_game/sprites/ground_texture.png";
    }

    render(ctx: CanvasRenderingContext2D, groundY: number) {
        const w = ctx.canvas.width;
        const h = 200;

        if (this.groundImg.complete) {
            const pattern = ctx.createPattern(this.groundImg, "repeat");
            if (pattern) {
                ctx.fillStyle = pattern;
                ctx.fillRect(0, groundY, w, h);
                return;
            }
        }

        // fallback
        ctx.fillStyle = "#333";
        ctx.fillRect(0, groundY, w, h);
    }
}
