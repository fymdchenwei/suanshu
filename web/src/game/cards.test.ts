import { describe, expect, it } from 'vitest';
import { CARD_ART_FILES } from 'virtual:card-art';
import { cardFaceFile } from './cardFaces';
import {
  CARDS,
  OLD_CARD_MAP,
  SERIES,
  cardsInSeries,
  emptySnapshot,
  grantsFor,
  legacyCardId,
  lockedCheer,
  mapSavedCardId,
  newGrants,
  resolveCard,
  unlockStatusWithOwned,
  type AwardSnapshot,
} from './cards';
import { progressFromSave } from './progress';
import { normalize } from './storage';

const FILES = new Set(CARD_ART_FILES);

function snap(partial: Partial<AwardSnapshot> = {}): AwardSnapshot {
  return emptySnapshot(partial);
}

function granted(partial: Partial<AwardSnapshot> = {}, owned: string[] = []): Set<string> {
  return new Set(grantsFor(snap(partial), owned).map((grant) => grant.id));
}

describe('card catalog', () => {
  it('ships 60 cards in five series of twelve', () => {
    expect(CARDS).toHaveLength(60);
    expect(SERIES).toHaveLength(5);
    expect(new Set(CARDS.map((card) => card.id)).size).toBe(60);
    expect(new Set(CARDS.map((card) => card.name)).size).toBe(60);
    expect(new Set(CARDS.map((card) => card.line)).size).toBe(60);
    expect(new Set(CARDS.map((card) => card.story)).size).toBe(60);
    expect(new Set(CARDS.map((card) => card.locked)).size).toBe(60);
    for (const series of SERIES) expect(cardsInSeries(series.id)).toHaveLength(12);
    for (const card of CARDS) {
      expect(card.condition.length).toBeGreaterThan(0);
      expect(card.story.split('。').filter((part) => part.trim()).length).toBeGreaterThanOrEqual(2);
      expect(card.line.length).toBeGreaterThan(4);
      expect(card.locked).toContain('{n}');
      expect(resolveCard(card.id)?.id).toBe(card.id);
      expect(FILES.has(cardFaceFile(card.id))).toBe(true);
    }
    expect(cardFaceFile('sprout-dragon')).toBe('card-sprout-dragon.webp');
    expect(cardFaceFile('brave-lion')).not.toBe('card-brave-lion.webp');
    for (const name of ['萌芽小龙', '云朵精灵', '数学小机器人', '草莓猫咪', '星星仙子', '星际小兔']) {
      expect(CARDS.some((card) => card.name === name)).toBe(true);
    }
  });

  it('maps old card ids and keeps unmapped stickers', () => {
    expect(mapSavedCardId('sprout')).toBe('sprout-dragon');
    expect(mapSavedCardId('flawless')).toBe('crown-dragon');
    expect(mapSavedCardId('night-sky')).toBe('astronaut-rabbit');
    expect(mapSavedCardId('advanced-clear')).toBe('hill-alpaca');
    expect(mapSavedCardId('correct-100')).toBe('rainbow-unicorn');
    expect(mapSavedCardId('correct-300')).toBe('magic-dragon');
    expect(mapSavedCardId('sprout-dragon')).toBe('sprout-dragon');
    expect(mapSavedCardId('mystery-sticker')).toBe('legacy:mystery-sticker');
    expect(Object.keys(OLD_CARD_MAP)).toHaveLength(27);
    expect(resolveCard(legacyCardId('star'))?.name).toBe('闪亮星星');
    expect(resolveCard('legacy:unknown')?.name).toBe('旧贴纸');
  });
});

