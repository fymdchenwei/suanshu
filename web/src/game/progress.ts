import type { SaveData } from './storage';

export interface PlayerProgress {
  stagesCompleted: number;
  roundsByDifficulty: [number, number, number, number];
  bestStarsByDifficulty: [number, number, number, number];
  bestStreak: number;
  threeStarStreak: number;
  consecutiveDays: number;
  cumulativeFirstTry: number;
  todayFirstTry: number;
  roundsToday: number;
  roundsCompleted: number;
  rounds: { stars: number; difficulty: number; firstTryCorrect: number; playedAt: string }[];
}

export function localDateKey(ms: number): string {
  const date = new Date(ms);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function consecutivePlayDays(dates: readonly string[], nowMs: number): number {
  const keys = new Set(dates);
  const cursor = new Date(nowMs);
  const key = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  if (!keys.has(key(cursor))) cursor.setDate(cursor.getDate() - 1);
  if (!keys.has(key(cursor))) return 0;
  let count = 0;
  while (keys.has(key(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export function trailingThreeStarRounds(rounds: readonly { stars: number }[]): number {
  let count = 0;
  for (const round of rounds) {
    if (round.stars < 3) break;
    count += 1;
  }
  return count;
}

export function progressFromSave(data: SaveData, nowMs: number): PlayerProgress {
  const roundsByDifficulty = [1, 2, 3, 4].map((id) => data.bests[id as 1]?.roundsPlayed ?? 0) as [
    number,
    number,
    number,
    number,
  ];
  const bestStarsByDifficulty = [1, 2, 3, 4].map((id) => data.bests[id as 1]?.bestStars ?? 0) as [
    number,
    number,
    number,
    number,
  ];
  const today = localDateKey(nowMs);
  const todayRounds = data.rounds.filter((round) => localDateKey(Date.parse(round.playedAt)) === today);
  return {
    stagesCompleted: data.stagesCompleted,
    roundsByDifficulty,
    bestStarsByDifficulty,
    bestStreak: data.bestStreak,
    threeStarStreak: data.threeStarStreak,
    consecutiveDays: consecutivePlayDays(data.playDates, nowMs),
    cumulativeFirstTry: data.cumulativeFirstTry,
    todayFirstTry: todayRounds.reduce((sum, round) => sum + round.firstTryCorrect, 0),
    roundsToday: todayRounds.length,
    roundsCompleted: roundsByDifficulty.reduce((sum, count) => sum + count, 0),
    rounds: data.rounds,
  };
}
