export class CoinRenderer {
    img: HTMLImageElement;

    constructor() {
        this.img = new Image();
        this.img.src = "/invertfm/skate_game/sprites/coin_gold.png";
    }

    render(ctx: CanvasRenderingContext2D, coins: any[]) {
        coins.forEach((c) => {
            if (this.img.complete) {
                ctx.drawImage(this.img, c.x, c.y, 40, 40);
            } else {
                ctx.fillStyle = "yellow";
                ctx.beginPath();
                ctx.arc(c.x + 20, c.y + 20, 20, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
}