describe('award conditions', () => {
  it('records a perfect stage with the streak cards', () => {
    const text = grantsFor(snap({ stageFirstTry: 10, bestStreak: 10, stagesCompleted: 1 })).map((grant) => grant.achievement);
    expect(text).toContain('本关答对 10/10 题');
    expect(text).toContain('连对 5 题');
    expect(text).toContain('连对 10 题');
    expect(text).not.toContain('一口气完成 30 题');
  });

  it('saves round achievements only when the round is finished', () => {
    const grants = grantsFor(
      snap({
        finishedRound: true,
        perfect: true,
        roundFirstTry: 30,
        stars: 3,
        difficulty: 4,
        stageFirstTry: 10,
        stage: 3,
        bestStreak: 10,
        stagesCompleted: 3,
        roundsCompleted: 1,
        roundsByDifficulty: [0, 0, 0, 1],
        bestStarsByDifficulty: [0, 0, 0, 3],
        todayFirstTry: 30,
        cumulativeFirstTry: 30,
      }),
    );
    const text = grants.map((grant) => grant.achievement);
    expect(text).toContain('一口气完成 30 题');
    expect(text).toContain('一轮 30 题全部一次答对');
    expect(grants.find((grant) => grant.id === 'crown-dragon')?.correctCount).toBe(30);
    expect(grants.some((grant) => grant.id === 'cheer-lamb')).toBe(false);
    expect(grants.some((grant) => grant.id === 'dino-king')).toBe(true);
  });

  it('offers a gentle consolation card when the round has one star', () => {
    const grants = grantsFor(
      snap({
        finishedRound: true,
        stageFirstTry: 4,
        hadRetry: true,
        roundFirstTry: 16,
        stars: 1,
        difficulty: 1,
        stagesCompleted: 3,
        roundsCompleted: 1,
        roundsByDifficulty: [1, 0, 0, 0],
        bestStarsByDifficulty: [1, 0, 0, 0],
      }),
    );
    const cheer = grants.find((grant) => grant.id === 'cheer-lamb');
    expect(cheer?.achievement).toBe('再加油！这次答对 16/30 题');
    expect(cheer?.correctCount).toBe(16);
    expect(grants.some((grant) => grant.id === 'star-penguin')).toBe(false);
    expect(grants.some((grant) => grant.id === 'crown-dragon')).toBe(false);
    expect(grants.some((grant) => grant.id === 'brave-lion')).toBe(true);
  });

  it('sorts fresh grants by rarity', () => {
    const fresh = newGrants(snap({ stagesCompleted: 1, stageFirstTry: 10, bestStreak: 10 }), ['cloud-sprite', 'medal-bear']);
    expect(fresh.some((grant) => grant.id === 'cloud-sprite')).toBe(false);
    expect(fresh[0]?.id).toBe('rainbow-parrot');
    expect(fresh.some((grant) => grant.id === 'spark-fox')).toBe(true);
  });

  const cases: { id: string; yes: Partial<AwardSnapshot>; no: Partial<AwardSnapshot>; owned?: string[] }[] = [
    { id: 'sprout-dragon', yes: { stagesCompleted: 1 }, no: { stagesCompleted: 0 } },
    { id: 'brave-lion', yes: { hadRetry: true }, no: { hadRetry: false, stagesCompleted: 3 } },
    { id: 'cheer-lamb', yes: { finishedRound: true, stars: 1 }, no: { finishedRound: true, stars: 2 } },
    { id: 'hello-duckling', yes: { stagesCompleted: 3 }, no: { stagesCompleted: 2 } },
    { id: 'medal-bear', yes: { stageFirstTry: 10 }, no: { stageFirstTry: 9 } },
    { id: 'rocket-pup', yes: { finishedRound: true }, no: { finishedRound: false, roundFirstTry: 30 } },
    { id: 'pirate-seal', yes: { stagesCompleted: 10 }, no: { stagesCompleted: 9 } },
    { id: 'detective-raccoon', yes: { stagesCompleted: 20 }, no: { stagesCompleted: 19 } },
    { id: 'wizard-owl', yes: { stagesCompleted: 30 }, no: { stagesCompleted: 29 } },
    { id: 'explorer-elephant', yes: { stagesCompleted: 50 }, no: { stagesCompleted: 49 } },
    { id: 'crown-dragon', yes: { perfect: true, finishedRound: true }, no: { finishedRound: true, perfect: false, roundFirstTry: 29 } },
    { id: 'champion-tiger', yes: { stagesCompleted: 100 }, no: { stagesCompleted: 99 } },
    { id: 'firefly-mouse', yes: { bestStreak: 3 }, no: { bestStreak: 2 } },
    { id: 'star-duck', yes: { finishedRound: true, stars: 2 }, no: { finishedRound: true, stars: 3 } },
    { id: 'melon-piglet', yes: { finishedRound: true, difficulty: 1, stars: 3 }, no: { finishedRound: true, difficulty: 2, stars: 3 } },
    { id: 'spark-fox', yes: { bestStreak: 5 }, no: { bestStreak: 4 } },
    { id: 'cloud-sprite', yes: { bestStreak: 8 }, no: { bestStreak: 7 } },
    { id: 'star-penguin', yes: { finishedRound: true, stars: 3 }, no: { finishedRound: true, stars: 2, bestStarsByDifficulty: [2, 0, 0, 0] } },
    { id: 'star-fairy', yes: { bestStreak: 12 }, no: { bestStreak: 11 } },
    { id: 'rainbow-parrot', yes: { bestStreak: 10 }, no: { bestStreak: 9 } },
    { id: 'lightning-deer', yes: { bestStreak: 15 }, no: { bestStreak: 14 } },
    { id: 'star-koala', yes: { threeStarStreak: 3 }, no: { threeStarStreak: 2 } },
    { id: 'comet-wolf', yes: { bestStreak: 20 }, no: { bestStreak: 19 } },
    { id: 'galaxy-whale', yes: { threeStarStreak: 5 }, no: { threeStarStreak: 4 } },
    { id: 'grass-bunny', yes: { finishedRound: true, difficulty: 1 }, no: { finishedRound: false, difficulty: 1 } },
    { id: 'bridge-otter', yes: { roundsByDifficulty: [0, 1, 0, 0] }, no: { finishedRound: true, difficulty: 1 } },
    { id: 'easy-hedgehog', yes: { roundsByDifficulty: [3, 0, 0, 0] }, no: { roundsByDifficulty: [2, 0, 0, 0], finishedRound: true, difficulty: 1 } },
    { id: 'carry-turtle', yes: { roundsByDifficulty: [0, 3, 0, 0] }, no: { roundsByDifficulty: [0, 2, 0, 0] } },
    { id: 'hill-alpaca', yes: { finishedRound: true, difficulty: 3 }, no: { finishedRound: true, difficulty: 2 } },
    { id: 'night-dolphin', yes: { finishedRound: true, difficulty: 4, stars: 2 }, no: { finishedRound: true, difficulty: 4, stars: 1 } },
    { id: 'advanced-eagle', yes: { roundsByDifficulty: [0, 0, 3, 0] }, no: { roundsByDifficulty: [0, 0, 2, 0], finishedRound: true, difficulty: 3 } },
    { id: 'math-robot', yes: { bestStarsByDifficulty: [0, 0, 3, 0] }, no: { finishedRound: true, difficulty: 3, stars: 2 } },
    { id: 'castle-knight-dragon', yes: { finishedRound: true, difficulty: 4 }, no: { finishedRound: true, difficulty: 3 } },
    { id: 'challenge-phoenix', yes: { roundsByDifficulty: [0, 0, 0, 3] }, no: { roundsByDifficulty: [0, 0, 0, 2], finishedRound: true, difficulty: 4 } },
    { id: 'dino-king', yes: { finishedRound: true, difficulty: 4, stars: 3 }, no: { finishedRound: true, difficulty: 4, stars: 2 } },
    { id: 'island-squirrel', yes: { roundsByDifficulty: [1, 1, 1, 0], finishedRound: true, difficulty: 4 }, no: { roundsByDifficulty: [1, 1, 1, 0], finishedRound: true, difficulty: 1 } },
    { id: 'sun-chick', yes: { todayFirstTry: 30 }, no: { todayFirstTry: 29 } },
    { id: 'strawberry-cat', yes: { cumulativeFirstTry: 20 }, no: { cumulativeFirstTry: 19 } },
    { id: 'honey-bee', yes: { roundsToday: 2 }, no: { roundsToday: 1 } },
    { id: 'early-rooster', yes: { consecutiveDays: 2 }, no: { consecutiveDays: 1 } },
    { id: 'flower-fairy', yes: { cumulativeFirstTry: 50 }, no: { cumulativeFirstTry: 49 } },
    { id: 'calendar-beaver', yes: { consecutiveDays: 3 }, no: { consecutiveDays: 2 } },
    { id: 'moon-rabbit', yes: { consecutiveDays: 5 }, no: { consecutiveDays: 4 } },
    { id: 'rainbow-unicorn', yes: { cumulativeFirstTry: 100 }, no: { cumulativeFirstTry: 99 } },
    { id: 'treasure-monkey', yes: { cumulativeFirstTry: 200 }, no: { cumulativeFirstTry: 199 } },
    { id: 'diamond-lemur', yes: { consecutiveDays: 7 }, no: { consecutiveDays: 6 } },
    { id: 'golden-leopard', yes: { todayFirstTry: 60 }, no: { todayFirstTry: 59 } },
    { id: 'magic-dragon', yes: { cumulativeFirstTry: 300 }, no: { cumulativeFirstTry: 299 } },
    { id: 'panda-friend', yes: { roundsCompleted: 3 }, no: { roundsCompleted: 2 } },
    { id: 'treasure-panda', yes: { roundsCompleted: 5 }, no: { roundsCompleted: 4 } },
    { id: 'island-guardian', yes: { roundsCompleted: 10 }, no: { roundsCompleted: 9 } },
    { id: 'knight-panda', yes: { roundsCompleted: 20 }, no: { roundsCompleted: 19 } },
    { id: 'tortoise-elder', yes: { roundsCompleted: 30 }, no: { roundsCompleted: 29 } },
  ];

  it.each(cases)('grants $id only when its condition is met', ({ id, yes, no, owned }) => {
    expect(granted(yes, owned).has(id)).toBe(true);
    expect(granted(no, owned).has(id)).toBe(false);
  });

  it('counts collected cards toward later collection cards in one pass', () => {
    const nine = CARDS.slice(0, 9).map((card) => card.id);
    const fromNine = granted({}, nine);
    expect(fromNine.has('hamster-collector')).toBe(true);
    expect(fromNine.has('giraffe-friend')).toBe(true);
    expect(fromNine.has('zebra-collector')).toBe(false);
    expect(granted({}, CARDS.slice(0, 4).map((card) => card.id)).has('hamster-collector')).toBe(false);
    expect(granted({}, CARDS.slice(0, 20).map((card) => card.id)).has('zebra-collector')).toBe(true);
    expect(granted({}, CARDS.slice(0, 30).map((card) => card.id)).has('flamingo-friend')).toBe(true);
    expect(granted({}, CARDS.slice(0, 45).map((card) => card.id)).has('polar-bear')).toBe(true);
  });

  it('grants the astronaut rabbit for any finished series except its own', () => {
    const partners = cardsInSeries('partners').map((card) => card.id);
    expect(granted({}, partners).has('astronaut-rabbit')).toBe(true);
    expect(granted({}, partners.slice(0, 11)).has('astronaut-rabbit')).toBe(false);
    const friends = cardsInSeries('friends')
      .map((card) => card.id)
      .filter((id) => id !== 'astronaut-rabbit');
    expect(granted({}, friends).has('astronaut-rabbit')).toBe(false);
  });

  it('grants the gem dragon only when the other 59 cards are owned', () => {
    const almost = CARDS.filter((card) => card.id !== 'gem-dragon').map((card) => card.id);
    expect(granted({}, almost).has('gem-dragon')).toBe(true);
    expect(granted({}, almost.filter((id) => id !== 'sprout-dragon')).has('gem-dragon')).toBe(false);
  });

  it('shows locked progress and a filled-in cheer', () => {
    const saved = normalize({
      rounds: [],
      bests: {},
      bestStreak: 3,
      cumulativeFirstTry: 0,
      stagesCompleted: 2,
      threeStarStreak: 0,
      playDates: [],
    });
    const progress = progressFromSave(saved, Date.now());
    const status = unlockStatusWithOwned('spark-fox', progress, []);
    expect(status.text).toBe('连对5题解锁 (3/5)');
    const fox = CARDS.find((card) => card.id === 'spark-fox');
    expect(fox && lockedCheer(fox, status)).toContain('2');
    const collected = unlockStatusWithOwned('giraffe-friend', progress, CARDS.slice(0, 6).map((card) => card.id));
    expect(collected.text).toBe('收集10张卡解锁 (6/10)');
  });
});

