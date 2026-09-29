import { describe, expect, it } from 'vitest';
import { answerOf, starsFor } from '../engine/questionEngine';
import { SilentAudio } from './audio';
import { GameSession } from './session';
import { MemoryStore } from './storage';
import { STICKERS } from './stickers';

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
    expect(session.encouragement).toBeTruthy();
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
    expect(store.data.stickers).toHaveLength(1);
    expect(store.data.rounds).toHaveLength(0);

    session.requestExit();
    expect(session.exitPrompt).toBe(true);
    session.goHome();
    expect(session.screen).toBe('home');
    expect(store.data.stickers).toHaveLength(1);
    expect(store.data.rounds).toHaveLength(0);
    expect(store.data.cumulativeFirstTry).toBe(0);
  });

  it('awards stars from first-try accuracy and keeps stickers when the book is full', () => {
    const { store } = makeSessionWithStore();
    store.data.stickers = STICKERS.map((sticker, index) => ({
      id: sticker.id,
      earnedAt: '2026-01-01T00:00:00.000Z',
      difficulty: 1,
      stage: (index % 3) + 1,
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
      if (full.chest) {
        expect([10, 20, 30]).toContain(full.index);
        full.dismissChest();
      }
    }
    expect(full.screen).toBe('results');
    expect(full.firstTryCorrect).toBe(29);
    expect(full.stars).toBe(starsFor(29));
    expect(full.earnedThisRound).toHaveLength(0);
    expect(store.data.rounds).toHaveLength(1);
    expect(store.data.rounds[0]?.stars).toBe(3);
    expect(store.data.bests[1]?.bestStars).toBe(3);
    expect(store.data.cumulativeFirstTry).toBe(29);
    expect(store.data.stickers).toHaveLength(STICKERS.length);
  });

  it('remembers mute and difficulty', () => {
    const { session, store } = makeSessionWithStore();
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
