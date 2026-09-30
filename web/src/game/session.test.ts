import { describe, expect, it } from 'vitest';
import { answerOf, starsFor } from '../engine/questionEngine';
import { SilentAudio } from './audio';
import { CARDS } from './cards';
import { GameSession } from './session';
import { MemoryStore } from './storage';

describe('GameSession', () => {
  it('lets a wrong answer retry the same problem without a penalty', () => {
    const session = makeSession();
    session.startRound(1n);
    const problem = session.currentProblem!;
    const wrong = answerOf(problem) === 0 ? '1' : '0';
    enter(session, wrong);
    session.submit();
    expect(session.index).toBe(0);
    expect(session.firstTryCorrect).toBe(0);
    expect(session.streak).toBe(0);
    expect(session.encouragementIsCheer).toBe(false);
    expect(session.encouragement).toContain('再试一次');
    expect(session.input).toBe(wrong);

    session.input = '';
    enter(session, String(answerOf(problem)));
    session.submit();
    expect(session.index).toBe(1);
    expect(session.firstTryCorrect).toBe(0);
    expect(session.encouragementIsCheer).toBe(true);
  });

  it('counts first-try answers, opens a chest every 10, and saves only a finished round', () => {
    const { session, store } = makeSessionWithStore();
    session.startRound(7n);
    for (let n = 0; n < 10; n += 1) answerCurrent(session);
    expect(session.chest?.stage).toBe(1);
    expect(session.chest?.isFinal).toBe(false);
    expect(session.stonesLanded).toBe(10);
    expect(store.data.cards.map((card) => card.achievement)).toEqual(
      expect.arrayContaining(['本关答对 10/10 题', '连对 10 题', '连对 5 题']),
    );
    expect(store.data.rounds).toHaveLength(0);
    expect(session.chest && session.chest.cards.length).toBeGreaterThan(0);
    expect(session.chest && session.chest.cards.length).toBeLessThanOrEqual(3);

    session.requestExit();
    expect(session.exitPrompt).toBe(true);
    session.goHome();
    expect(session.screen).toBe('home');
    expect(store.data.cards.length).toBeGreaterThan(0);
    expect(store.data.rounds).toHaveLength(0);
    expect(store.data.cumulativeFirstTry).toBe(0);
  });

  it('awards stars from first-try accuracy and does not duplicate owned cards', () => {
    const { store } = makeSessionWithStore();
    store.data.cards = CARDS.map((card) => ({
      id: card.id,
      earnedAt: '2026-01-01T00:00:00.000Z',
      achievement: card.condition,
      correctCount: 1,
    }));
    store.save(store.data);

    const full = makeSession(store);
    full.startRound(3n);
    for (let n = 0; n < 30; n += 1) {
      if (n === 4) {
        const problem = full.currentProblem!;
        enter(full, answerOf(problem) === 0 ? '1' : '0');
        full.submit();
        full.input = '';
      }
      answerCurrent(full);
      dismissAll(full);
    }
    expect(full.screen).toBe('results');
    expect(full.firstTryCorrect).toBe(29);
    expect(full.stars).toBe(starsFor(29));
    expect(full.earnedThisRound).toHaveLength(0);
    expect(store.data.rounds).toHaveLength(1);
    expect(store.data.rounds[0]?.stars).toBe(3);
    expect(store.data.bests[1]?.bestStars).toBe(3);
    expect(store.data.cumulativeFirstTry).toBe(29);
    expect(store.data.cards).toHaveLength(CARDS.length);
  });

  it('gives a consolation card when a finished round has one star', () => {
    const { session, store } = makeSessionWithStore();
    session.startRound(9n);
    for (let n = 0; n < 30; n += 1) {
      if (n < 12) {
        const problem = session.currentProblem!;
        enter(session, answerOf(problem) === 0 ? '1' : '0');
        session.submit();
        session.input = '';
      }
      answerCurrent(session);
      dismissAll(session);
    }
    expect(session.screen).toBe('results');
    expect(session.firstTryCorrect).toBe(18);
    expect(session.stars).toBe(1);
    const cheer = store.data.cards.find((card) => card.id === 'cheer-up');
    expect(cheer?.achievement).toBe('再加油！这次答对 18/30 题');
    expect(cheer?.correctCount).toBe(18);
    expect(store.data.cards.some((card) => card.id === 'three-stars')).toBe(false);
  });

  it('remembers mute and difficulty, and keeps migrated sticker cards', () => {
    const { session, store } = makeSessionWithStore();
    store.data.stickers = [{ id: 'panda', earnedAt: '2026-02-02T00:00:00.000Z', difficulty: 1, stage: 1 }];
    store.save(store.data);
    const migrated = makeSession(store);
    expect(migrated.save.cards.some((card) => card.id === 'legacy:panda')).toBe(true);

    session.setDifficulty(4);
    session.toggleMute();
    expect(store.data.difficulty).toBe(4);
    expect(store.data.muted).toBe(true);
    const restored = makeSession(store);
    expect(restored.difficulty).toBe(4);
    expect(restored.isMuted).toBe(true);
  });
});

function makeSession(store = new MemoryStore()) {
  return new GameSession(store, new SilentAudio(), {
    now: () => 1_700_000_000_000,
    random: () => 0,
  });
}

function makeSessionWithStore() {
  const store = new MemoryStore();
  return { store, session: makeSession(store) };
}

function enter(session: GameSession, digits: string) {
  for (const digit of digits) session.tapDigit(Number(digit));
}

function answerCurrent(session: GameSession) {
  const problem = session.currentProblem;
  if (!problem) throw new Error('no problem');
  session.input = '';
  enter(session, String(answerOf(problem)));
  session.submit();
}

function dismissAll(session: GameSession) {
  let guard = 0;
  while (session.chest && guard < 12) {
    session.dismissChest();
    guard += 1;
  }
}
