import { describe, expect, it } from 'vitest';
import {
  ALL_DIFFICULTIES,
  Difficulty,
  ROUND_SIZE,
  STAGE_COUNT,
  PROBLEMS_PER_STAGE,
  answerOf,
  debugName,
  generateRound,
  isValid,
  problemKey,
  starsFor,
  usesCarryOrBorrow,
  type Problem,
} from './questionEngine';

const MAX_U64 = (1n << 64n) - 1n;
const seeds = [0n, 1n, 42n, 9999n, MAX_U64];

describe('QuestionEngine', () => {
  it('builds a valid alternating round for every difficulty and seed', () => {
    for (const difficulty of ALL_DIFFICULTIES) {
      for (const seed of seeds) {
        assertRoundRules(difficulty, seed);
      }
    }
  });

  it('is deterministic for the same seed', () => {
    for (const difficulty of ALL_DIFFICULTIES) {
      const first = generateRound(difficulty, 123_456_789).map(problemKey).join('|');
      const second = generateRound(difficulty, 123_456_789).map(problemKey).join('|');
      expect(first).toBe(second);
    }
  });

  it('changes the round when the seed changes', () => {
    for (const difficulty of ALL_DIFFICULTIES) {
      const first = generateRound(difficulty, 1).map(problemKey).join('|');
      const second = generateRound(difficulty, 2).map(problemKey).join('|');
      expect(first).not.toBe(second);
    }
  });

  it('matches the curriculum examples and boundaries', () => {
    const fortyPlusSeven: Problem = { lhs: 40, rhs: 7, operation: 'addition' };
    expect(answerOf(fortyPlusSeven)).toBe(47);
    expect(usesCarryOrBorrow(fortyPlusSeven)).toBe(false);
    assertValidOnly(fortyPlusSeven, Difficulty.twoDigitOnesNoCarry);

    const fiftySixMinusSix: Problem = { lhs: 56, rhs: 6, operation: 'subtraction' };
    expect(answerOf(fiftySixMinusSix)).toBe(50);
    expect(usesCarryOrBorrow(fiftySixMinusSix)).toBe(false);
    assertValidOnly(fiftySixMinusSix, Difficulty.twoDigitOnesNoCarry);

    const fiftySixMinusSeven: Problem = { lhs: 56, rhs: 7, operation: 'subtraction' };
    expect(answerOf(fiftySixMinusSeven)).toBe(49);
    expect(usesCarryOrBorrow(fiftySixMinusSeven)).toBe(true);
    assertValidOnly(fiftySixMinusSeven, Difficulty.twoDigitWithCarry);

    const mockup: Problem = { lhs: 38, rhs: 47, operation: 'addition' };
    expect(answerOf(mockup)).toBe(85);
    expect(usesCarryOrBorrow(mockup)).toBe(true);
    assertValidOnly(mockup, Difficulty.twoDigitWithCarry);

    const easy: Problem = { lhs: 12, rhs: 3, operation: 'addition' };
    expect(answerOf(easy)).toBe(15);
    expect(usesCarryOrBorrow(easy)).toBe(false);
    assertValidOnly(easy, Difficulty.within20NoCarry);

    const carryWithin20: Problem = { lhs: 8, rhs: 7, operation: 'addition' };
    expect(answerOf(carryWithin20)).toBe(15);
    expect(usesCarryOrBorrow(carryWithin20)).toBe(true);
    assertValidOnly(carryWithin20, Difficulty.within20WithCarry);

    const borrowWithin20: Problem = { lhs: 13, rhs: 5, operation: 'subtraction' };
    expect(usesCarryOrBorrow(borrowWithin20)).toBe(true);
    assertValidOnly(borrowWithin20, Difficulty.within20WithCarry);

    const tensBorrow: Problem = { lhs: 20, rhs: 6, operation: 'subtraction' };
    expect(usesCarryOrBorrow(tensBorrow)).toBe(true);
    assertValidOnly(tensBorrow, Difficulty.within20WithCarry);

    const resultZero: Problem = { lhs: 7, rhs: 7, operation: 'subtraction' };
    expect(answerOf(resultZero)).toBe(0);
    expect(usesCarryOrBorrow(resultZero)).toBe(false);
    assertValidOnly(resultZero, Difficulty.within20NoCarry);

    const answerOneHundred: Problem = { lhs: 45, rhs: 55, operation: 'addition' };
    expect(answerOf(answerOneHundred)).toBe(100);
    expect(usesCarryOrBorrow(answerOneHundred)).toBe(true);
    assertValidOnly(answerOneHundred, Difficulty.twoDigitWithCarry);

    assertInvalidEverywhere({ lhs: 80, rhs: 30, operation: 'addition' });
    assertInvalidEverywhere({ lhs: 4, rhs: 9, operation: 'subtraction' });
    assertInvalidEverywhere({ lhs: 15, rhs: 0, operation: 'addition' });

    const noCarryTwoDigit: Problem = { lhs: 23, rhs: 45, operation: 'addition' };
    expect(answerOf(noCarryTwoDigit)).toBe(68);
    expect(usesCarryOrBorrow(noCarryTwoDigit)).toBe(false);
    assertInvalidEverywhere(noCarryTwoDigit);

    const reversedAddition: Problem = { lhs: 7, rhs: 40, operation: 'addition' };
    assertValidOnly(reversedAddition, Difficulty.twoDigitOnesNoCarry);
    expect(problemKey(reversedAddition)).not.toBe(problemKey(fortyPlusSeven));

    const level2DoesNotLeak: Problem = { lhs: 15, rhs: 5, operation: 'addition' };
    expect(answerOf(level2DoesNotLeak)).toBe(20);
    assertValidOnly(level2DoesNotLeak, Difficulty.within20WithCarry);

    const justOverTwenty: Problem = { lhs: 19, rhs: 9, operation: 'addition' };
    expect(answerOf(justOverTwenty)).toBe(28);
    assertValidOnly(justOverTwenty, Difficulty.twoDigitWithCarry);

    const twoDigitPlusOneWithCarry: Problem = { lhs: 28, rhs: 5, operation: 'addition' };
    expect(answerOf(twoDigitPlusOneWithCarry)).toBe(33);
    assertValidOnly(twoDigitPlusOneWithCarry, Difficulty.twoDigitWithCarry);
  });

  it('uses the same star cutoffs as the native game', () => {
    expect(ROUND_SIZE).toBe(30);
    expect(PROBLEMS_PER_STAGE * STAGE_COUNT).toBe(ROUND_SIZE);
    expect(starsFor(30)).toBe(3);
    expect(starsFor(27)).toBe(3);
    expect(starsFor(26)).toBe(2);
    expect(starsFor(21)).toBe(2);
    expect(starsFor(20)).toBe(1);
    expect(starsFor(0)).toBe(1);
    expect(starsFor(-4)).toBe(1);
    expect(starsFor(500)).toBe(3);
    expect(starsFor(9, 10)).toBe(3);
    expect(starsFor(7, 10)).toBe(2);
    expect(starsFor(6, 10)).toBe(1);
    expect(starsFor(0, 0)).toBe(1);
  });

  it('flags carry and borrow on the ones place', () => {
    expect(usesCarryOrBorrow({ lhs: 40, rhs: 7, operation: 'addition' })).toBe(false);
    expect(usesCarryOrBorrow({ lhs: 38, rhs: 47, operation: 'addition' })).toBe(true);
    expect(usesCarryOrBorrow({ lhs: 56, rhs: 6, operation: 'subtraction' })).toBe(false);
    expect(usesCarryOrBorrow({ lhs: 50, rhs: 6, operation: 'subtraction' })).toBe(true);
    expect(usesCarryOrBorrow({ lhs: 30, rhs: 10, operation: 'subtraction' })).toBe(false);
  });
});

