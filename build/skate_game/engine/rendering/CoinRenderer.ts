/* ============================================================================
   COIN & DIAMOND RENDERER — INVERT FM SKATE GAME
   Renders collectible coins and diamonds with pulse animation.
   ============================================================================ */

export class CoinRenderer {
    constructor() {}

    render(ctx: CanvasRenderingContext2D, collectibles: any[]) {
        for (const c of collectibles) {
            this.drawCollectible(ctx, c);
        }
    }

    drawCollectible(ctx: CanvasRenderingContext2D, c: any) {
        const pulse = 1 + Math.sin(c.pulse) * 0.15; // subtle breathing effect
        const r = c.radius * pulse;

        if (c.type === "coin") {
            this.drawCoin(ctx, c.x, c.y, r);
        } else {
            this.drawDiamond(ctx, c.x, c.y, r);
        }
    }

    /* ============================================================================
       GOLD COIN
       ============================================================================ */
    drawCoin(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
        const grad = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
        grad.addColorStop(0, "#fff38a");
        grad.addColorStop(1, "#d1a300");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#8c6d00";
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    /* ============================================================================
       DIAMOND
       ============================================================================ */
    drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
        ctx.fillStyle = "#5df0ff";
        ctx.strokeStyle = "#2aa8b6";
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(x, y - r);
        ctx.lineTo(x + r, y);
        ctx.lineTo(x, y + r);
        ctx.lineTo(x - r, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}
