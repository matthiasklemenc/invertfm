/* ============================================================================
   BACKGROUND RENDERER — INVERT FM SKATE GAME
   Simple parallax sky + distant elements.
   ============================================================================ */

export class BackgroundRenderer {
    skyColor = "#87CEEB";
    groundColor = "#d8b796";

    constructor() {}

    render(ctx: CanvasRenderingContext2D, player: any) {
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        /* --------------------------------------------
           SKY
        -------------------------------------------- */
        ctx.fillStyle = this.skyColor;
        ctx.fillRect(0, 0, w, h);

        /* --------------------------------------------
           PARALLAX HILLS (simple sinus curves)
        -------------------------------------------- */
        ctx.fillStyle = "#2f7947";
        const baseY = h - 250;

        ctx.beginPath();
        ctx.moveTo(0, baseY);

        for (let x = 0; x <= w; x += 10) {
            const y =
                baseY +
                Math.sin((x + player.x * 0.2) * 0.002) * 30 +
                Math.cos((x - player.x * 0.1) * 0.003) * 20;
            ctx.lineTo(x, y);
        }

        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();
    }
}
