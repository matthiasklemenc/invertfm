// ---------------------------------------------------------
// ObstacleRenderer.ts — CLASS VERSION (NEW ENGINE)
// Keeps your original rail, block, gap graphics
// ---------------------------------------------------------

export class ObstacleRenderer {
  constructor() {}

  render(ctx: CanvasRenderingContext2D, obstacles: any[]) {
    if (!obstacles) return;

    for (const obstacle of obstacles) {
      const { x, y, width, height, type } = obstacle;

      switch (type) {
        case "block":
          this.drawBlock(ctx, x, y, width, height);
          break;

        case "rail":
          this.drawRail(ctx, x, y, width, height);
          break;

        case "gap":
          this.drawGap(ctx, x, y, width, height);
          break;

        default:
          this.drawBlock(ctx, x, y, width, height);
      }
    }
  }

  // --------------------------
  // BLOCK (your original style)
  // --------------------------
  drawBlock(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    ctx.fillStyle = "#4e4e4e";
    ctx.fillRect(x, y, width, height);

    // top highlight
    ctx.fillStyle = "#6a6a6a";
    ctx.fillRect(x, y, width, 4);

    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(x, y + height - 6, width, 6);
  }

  // --------------------------
  // RAIL (your original style)
  // --------------------------
  drawRail(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    // rail body
    ctx.fillStyle = "#c9c9c9";
    ctx.fillRect(x, y, width, height);

    // top shine
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, width, 3);

    // side shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(x, y + height - 4, width, 4);
  }

  // --------------------------
  // GAP (your original style)
  // --------------------------
  drawGap(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    ctx.fillStyle = "#111827";
    ctx.fillRect(x, y, width, height);

    // edge lines
    ctx.strokeStyle = "#3b3b3b";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);
  }
}