describe('save migration', () => {
  it('keeps legacy stickers and backfills cards the history already earned', () => {
    const saved = normalize({
      muted: false,
      difficulty: 2,
      stickers: [
        { id: 'star', earnedAt: '2026-01-02T00:00:00.000Z', difficulty: 1, stage: 2 },
        { id: 'rocket', earnedAt: '2026-01-03T00:00:00.000Z', difficulty: 4, stage: 1 },
        { id: 'not-a-real-sticker', earnedAt: '2026-01-04T00:00:00.000Z', difficulty: 1, stage: 1 },
      ],
      cards: [
        { id: 'flawless', earnedAt: '2026-01-05T00:00:00.000Z', achievement: '一轮 30 题全部一次答对', correctCount: 30 },
        { id: 'cheer-up', earnedAt: '2026-01-06T00:00:00.000Z', achievement: '再加油！这次答对 16/30 题', correctCount: 16 },
      ],
      rounds: [],
      bests: {},
      cumulativeFirstTry: 12,
      bestStreak: 4,
    });
    const ids = saved.cards.map((card) => card.id);
    expect(saved.stickers).toHaveLength(3);
    expect(ids).toContain(legacyCardId('star'));
    expect(ids).toContain(legacyCardId('rocket'));
    expect(ids).toContain('crown-dragon');
    expect(ids).toContain('cheer-lamb');
    expect(ids).toContain('firefly-mouse');
    expect(ids).not.toContain('legacy:not-a-real-sticker');
    expect(saved.cards.find((card) => card.id === legacyCardId('star'))?.achievement).toContain('闪亮星星');
    expect(saved.difficulty).toBe(2);
    expect(saved.cumulativeFirstTry).toBe(12);

    const again = normalize(saved);
    expect(again.cards.map((card) => card.id).sort()).toEqual([...ids].sort());
  });
});
