export class PlayerRenderer {
    runFrames: HTMLImageElement[] = [];
    pushFrames: HTMLImageElement[] = [];
    idleFrame: HTMLImageElement;

    constructor() {
        const base = "/invertfm/skate_game/sprites/";

        // RUN (4 frames)
        this.runFrames = [
            this.load(base + "player_run_01.png"),
            this.load(base + "player_run_02.png"),
            this.load(base + "player_run_03.png"),
            this.load(base + "player_run_04.png")
        ];

        // PUSH (2 frames)
        this.pushFrames = [
            this.load(base + "player_push_01.png"),
            this.load(base + "player_push_02.png")
        ];

        // IDLE = run_01
        this.idleFrame = this.load(base + "player_run_01.png");
    }

    load(src: string): HTMLImageElement {
        const img = new Image();
        img.src = src;
        return img;
    }

    render(
        ctx: CanvasRenderingContext2D,
        player: any,
        characterId: string,
        mode: string,
        frame: number
    ) {
        let img;

        if (mode === "run") {
            img = this.runFrames[frame % 4];
        } else if (mode === "push") {
            img = this.pushFrames[frame % 2];
        } else {
            img = this.idleFrame;
        }

        ctx.drawImage(img, player.x, player.y, player.width, player.height);
    }
}
