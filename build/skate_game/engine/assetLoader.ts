// ---------------------------------------------------------
// assetLoader.ts
// Loads ALL PNG sprites for the player + logo
// ---------------------------------------------------------

// Helper to load a single image
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ---------------------------------------------------------
// Load all sprites used by the PlayerRenderer
// ---------------------------------------------------------
export async function loadAllSprites() {
  const spriteNames = [
    "player_run_01.png",
    "player_run_02.png",
    "player_run_03.png",
    "player_run_04.png",
    "player_push_01.png",
    "player_push_02.png",
    "game_logo.png",
    "player_carousel.png"
  ];

  const sprites: Record<string, HTMLImageElement> = {};

  for (const name of spriteNames) {
    sprites[name] = await loadImage(`/invertfm/build/skate_game/sprites/${name}`);
  }

  return {
    run: [
      sprites["player_run_01.png"],
      sprites["player_run_02.png"],
      sprites["player_run_03.png"],
      sprites["player_run_04.png"]
    ],
    push: [
      sprites["player_push_01.png"],
      sprites["player_push_02.png"]
    ],
    logo: sprites["game_logo.png"],
    carousel: sprites["player_carousel.png"]
  };
}
