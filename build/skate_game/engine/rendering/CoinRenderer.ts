// build/skate_game/rendering/CoinRenderer.ts

export class CoinRenderer {
    render(ctx: CanvasRenderingContext2D, coins: any[]) {
        coins.forEach((c) => {
            const radius = 18;
            const cx = c.x + radius;
            const cy = c.y + radius;

            // Gold fill
            ctx.fillStyle = "#ffd84a";
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();

            // Dark gold outline
            ctx.strokeStyle = "#b58a00";
            ctx.lineWidth = 3;
            ctx.stroke();
        });
    }
}
