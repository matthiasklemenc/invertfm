export class BackgroundRenderer {
    img: HTMLImageElement;

    constructor() {
        this.img = new Image();
        this.img.src = "/invertfm/skate_game/sprites/game_background.png"; 
    }

    render(ctx: CanvasRenderingContext2D, scrollSpeed: number) {
        if (!this.img.complete) return;

        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        ctx.drawImage(this.img, 0, 0, w, h);
    }
}
