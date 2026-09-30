import { describe, expect, it } from 'vitest';
import { REUSED_CARD_ART, cardFaceFile } from './cardFaces';
import {
  CARDS,
  grantsFor,
  legacyCardId,
  newGrants,
  resolveCard,
  type AwardSnapshot,
} from './cards';
import { normalize } from './storage';

function snap(partial: Partial<AwardSnapshot> = {}): AwardSnapshot {
  return {
    stage: 1,
    stageFirstTry: 10,
    streakHit5: true,
    streakHit10: true,
    bestStreak: 10,
    hadRetry: false,
    roundFirstTry: 10,
    stars: 0,
    perfect: false,
    finishedRound: false,
    difficulty: 1,
    todayFirstTry: 10,
    cumulativeFirstTry: 10,
    roundsCompleted: 0,
    difficultiesCleared: [],
    ...partial,
  };
}

describe('card awards', () => {
  it('ships at least 24 distinct illustrated cards', () => {
    expect(CARDS.length).toBeGreaterThanOrEqual(24);
    expect(new Set(CARDS.map((card) => card.id)).size).toBe(CARDS.length);
    for (const card of CARDS) {
      expect(card.condition.length).toBeGreaterThan(0);
      expect(card.name.length).toBeGreaterThan(0);
      expect(card.line.length).toBeGreaterThan(4);
      expect(resolveCard(card.id)?.id).toBe(card.id);
    }
    expect(new Set(CARDS.map((card) => card.line)).size).toBe(CARDS.length);
    expect(new Set(CARDS.map((card) => card.name)).size).toBe(CARDS.length);
    for (const name of ['萌芽小龙', '云朵精灵', '数学小机器人', '草莓猫咪', '星星仙子', '宇航兔']) {
      expect(CARDS.some((card) => card.name === name)).toBe(true);
    }
    const own = ['sprout', 'streak-10', 'one-breath', 'advanced-clear', 'correct-300', 'night-sky'];
    for (const card of CARDS) expect(cardFaceFile(card.id)).toMatch(/\.webp$/);
    for (const id of own) expect(REUSED_CARD_ART[id]).toBeUndefined();
    expect(Object.keys(REUSED_CARD_ART)).toHaveLength(CARDS.length - own.length);
  });

  it('records a perfect stage with the streak cards', () => {
    const grants = grantsFor(snap());
    const text = grants.map((grant) => grant.achievement);
    expect(text).toContain('本关答对 10/10 题');
    expect(text).toContain('连对 5 题');
    expect(text).toContain('连对 10 题');
    expect(text).not.toContain('一口气完成 30 题');
    expect(text).not.toContain('全程零错误');
  });

  it('saves round achievements only when the round is finished', () => {
    const grants = grantsFor(
      snap({
        finishedRound: true,
        perfect: true,
        roundFirstTry: 30,
        stars: 3,
        difficulty: 4,
        todayFirstTry: 30,
        cumulativeFirstTry: 30,
        roundsCompleted: 1,
        difficultiesCleared: [4],
        stage: 3,
        bestStreak: 10,
      }),
    );
    const text = grants.map((grant) => grant.achievement);
    expect(text).toContain('一口气完成 30 题');
    expect(text).toContain('全程零错误');
    expect(text).toContain('今天答对 30 题');
    expect(text).toContain('挑战难度 3 通关');
    expect(text).toContain('一轮得到 3 颗星');
    expect(text).not.toContain('再加油！这次答对 30/30 题');
    const challenge = grants.find((grant) => grant.id === 'challenge-3');
    expect(challenge?.correctCount).toBe(30);
  });

  it('offers a gentle consolation card when the round has one star', () => {
    const grants = grantsFor(
      snap({
        finishedRound: true,
        stageFirstTry: 4,
        streakHit5: false,
        streakHit10: false,
        hadRetry: true,
        roundFirstTry: 16,
        stars: 1,
        perfect: false,
        difficulty: 1,
        todayFirstTry: 16,
        cumulativeFirstTry: 16,
        roundsCompleted: 1,
        difficultiesCleared: [1],
        stage: 3,
      }),
    );
    const cheer = grants.find((grant) => grant.id === 'cheer-up');
    expect(cheer?.achievement).toBe('再加油！这次答对 16/30 题');
    expect(cheer?.correctCount).toBe(16);
    expect(grants.some((grant) => grant.id === 'three-stars')).toBe(false);
    expect(grants.some((grant) => grant.id === 'flawless')).toBe(false);
    expect(grants.some((grant) => grant.id === 'retry-heart')).toBe(true);
  });

  it('skips cards the player already owns and keeps the first card in front', () => {
    const fresh = newGrants(snap(), ['streak-10', 'perfect-stage']);
    expect(fresh.some((grant) => grant.id === 'streak-10')).toBe(false);
    expect(fresh[0]?.id).toBe('sprout');
    expect(fresh.some((grant) => grant.id === 'streak-5')).toBe(true);
  });

  it('turns old stickers into memory cards without dropping them', () => {
    const saved = normalize({
      muted: false,
      difficulty: 2,
      stickers: [
        { id: 'star', earnedAt: '2026-01-02T00:00:00.000Z', difficulty: 1, stage: 2 },
        { id: 'rocket', earnedAt: '2026-01-03T00:00:00.000Z', difficulty: 4, stage: 1 },
        { id: 'not-a-real-sticker', earnedAt: '2026-01-04T00:00:00.000Z', difficulty: 1, stage: 1 },
      ],
      rounds: [],
      bests: {},
      cumulativeFirstTry: 12,
      bestStreak: 4,
    });
    expect(saved.stickers).toHaveLength(3);
    expect(saved.cards.map((card) => card.id)).toEqual([legacyCardId('star'), legacyCardId('rocket')]);
    expect(saved.cards[0]?.achievement).toContain('闪亮星星');
    expect(saved.cards[0]?.correctCount).toBe(0);
    expect(saved.difficulty).toBe(2);
    expect(saved.cumulativeFirstTry).toBe(12);
    expect(resolveCard(legacyCardId('star'))?.name).toBe('闪亮星星');

    const again = normalize(saved);
    expect(again.cards).toHaveLength(2);
  });
});
