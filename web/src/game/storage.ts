import { Difficulty, type Difficulty as DifficultyId } from '../engine/questionEngine';
import { LEGACY_STICKERS, grantsFor, historySnapshot, legacyCardId, mapSavedCardId, type EarnedCard } from './cards';
import { localDateKey, progressFromSave, trailingThreeStarRounds } from './progress';

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
  stagesCompleted: number;
  threeStarStreak: number;
  playDates: string[];
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
    stagesCompleted: 0,
    threeStarStreak: 0,
    playDates: [],
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
    ? source.cards.filter(isCard).slice(0, 100).map(cleanCard)
    : [];
  base.rounds = Array.isArray(source.rounds) ? source.rounds.filter(isRound).slice(0, 40) : [];
  base.playDates = Array.isArray(source.playDates)
    ? source.playDates.filter((date) => typeof date === 'string' && date.length > 0).slice(-120)
    : [];
  base.stagesCompleted = clampInt(source.stagesCompleted);
  base.threeStarStreak = clampInt(source.threeStarStreak);
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
  migrateCatalog(base, source.stagesCompleted == null, source.threeStarStreak == null, !Array.isArray(source.playDates));
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
        const next = JSON.stringify(data);
        if (next !== raw) localStorage.setItem(KEY, next);
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

function migrateCatalog(data: SaveData, fillStages: boolean, fillStreak: boolean, fillDates: boolean): void {
  const mapped: EarnedCard[] = [];
  const seen = new Set<string>();
  for (const card of data.cards) {
    const id = mapSavedCardId(card.id);
    if (seen.has(id)) continue;
    seen.add(id);
    mapped.push({ ...card, id });
  }
  data.cards = mapped;
  if (fillStages) data.stagesCompleted = data.rounds.length * 3;
  else data.stagesCompleted = clampInt(data.stagesCompleted);
  if (fillStreak) data.threeStarStreak = trailingThreeStarRounds(data.rounds);
  else data.threeStarStreak = clampInt(data.threeStarStreak);
  if (fillDates) {
    data.playDates = [...new Set(data.rounds.map((round) => localDateKey(Date.parse(round.playedAt))))];
  }
  const progress = progressFromSave(data, Date.now());
  const owned = new Set(data.cards.map((card) => card.id));
  const base = historySnapshot(progress);
  const extra = grantsFor(base, owned);
  for (const round of data.rounds) {
    for (const grant of grantsFor(
      historySnapshot(progress, {
        finishedRound: true,
        stars: round.stars,
        perfect: round.firstTryCorrect >= 30,
        difficulty: round.difficulty,
        roundFirstTry: round.firstTryCorrect,
        stageFirstTry: round.firstTryCorrect >= 30 ? 10 : 0,
        stage: 3,
      }),
      owned,
    )) {
      extra.push(grant);
    }
  }
  const earnedAt = new Date().toISOString();
  for (const grant of extra) {
    if (owned.has(grant.id)) continue;
    owned.add(grant.id);
    data.cards.push({
      id: grant.id,
      earnedAt,
      achievement: grant.achievement,
      correctCount: grant.correctCount,
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
