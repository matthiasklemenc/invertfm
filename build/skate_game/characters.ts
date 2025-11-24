export const CHARACTERS = [
  {
    id: "kai",
    name: "KAI",
    img: "/invertfm/skate_game/sprites/player_carousel.png",
    spritePrefix: "/invertfm/skate_game/sprites/",
  },
  {
    id: "bali",
    name: "BALI",
    img: "/invertfm/skate_game/sprites/player_carousel.png",
    spritePrefix: "/invertfm/skate_game/sprites/",
  },
  {
    id: "dubs",
    name: "DUBS",
    img: "/invertfm/skate_game/sprites/player_carousel.png",
    spritePrefix: "/invertfm/skate_game/sprites/",
  },
  {
    id: "rayssa",
    name: "RAYSSA",
    img: "/invertfm/skate_game/sprites/player_carousel.png",
    spritePrefix: "/invertfm/skate_game/sprites/",
  }
] as const;

export type CharacterId = typeof CHARACTERS[number]["id"];
