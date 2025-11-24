export class ObstacleRenderer {
    img: HTMLImageElement;

    constructor() {
        this.img = new Image();
        this.img.src = "/invertfm/skate_game/sprites/obstacle_box.png";
    }

    render(ctx: CanvasRenderingContext2D, obstacles: any[]) {
        obstacles.forEach((o) => {
            if (this.img.complete) {
                ctx.drawImage(this.img, o.x, o.y, o.width, o.height);
            } else {
                ctx.fillStyle = "#ff4444";
                ctx.fillRect(o.x, o.y, o.width, o.height);
            }
        });
    }
}
