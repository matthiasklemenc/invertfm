// build/skate_game/rendering/BackgroundRenderer.ts

export class BackgroundRenderer {
    render(ctx: CanvasRenderingContext2D) {
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        // Smooth dark gradient background
        const grd = ctx.createLinearGradient(0, 0, 0, h);
        grd.addColorStop(0, "#050508");
        grd.addColorStop(1, "#111115");

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
    }
}
