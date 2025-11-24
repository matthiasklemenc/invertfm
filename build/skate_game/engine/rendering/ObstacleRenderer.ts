/* ============================================================================
   OBSTACLE RENDERER — INVERT FM SKATE GAME
   Renders hydrants, tubes, quarterpipes, trucks, boxes.
   Uses simple placeholder geometry so the game runs even without images.
   ============================================================================ */

export class ObstacleRenderer {
    constructor() {}

    render(ctx: CanvasRenderingContext2D, obstacles: any[]) {
        const h = ctx.canvas.height;
        const groundY = h - 140;

        for (const obs of obstacles) {
            const x = obs.x;
            const w = obs.width;
            const h0 = obs.height;

            const top = groundY - h0;
            const left = x - w / 2;

            switch (obs.type) {
                case "box":
                    this.drawBox(ctx, left, top, w, h0);
                    break;

                case "hydrant":
                    this.drawHydrant(ctx, left, top, w, h0);
                    break;

                case "tube_green":
                    this.drawTube(ctx, left, top, w, h0);
                    break;

                case "quarterpipe":
                    this.drawQuarterpipe(ctx, left, top, w, h0);
                    break;

                case "truck":
                    this.drawTruck(ctx, left, top, w, h0);
                    break;

                default:
                    this.drawBox(ctx, left, top, w, h0);
                    break;
            }
        }
    }

    /* ============================================================================
       BOX
       ============================================================================ */
    drawBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
        ctx.fillStyle = "#c4711a";
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = "#8a4a0a";
        ctx.strokeRect(x, y, w, h);
    }

    /* ============================================================================
       HYDRANT — placeholder red hydrant
       ============================================================================ */
    drawHydrant(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
        ctx.fillStyle = "#d01010";
        ctx.fillRect(x + w * 0.2, y, w * 0.6, h);

        ctx.fillStyle = "#b00000";
        ctx.fillRect(x, y + h * 0.3, w, h * 0.4);
    }

    /* ============================================================================
       GREEN TUBE — placeholder green warp pipe
       ============================================================================ */
    drawTube(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
        ctx.fillStyle = "#1ea832";
        ctx.fillRect(x, y, w, h);

        ctx.fillStyle = "#0e6b1f";
        ctx.fillRect(x, y, w, h * 0.15);
    }

    /* ============================================================================
       QUARTERPIPE — placeholder ramp graphic
       ============================================================================ */
    drawQuarterpipe(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
        const r = w; // radius approximated to width

        ctx.beginPath();
        ctx.moveTo(x + w, y + h);
        ctx.arc(x + w, y + h, r, Math.PI, Math.PI * 1.5, false);
        ctx.closePath();

        ctx.fillStyle = "#888";
        ctx.fill();
        ctx.strokeStyle = "#444";
        ctx.stroke();
    }

    /* ============================================================================
       CYBERTRUCK — placeholder simple truck shape
       ============================================================================ */
    drawTruck(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
        ctx.fillStyle = "#555";
        ctx.fillRect(x, y + h * 0.25, w, h * 0.75);

        ctx.fillStyle = "#777";
        ctx.fillRect(x + w * 0.1, y, w * 0.5, h * 0.35);

        ctx.fillStyle = "#2a2a2a";
        ctx.beginPath();
        ctx.arc(x + w * 0.2, y + h, h * 0.2, 0, Math.PI * 2);
        ctx.arc(x + w * 0.8, y + h, h * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }
}
