// ---------------------------------------------------------
// CoinRenderer.ts — CLASS VERSION (NEW ENGINE)
// Keeps your original coin graphics + glow effect
// ---------------------------------------------------------

export class CoinRenderer {
  constructor() {}

  render(ctx: CanvasRenderingContext2D, coins: any[]) {
    if (!coins) return;

    for (const coin of coins) {
      const { x, y, radius, pulse } = coin;
      this.drawCoin(ctx, x, y, radius, pulse);
    }
  }

  drawCoin(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    pulse: number
  ) {
    // Outer glow
    ctx.beginPath();
    const glowRadius = radius + 4 + Math.sin(pulse * 6) * 2;
    const gradient = ctx.createRadialGradient(
      x, y, radius * 0.2,
      x, y, glowRadius
    );

    gradient.addColorStop(0, "rgba(255, 220, 0, 0.95)");
    gradient.addColorStop(1, "rgba(255, 180, 0, 0.0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(x - glowRadius, y - glowRadius, glowRadius * 2, glowRadius * 2);

    // Coin body
    ctx.beginPath();
    ctx.fillStyle = "#ffd400";
    ctx.strokeStyle = "#ffb300";
    ctx.lineWidth = 2;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Highlight top-left
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}
