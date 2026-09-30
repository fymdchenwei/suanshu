const SCENE = {
  home: 'bg-home.webp',
  reveal: 'bg-reveal.webp',
  island: 'sprite-island-dino.webp',
  cheer: 'sprite-dino-cheer.webp',
  locked: 'card-locked.webp',
} as const;

/** The six pictures that match a named character. */
const OWN_ART: Record<string, string> = {
  sprout: 'card-sprout-dragon.webp',
  'streak-10': 'card-cloud-sprite.webp',
  'one-breath': 'card-math-robot.webp',
  'advanced-clear': 'card-strawberry-cat.webp',
  'correct-300': 'card-star-fairy.webp',
  'night-sky': 'card-astronaut-rabbit.webp',
};

/**
 * Temporary stand-ins. These 21 cards reuse the six pictures above and only
 * change the name and rarity frame until each character has its own art.
 */
export const REUSED_CARD_ART: Record<string, string> = {
  'perfect-stage': 'card-math-robot.webp',
  'streak-5': 'card-strawberry-cat.webp',
  'streak-15': 'card-star-fairy.webp',
  'retry-heart': 'card-strawberry-cat.webp',
  flawless: 'card-sprout-dragon.webp',
  'two-stars': 'card-star-fairy.webp',
  'three-stars': 'card-cloud-sprite.webp',
  'cheer-up': 'card-sprout-dragon.webp',
  'easy-clear': 'card-astronaut-rabbit.webp',
  'carry-clear': 'card-math-robot.webp',
  'challenge-clear': 'card-cloud-sprite.webp',
  'challenge-3': 'card-sprout-dragon.webp',
  'melon-sweet': 'card-strawberry-cat.webp',
  'today-30': 'card-star-fairy.webp',
  'today-60': 'card-astronaut-rabbit.webp',
  'correct-50': 'card-cloud-sprite.webp',
  'correct-100': 'card-math-robot.webp',
  'panda-3': 'card-sprout-dragon.webp',
  'panda-5': 'card-strawberry-cat.webp',
  'guardian-10': 'card-cloud-sprite.webp',
  'all-diff': 'card-star-fairy.webp',
};

export function artUrl(file: string): string {
  return `${import.meta.env.BASE_URL}art/${file}`;
}

export function cardFaceFile(id: string): string | undefined {
  return OWN_ART[id] ?? REUSED_CARD_ART[id];
}

export function cardFaceUrl(id: string): string | undefined {
  const file = cardFaceFile(id);
  return file ? artUrl(file) : undefined;
}

export function lockedCardUrl(): string {
  return artUrl(SCENE.locked);
}

export function sceneArt(): { home: string; reveal: string; island: string; cheer: string } {
  return {
    home: artUrl(SCENE.home),
    reveal: artUrl(SCENE.reveal),
    island: artUrl(SCENE.island),
    cheer: artUrl(SCENE.cheer),
  };
}

const PRELOAD = [
  SCENE.home,
  SCENE.reveal,
  SCENE.island,
  SCENE.cheer,
  SCENE.locked,
  ...new Set([...Object.values(OWN_ART), ...Object.values(REUSED_CARD_ART)]),
];

export function preloadArt(): void {
  for (const file of PRELOAD) {
    const image = new Image();
    image.decoding = 'async';
    image.src = artUrl(file);
  }
}