function assertRoundRules(difficulty: Difficulty, seed: bigint) {
  const round = generateRound(difficulty, seed);
  expect(round, `${debugName(difficulty)} seed ${seed}`).toHaveLength(ROUND_SIZE);
  expect(new Set(round.map(problemKey)).size, `duplicates in ${debugName(difficulty)}`).toBe(round.length);

  let additions = 0;
  let subtractions = 0;
  round.forEach((problem, offset) => {
    expect(isValid(problem, difficulty), `${format(problem)} / ${debugName(difficulty)}`).toBe(true);
    expect(problem.lhs).toBeGreaterThan(0);
    expect(problem.rhs).toBeGreaterThan(0);
    expect(problem.lhs).toBeLessThanOrEqual(99);
    expect(problem.rhs).toBeLessThanOrEqual(99);
    expect(answerOf(problem)).toBeGreaterThanOrEqual(0);
    expect(answerOf(problem)).toBeLessThanOrEqual(100);

    const matches = ALL_DIFFICULTIES.filter((candidate) => isValid(problem, candidate));
    expect(matches, format(problem)).toEqual([difficulty]);

    if (problem.operation === 'addition') {
      additions += 1;
      expect(answerOf(problem)).toBe(problem.lhs + problem.rhs);
      expect(offset % 2, `${format(problem)} at ${offset}`).toBe(0);
    } else {
      subtractions += 1;
      expect(answerOf(problem)).toBe(problem.lhs - problem.rhs);
      expect(problem.lhs).toBeGreaterThanOrEqual(problem.rhs);
      expect(offset % 2, `${format(problem)} at ${offset}`).toBe(1);
    }

    if (difficulty === Difficulty.within20NoCarry) {
      expect(answerOf(problem)).toBeLessThanOrEqual(20);
      expect(usesCarryOrBorrow(problem)).toBe(false);
    } else if (difficulty === Difficulty.within20WithCarry) {
      expect(Math.max(problem.lhs, answerOf(problem))).toBeLessThanOrEqual(20);
      expect(usesCarryOrBorrow(problem)).toBe(true);
    } else if (difficulty === Difficulty.twoDigitOnesNoCarry) {
      expect(usesCarryOrBorrow(problem)).toBe(false);
      if (problem.operation === 'subtraction') {
        expect(problem.lhs).toBeGreaterThanOrEqual(20);
        expect(problem.lhs).toBeLessThanOrEqual(99);
        expect(problem.rhs).toBeGreaterThanOrEqual(1);
        expect(problem.rhs).toBeLessThanOrEqual(9);
      }
    } else {
      expect(usesCarryOrBorrow(problem)).toBe(true);
    }
  });

  expect(additions, debugName(difficulty)).toBe(15);
  expect(subtractions, debugName(difficulty)).toBe(15);
}

function assertValidOnly(problem: Problem, expected: Difficulty) {
  for (const difficulty of ALL_DIFFICULTIES) {
    expect(isValid(problem, difficulty), `${format(problem)} / ${debugName(difficulty)}`).toBe(
      difficulty === expected,
    );
  }
}

function assertInvalidEverywhere(problem: Problem) {
  for (const difficulty of ALL_DIFFICULTIES) {
    expect(isValid(problem, difficulty), `${format(problem)} / ${debugName(difficulty)}`).toBe(false);
  }
}

function format(problem: Problem): string {
  const symbol = problem.operation === 'addition' ? '+' : '-';
  return `${problem.lhs} ${symbol} ${problem.rhs}`;
}
