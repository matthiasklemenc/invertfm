// ---------------------------------------------------------
// GroundRenderer.ts — CLASS VERSION (fixed for new engine)
// Keeps all your old asphalt + highlight + texture visuals
// ---------------------------------------------------------

// No need for GroundState interface anymore
// Everything is handled internally

export class GroundRenderer {
  offset: number = 0;

  constructor() {}

  // Equivalent of your old updateGround()
  update(speed: number, dt: number) {
    this.offset += speed * 0.45 * dt;
  }

  // Asphalt surface
  drawAsphalt(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    groundY: number
  ) {
    ctx.fillStyle = "#2b2b2b";
    ctx.fillRect(0, groundY, width, height - groundY);
  }

  // Highlight strip
  drawGroundHighlight(
    ctx: CanvasRenderingContext2D,
    width: number,
    groundY: number
  ) {
    const GRADIENT_HEIGHT = 12;

    const g = ctx.createLinearGradient(0, groundY, 0, groundY + GRADIENT_HEIGHT);
    g.addColorStop(0, "#5a5a5a");
    g.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = g;
    ctx.fillRect(0, groundY, GRADIENT_HEIGHT, GRADIENT_HEIGHT);
    ctx.fillRect(0, groundY, width, GRADIENT_HEIGHT);
  }

  // Noise texture
  drawAsphaltTexture(
    ctx: CanvasRenderingContext2D,
    width: number,
    groundY: number,
    scroll: number
  ) {
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;

    const spacing = 14;

    for (let x = -200; x < width + 200; x += spacing) {
      const offsetX = (x - scroll * 0.3) % width;
      ctx.beginPath();
      ctx.moveTo(offsetX, groundY + 10);
      ctx.lineTo(offsetX + 30, groundY + 40);
      ctx.stroke();
    }
  }

  // MAIN RENDER CALL
  render(ctx: CanvasRenderingContext2D, physics: any) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    const groundY = height * 0.92;

    // update internal scroll
    this.update(physics.speed, physics.dt || 0.016);

    // asphalt base
    this.drawAsphalt(ctx, width, height, groundY);

    // highlight line
    this.drawGroundHighlight(ctx, width, groundY);

    // moving texture
    this.drawAsphaltTexture(ctx, width, groundY, this.offset);
  }
}
