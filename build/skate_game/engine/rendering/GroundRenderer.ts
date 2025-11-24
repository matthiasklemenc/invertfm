/* ============================================================================
   GROUND RENDERER — INVERT FM SKATE GAME
   Simple scrolling ground band (world moves left).
   ============================================================================ */

export class GroundRenderer {
    groundColor = "#6a4f30";  // warm brown
    edgeColor = "#4a3723";    // darker top edge

    groundHeight = 140;       // distance from bottom (matches game-loop)

    constructor() {}

    render(ctx: CanvasRenderingContext2D, player: any) {
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        const groundY = h - this.groundHeight;

        /* --------------------------------------------
           TOP EDGE
        -------------------------------------------- */
        ctx.fillStyle = this.edgeColor;
        ctx.fillRect(0, groundY - 5, w, 5);

        /* --------------------------------------------
           GROUND BAND
        -------------------------------------------- */
        ctx.fillStyle = this.groundColor;
        ctx.fillRect(0, groundY, w, this.groundHeight);
    }
}
