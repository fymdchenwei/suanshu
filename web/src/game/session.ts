import {
  Difficulty,
  PROBLEMS_PER_STAGE,
  ROUND_SIZE,
  STAGE_COUNT,
  answerOf,
  generateRound,
  starsFor,
  type Difficulty as DifficultyId,
  type Problem,
} from '../engine/questionEngine';
import type { AudioPlayer } from './audio';
import { newGrants, type CardGrant, type EarnedCard } from './cards';
import { Copy } from './copy';
import {
  type DifficultyBest,
  type RoundRecord,
  type SaveData,
  type Store,
  normalize,
} from './storage';

export type Screen = 'home' | 'quiz' | 'results' | 'cards';

export interface ChestAward {
  stage: number;
  cards: CardGrant[];
  banked: number;
  cursor: number;
  isFinal: boolean;
}

export interface SessionOptions {
  now?: () => number;
  random?: () => number;
}

const REVEAL_LIMIT = 3;

export class GameSession {
  screen: Screen = 'home';
  difficulty: DifficultyId;
  problems: Problem[] = [];
  index = 0;
  input = '';
  firstTryCorrect = 0;
  streak = 0;
  bestStreakThisRound = 0;
  wrongToken = 0;
  correctToken = 0;
  encouragement: string | null = null;
  encouragementIsCheer = false;
  streakBanner: string | null = null;
  chest: ChestAward | null = null;
  earnedThisRound: EarnedCard[] = [];
  duration = 0;
  isMuted: boolean;
  exitPrompt = false;

  private screenBeforeCards: Screen = 'home';
  private missedCurrent = false;
  private savedRound = false;
  private startedAt = 0;
  private stageFirstTry = 0;
  private streakHit5 = false;
  private streakHit10 = false;
  private hadRetry = false;
  private data: SaveData;
  private cheerTimer: ReturnType<typeof setTimeout> | undefined;
  private bannerTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly listeners = new Set<() => void>();
  private readonly now: () => number;
  private readonly random: () => number;

