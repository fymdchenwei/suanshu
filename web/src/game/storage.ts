import { Difficulty, type Difficulty as DifficultyId } from '../engine/questionEngine';
import { LEGACY_STICKERS, legacyCardId, type EarnedCard } from './cards';

export interface RoundRecord {
  id: string;
  playedAt: string;
  difficulty: number;
  firstTryCorrect: number;
  total: number;
  stars: number;
  durationSeconds: number;
  bestStreak: number;
}

export interface CollectedSticker {
  id: string;
  earnedAt: string;
  difficulty: number;
  stage: number;
}

export interface DifficultyBest {
  bestStars: number;
  bestFirstTry: number;
  roundsPlayed: number;
}

export interface SaveData {
  muted: boolean;
  difficulty: DifficultyId;
  stickers: CollectedSticker[];
  cards: EarnedCard[];
  rounds: RoundRecord[];
  bests: Partial<Record<DifficultyId, DifficultyBest>>;
  cumulativeFirstTry: number;
  bestStreak: number;
}

export interface Store {
  load(): SaveData;
  save(data: SaveData): void;
}

const KEY = 'suanshu.web.v1';

export function defaultSave(): SaveData {
  return {
    muted: false,
    difficulty: Difficulty.within20NoCarry,
    stickers: [],
    cards: [],
    rounds: [],
    bests: {},
    cumulativeFirstTry: 0,
    bestStreak: 0,
  };
}

export function normalize(raw: unknown): SaveData {
  const base = defaultSave();
  if (!raw || typeof raw !== 'object') return base;
  const source = raw as Partial<SaveData>;
  const difficulty = Number(source.difficulty);
  base.muted = source.muted === true;
  base.difficulty = isDifficulty(difficulty) ? difficulty : Difficulty.within20NoCarry;
  base.cumulativeFirstTry = clampInt(source.cumulativeFirstTry);
  base.bestStreak = clampInt(source.bestStreak);
  base.stickers = Array.isArray(source.stickers) ? source.stickers.filter(isSticker).slice(0, 15) : [];
  base.cards = Array.isArray(source.cards)
    ? source.cards.filter(isCard).slice(0, 80).map(cleanCard)
    : [];
  base.rounds = Array.isArray(source.rounds) ? source.rounds.filter(isRound).slice(0, 40) : [];
  if (source.bests && typeof source.bests === 'object') {
    for (const difficultyId of [1, 2, 3, 4] as DifficultyId[]) {
      const best = (source.bests as Record<string, DifficultyBest | undefined>)[String(difficultyId)];
      if (!best || typeof best !== 'object') continue;
      base.bests[difficultyId] = {
        bestStars: clampInt(best.bestStars, 0, 3),
        bestFirstTry: clampInt(best.bestFirstTry, 0, 30),
        roundsPlayed: clampInt(best.roundsPlayed),
      };
    }
  }
  migrateStickers(base);
  return base;
}

export function localStore(): Store {
  return {
    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return defaultSave();
        const parsed = JSON.parse(raw) as unknown;
        const data = normalize(parsed);
        const hadCards = Boolean(parsed && typeof parsed === 'object' && Array.isArray((parsed as { cards?: unknown }).cards));
        if (!hadCards && data.cards.length > 0) {
          localStorage.setItem(KEY, JSON.stringify(data));
        }
        return data;
      } catch {
        return defaultSave();
      }
    },
    save(data) {
      localStorage.setItem(KEY, JSON.stringify(data));
    },
  };
}

export class MemoryStore implements Store {
  data: SaveData;

  constructor(initial?: SaveData) {
    this.data = initial ?? defaultSave();
  }

  load(): SaveData {
    return structuredClone(this.data);
  }

  save(data: SaveData): void {
    this.data = structuredClone(data);
  }
}

function migrateStickers(data: SaveData): void {
  for (const sticker of data.stickers) {
    if (!LEGACY_STICKERS[sticker.id]) continue;
    const id = legacyCardId(sticker.id);
    if (data.cards.some((card) => card.id === id)) continue;
    data.cards.push({
      id,
      earnedAt: sticker.earnedAt,
      achievement: `以前的贴纸：${LEGACY_STICKERS[sticker.id]?.name ?? sticker.id}`,
      correctCount: 0,
    });
  }
}

function isDifficulty(value: number): value is DifficultyId {
  return value === 1 || value === 2 || value === 3 || value === 4;
}

function isSticker(value: unknown): value is CollectedSticker {
  if (!value || typeof value !== 'object') return false;
  const sticker = value as CollectedSticker;
  return typeof sticker.id === 'string' && typeof sticker.earnedAt === 'string';
}

function isCard(value: unknown): value is EarnedCard {
  if (!value || typeof value !== 'object') return false;
  const card = value as EarnedCard;
  return typeof card.id === 'string' && card.id.length > 0 && card.id.length < 80 && typeof card.earnedAt === 'string';
}

function cleanCard(card: EarnedCard): EarnedCard {
  return {
    id: card.id,
    earnedAt: card.earnedAt,
    achievement: typeof card.achievement === 'string' ? card.achievement.slice(0, 80) : '',
    correctCount: clampInt(card.correctCount),
  };
}

function isRound(value: unknown): value is RoundRecord {
  if (!value || typeof value !== 'object') return false;
  const round = value as RoundRecord;
  return typeof round.id === 'string' && typeof round.playedAt === 'string' && typeof round.stars === 'number';
}

function clampInt(value: unknown, min = 0, max = 1_000_000): number {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, Math.round(number)));
}
