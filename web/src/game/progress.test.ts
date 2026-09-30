import { describe, expect, it } from 'vitest';
import { consecutivePlayDays, localDateKey, progressFromSave, trailingThreeStarRounds } from './progress';
import { normalize } from './storage';

describe('progress counters', () => {
  const today = new Date(2026, 8, 30, 15).getTime();
  const yesterday = new Date(2026, 8, 29, 15).getTime();
  const older = new Date(2026, 8, 28, 15).getTime();

  it('counts consecutive local play days, skipping a missed today', () => {
    expect(consecutivePlayDays([localDateKey(today), localDateKey(yesterday)], today)).toBe(2);
    expect(consecutivePlayDays([localDateKey(yesterday), localDateKey(older)], today)).toBe(2);
    expect(consecutivePlayDays([localDateKey(older)], today)).toBe(0);
    expect(consecutivePlayDays([], today)).toBe(0);
  });

  it('counts a trailing run of three-star rounds from the newest save', () => {
    expect(trailingThreeStarRounds([{ stars: 3 }, { stars: 3 }, { stars: 1 }, { stars: 3 }])).toBe(2);
    expect(trailingThreeStarRounds([{ stars: 2 }, { stars: 3 }])).toBe(0);
  });

  it('reads stage, difficulty, today, and streak counters from a save', () => {
    const saved = normalize({
      stagesCompleted: 7,
      threeStarStreak: 2,
      playDates: [localDateKey(today), localDateKey(yesterday)],
      bestStreak: 8,
      cumulativeFirstTry: 40,
      rounds: [
        { id: 'a', playedAt: new Date(today).toISOString(), difficulty: 1, firstTryCorrect: 21, total: 30, stars: 2, durationSeconds: 40, bestStreak: 4 },
        { id: 'b', playedAt: new Date(yesterday).toISOString(), difficulty: 2, firstTryCorrect: 27, total: 30, stars: 3, durationSeconds: 50, bestStreak: 8 },
      ],
      bests: {
        1: { roundsPlayed: 2, bestStars: 2, bestFirstTry: 21 },
        3: { roundsPlayed: 1, bestStars: 3, bestFirstTry: 30 },
      },
    });
    const progress = progressFromSave(saved, today);
    expect(progress.stagesCompleted).toBe(7);
    expect(progress.roundsByDifficulty).toEqual([2, 0, 1, 0]);
    expect(progress.bestStarsByDifficulty).toEqual([2, 0, 3, 0]);
    expect(progress.threeStarStreak).toBe(2);
    expect(progress.consecutiveDays).toBe(2);
    expect(progress.roundsToday).toBe(1);
    expect(progress.todayFirstTry).toBe(21);
    expect(progress.roundsCompleted).toBe(3);
    expect(progress.bestStreak).toBe(8);
  });
});
