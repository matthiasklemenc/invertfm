// ---------------------------------------------------------
// BackgroundRenderer.ts (CLASS VERSION, FIXED)
// ---------------------------------------------------------

export class BackgroundRenderer {
  constructor() {}

  // Draw far static dark background
  drawSky(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const grd = ctx.createLinearGradient(0, 0, 0, height);
    grd.addColorStop(0, "#0b1528");
    grd.addColorStop(1, "#0a101b");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);
  }

  // Parallax layer #1 (mountains)
  drawMountains(ctx: CanvasRenderingContext2D, width: number, height: number, offset: number) {
    const y = height * 0.65;
    ctx.fillStyle = "#16233a";

    const speed = 0.2;
    const scroll = -(offset * speed) % width;

    ctx.beginPath();
    ctx.moveTo(scroll, y);
    ctx.lineTo(scroll + 200, y - 40);
    ctx.lineTo(scroll + 350, y - 20);
    ctx.lineTo(scroll + 500, y - 60);
    ctx.lineTo(scroll + 700, y - 10);
    ctx.lineTo(scroll + width, y);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
  }

  // Parallax layer #2 (hills)
  drawHills(ctx: CanvasRenderingContext2D, width: number, height: number, offset: number) {
    const y = height * 0.8;
    ctx.fillStyle = "#1d2d4a";

    const speed = 0.5;
    const scroll = -(offset * speed) % width;

    ctx.beginPath();
    ctx.moveTo(scroll, y);
    ctx.quadraticCurveTo(scroll + 150, y - 20, scroll + 300, y);
    ctx.quadraticCurveTo(scroll + 450, y + 10, scroll + 600, y);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
  }

  // Parallax layer #3 (foreground buildings)
  drawBuildings(ctx: CanvasRenderingContext2D, width: number, height: number, offset: number) {
    const speed = 1.2;
    const scroll = -(offset * speed) % width;

    ctx.fillStyle = "#253b60";

    const baseY = height * 0.9;

    for (let i = 0; i < 4; i++) {
      const x = scroll + i * 250;
      ctx.fillRect(x, baseY - 60, 40, 60);
      ctx.fillRect(x + 60, baseY - 100, 50, 100);
      ctx.fillRect(x + 140, baseY - 80, 60, 80);
    }
  }

  // Render all layers
  render(ctx: CanvasRenderingContext2D, physics: any) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;

    this.drawSky(ctx, width, height);
    this.drawMountains(ctx, width, height, physics.playerX);
    this.drawHills(ctx, width, height, physics.playerX);
    this.drawBuildings(ctx, width, height, physics.playerX);
  }
}
