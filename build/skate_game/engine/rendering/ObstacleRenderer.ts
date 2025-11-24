// build/skate_game/rendering/ObstacleRenderer.ts

export class ObstacleRenderer {
    render(ctx: CanvasRenderingContext2D, obstacles: any[]) {
        obstacles.forEach((o) => {
            // Simple red boxes
            ctx.fillStyle = "#c52323";
            ctx.fillRect(o.x, o.y, o.width, o.height);

            // White outline
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.strokeRect(o.x, o.y, o.width, o.height);
        });
    }
}
