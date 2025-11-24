// build/skate_game/rendering/GroundRenderer.ts

export class GroundRenderer {
    render(ctx: CanvasRenderingContext2D, groundY: number) {
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        // Dark asphalt ground area
        ctx.fillStyle = "#2b2b2b";
        ctx.fillRect(0, groundY, w, h - groundY);

        // White separation line
        ctx.strokeStyle = "#666";
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(w, groundY);
        ctx.stroke();
    }
}