  constructor(
    private readonly store: Store,
    private readonly audio: AudioPlayer,
    options: SessionOptions = {},
  ) {
    this.now = options.now ?? (() => Date.now());
    this.random = options.random ?? Math.random;
    const loaded = store.load();
    this.data = normalize(loaded);
    if (this.data.cards.length > loaded.cards.length) this.persist();
    this.difficulty = this.data.difficulty;
    this.isMuted = this.data.muted;
    this.audio.muted = this.isMuted;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  get save(): SaveData {
    return this.data;
  }

  get currentProblem(): Problem | null {
    return this.problems[this.index] ?? null;
  }

  get displayNumber(): number {
    if (this.chest && this.index > 0 && this.index % PROBLEMS_PER_STAGE === 0) return this.index;
    return Math.min(this.index + 1, ROUND_SIZE);
  }

  get stageNumber(): number {
    const clamped = Math.min(this.index, Math.max(0, ROUND_SIZE - 1));
    return Math.floor(clamped / PROBLEMS_PER_STAGE) + 1;
  }

  /** Stones the dinosaur has landed on in the current stage. Stays at 10 while the chest is open. */
  get stonesLanded(): number {
    if (this.chest && this.index > 0 && this.index % PROBLEMS_PER_STAGE === 0) {
      return PROBLEMS_PER_STAGE;
    }
    return this.index % PROBLEMS_PER_STAGE;
  }

  get stars(): number {
    return starsFor(this.firstTryCorrect);
  }

  get roundsPlayed(): number {
    return this.data.rounds.length;
  }

  bestFor(difficulty: DifficultyId): DifficultyBest | undefined {
    return this.data.bests[difficulty];
  }

  setDifficulty(difficulty: DifficultyId): void {
    if (this.screen !== 'home') return;
    this.difficulty = difficulty;
    this.data.difficulty = difficulty;
    this.persist();
    this.audio.playTap();
    this.emit();
  }

  startRound(seed?: bigint): void {
    const resolved = seed ?? freshSeed();
    this.problems = generateRound(this.difficulty, resolved);
    this.index = 0;
    this.input = '';
    this.firstTryCorrect = 0;
    this.streak = 0;
    this.bestStreakThisRound = 0;
    this.encouragement = null;
    this.encouragementIsCheer = false;
    this.streakBanner = null;
    this.chest = null;
    this.earnedThisRound = [];
    this.missedCurrent = false;
    this.savedRound = false;
    this.stageFirstTry = 0;
    this.streakHit5 = false;
    this.streakHit10 = false;
    this.hadRetry = false;
    this.duration = 0;
    this.exitPrompt = false;
    this.startedAt = this.now();
    this.screen = 'quiz';
    this.audio.playTap();
    this.emit();
  }

  tapDigit(digit: number): void {
    if (this.screen !== 'quiz' || this.chest || this.exitPrompt) return;
    if (digit < 0 || digit > 9) return;
    if (this.input.length >= 3) return;
    if (this.input === '0') {
      this.input = digit === 0 ? '0' : String(digit);
    } else {
      this.input += String(digit);
    }
    this.audio.playTap();
    this.emit();
  }

  deleteDigit(): void {
    if (this.screen !== 'quiz' || this.chest || this.exitPrompt || this.input.length === 0) return;
    this.input = this.input.slice(0, -1);
    this.audio.playTap();
    this.emit();
  }

  submit(): void {
    if (this.screen !== 'quiz' || this.chest || this.exitPrompt) return;
    const problem = this.currentProblem;
    if (!problem || this.input.length === 0) return;
    const value = Number(this.input);
    if (!Number.isInteger(value)) return;

    if (value !== answerOf(problem)) {
      this.missedCurrent = true;
      this.hadRetry = true;
      this.streak = 0;
      this.wrongToken += 1;
      this.encouragementIsCheer = false;
      const line = Copy.encouragements[Math.floor(this.random() * Copy.encouragements.length)] ?? Copy.wrongHint;
      this.encouragement = line.includes('再试一次') ? line : `${Copy.wrongHint} ${line}`;
      this.audio.playWrong();
      this.emit();
      return;
    }

    const firstTry = !this.missedCurrent;
    if (firstTry) {
      this.firstTryCorrect += 1;
      this.stageFirstTry += 1;
      this.streak += 1;
      this.bestStreakThisRound = Math.max(this.bestStreakThisRound, this.streak);
      if (this.streak >= 5) this.streakHit5 = true;
      if (this.streak >= 10) this.streakHit10 = true;
    } else {
      this.streak = 0;
    }
    this.input = '';
    this.missedCurrent = false;
    this.correctToken += 1;
    this.encouragementIsCheer = true;
    this.encouragement = firstTry ? Copy.correctCheer : Copy.correctAfterRetry;
    this.scheduleClearCheer();
    this.audio.playCorrect(Math.max(1, this.streak));
    this.audio.playHop();

    if (this.streak === 5) {
      this.showStreakBanner(Copy.streak5);
      this.audio.playStreak();
    } else if (this.streak === 10) {
      this.showStreakBanner(Copy.streak10);
      this.audio.playBigStreak();
    }

    this.index += 1;
    if (this.index % PROBLEMS_PER_STAGE !== 0) {
      this.emit();
      return;
    }

    const stage = this.index / PROBLEMS_PER_STAGE;
    const finished = this.index === ROUND_SIZE;
    if (finished) {
      this.duration = Math.max(0, (this.now() - this.startedAt) / 1000);
      this.persistRound();
    }
    this.chest = this.grantCards(stage, finished);
    this.audio.playChest();
    this.stageFirstTry = 0;
    this.streakHit5 = false;
    this.streakHit10 = false;
    this.hadRetry = false;
    this.emit();
  }

  dismissChest(): void {
    if (!this.chest) return;
    if (this.chest.cursor + 1 < this.chest.cards.length) {
      this.chest.cursor += 1;
      this.audio.playTap();
      this.emit();
      return;
    }
    const finished = this.chest.isFinal;
    this.chest = null;
    if (finished) {
      this.screen = 'results';
      this.audio.playFanfare();
    }
    this.emit();
  }

  playAgain(): void {
    this.startRound();
  }

  goHome(): void {
    this.streakBanner = null;
    this.chest = null;
    this.exitPrompt = false;
    this.screen = 'home';
    this.emit();
  }

  requestExit(): void {
    if (this.screen !== 'quiz') {
      this.goHome();
      return;
    }
    if (this.savedRound) {
      this.goHome();
      return;
    }
    this.exitPrompt = true;
    this.emit();
  }

  cancelExit(): void {
    this.exitPrompt = false;
    this.audio.playTap();
    this.emit();
  }

  openCards(): void {
    this.screenBeforeCards = this.screen === 'cards' ? this.screenBeforeCards : this.screen;
    this.screen = 'cards';
    this.audio.playTap();
    this.emit();
  }

  closeCards(): void {
    this.screen = this.screenBeforeCards;
    this.emit();
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    this.audio.muted = this.isMuted;
    this.data.muted = this.isMuted;
    this.persist();
    if (!this.isMuted) this.audio.playTap();
    this.emit();
  }

  private grantCards(stage: number, finished: boolean): ChestAward {
    const owned = new Set(this.data.cards.map((card) => card.id));
    for (const card of this.earnedThisRound) owned.add(card.id);
    const todayBase = countToday(this.data.rounds, this.now());
    const grants = newGrants(
      {
        stage,
        stageFirstTry: this.stageFirstTry,
        streakHit5: this.streakHit5,
        streakHit10: this.streakHit10,
        bestStreak: Math.max(this.data.bestStreak, this.bestStreakThisRound),
        hadRetry: this.hadRetry,
        roundFirstTry: this.firstTryCorrect,
        stars: finished ? this.stars : 0,
        perfect: finished && this.firstTryCorrect === ROUND_SIZE,
        finishedRound: finished,
        difficulty: this.difficulty,
        todayFirstTry: finished ? todayBase : todayBase + this.firstTryCorrect,
        cumulativeFirstTry: finished ? this.data.cumulativeFirstTry : this.data.cumulativeFirstTry + this.firstTryCorrect,
        roundsCompleted: totalRounds(this.data),
        difficultiesCleared: clearedDifficulties(this.data),
      },
      owned,
    );
    const earnedAt = new Date(this.now()).toISOString();
    for (const grant of grants) {
      const record: EarnedCard = {
        id: grant.id,
        earnedAt,
        achievement: grant.achievement,
        correctCount: grant.correctCount,
      };
      this.data.cards.push(record);
      this.earnedThisRound.push(record);
    }
    if (grants.length > 0) this.persist();
    return {
      stage,
      cards: grants.slice(0, REVEAL_LIMIT),
      banked: Math.max(0, grants.length - REVEAL_LIMIT),
      cursor: 0,
      isFinal: stage === STAGE_COUNT,
    };
  }

  private persistRound(): void {
    if (this.savedRound) return;
    this.savedRound = true;
    const starCount = this.stars;
    const record: RoundRecord = {
      id: createId(),
      playedAt: new Date(this.now()).toISOString(),
      difficulty: this.difficulty,
      firstTryCorrect: this.firstTryCorrect,
      total: ROUND_SIZE,
      stars: starCount,
      durationSeconds: this.duration,
      bestStreak: this.bestStreakThisRound,
    };
    this.data.rounds.unshift(record);
    this.data.rounds = this.data.rounds.slice(0, 40);

    const previous = this.data.bests[this.difficulty];
    this.data.bests[this.difficulty] = {
      roundsPlayed: (previous?.roundsPlayed ?? 0) + 1,
      bestStars: Math.max(previous?.bestStars ?? 0, starCount),
      bestFirstTry: Math.max(previous?.bestFirstTry ?? 0, this.firstTryCorrect),
    };
    this.data.cumulativeFirstTry += this.firstTryCorrect;
    this.data.bestStreak = Math.max(this.data.bestStreak, this.bestStreakThisRound);
    this.persist();
  }

  private persist(): void {
    this.store.save(this.data);
  }

  private showStreakBanner(text: string): void {
    this.streakBanner = text;
    clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(() => {
      if (this.streakBanner === text) {
        this.streakBanner = null;
        this.emit();
      }
    }, 1600);
  }

  private scheduleClearCheer(): void {
    const snapshot = this.encouragement;
    clearTimeout(this.cheerTimer);
    this.cheerTimer = setTimeout(() => {
      if (this.encouragement === snapshot && this.encouragementIsCheer) {
        this.encouragement = null;
        this.emit();
      }
    }, 700);
  }

  private emit(): void {
    for (const listener of this.listeners) listener();
  }
}

function countToday(rounds: RoundRecord[], nowMs: number): number {
  const today = new Date(nowMs);
  return rounds.reduce((sum, round) => {
    const played = new Date(round.playedAt);
    const same =
      played.getFullYear() === today.getFullYear() &&
      played.getMonth() === today.getMonth() &&
      played.getDate() === today.getDate();
    return same ? sum + round.firstTryCorrect : sum;
  }, 0);
}

function totalRounds(data: SaveData): number {
  return ([1, 2, 3, 4] as DifficultyId[]).reduce((sum, difficulty) => sum + (data.bests[difficulty]?.roundsPlayed ?? 0), 0);
}

function clearedDifficulties(data: SaveData): number[] {
  return ([1, 2, 3, 4] as DifficultyId[]).filter((difficulty) => (data.bests[difficulty]?.roundsPlayed ?? 0) > 0);
}

function freshSeed(): bigint {
  const time = BigInt(Date.now());
  const extra = BigInt(Math.floor(Math.random() * 1_000_000));
  return (time << 20n) ^ extra;
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `round-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export { Difficulty };
