import { CARD_ART_FILES } from 'virtual:card-art';

const READY = new Set(CARD_ART_FILES);
const FALLBACKS = [
  'card-sprout-dragon.webp',
  'card-astronaut-rabbit.webp',
  'card-cloud-sprite.webp',
  'card-math-robot.webp',
  'card-strawberry-cat.webp',
  'card-star-fairy.webp',
];

export function artUrl(file: string): string {
  return `${import.meta.env.BASE_URL}art/${file}`;
}

export function cardFaceFile(id: string): string {
  const own = `card-${id}.webp`;
  if (READY.has(own)) return own;
  const index = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % FALLBACKS.length;
  return FALLBACKS[index] ?? FALLBACKS[0]!;
}

export function cardFaceUrl(id: string): string {
  return artUrl(`cards/${cardFaceFile(id)}`);
}

export function lockedCardUrl(): string {
  return artUrl('card-locked.webp');
}

export function sceneArt(): { home: string; reveal: string; island: string; cheer: string } {
  return {
    home: artUrl('bg-home.webp'),
    reveal: artUrl('bg-reveal.webp'),
    island: artUrl('sprite-island-dino.webp'),
    cheer: artUrl('sprite-dino-cheer.webp'),
  };
}

const PRELOAD = ['bg-home.webp', 'bg-reveal.webp', 'sprite-island-dino.webp', 'sprite-dino-cheer.webp', 'card-locked.webp'];

function warm(src: string): void {
  const image = new Image();
  image.decoding = 'async';
  image.src = src;
}

export function preloadArt(): void {
  for (const file of PRELOAD) warm(artUrl(file));
  const cards = [...CARD_ART_FILES];
  let index = 0;
  const pump = () => {
    for (const file of cards.slice(index, index + 6)) warm(artUrl(`cards/${file}`));
    index += 6;
    if (index < cards.length) window.setTimeout(pump, 80);
  };
  window.setTimeout(pump, 400);
}
