/**
 * TypeScript port of QuestionEngine (Swift).
 *
 * A round is 30 unique problems: 15 additions and 15 subtractions, alternating,
 * grouped into 3 stages of 10. Answers are in 0...100. Operands are 1...99.
 * 3 + 5 and 5 + 3 are different problems.
 *
 * The pools and validity rules match the Swift engine. Shuffle uses SplitMix64
 * and Fisher-Yates. The exact order can differ from Swift's `shuffled(using:)`
 * because Swift's `Int.random(in:)` consumes the generator differently; the
 * rules, not the sequence, are the contract.
 */

export const ROUND_SIZE = 30;
export const PROBLEMS_PER_STAGE = 10;
export const STAGE_COUNT = 3;

export const Difficulty = {
  within20NoCarry: 1,
  within20WithCarry: 2,
  twoDigitOnesNoCarry: 3,
  twoDigitWithCarry: 4,
} as const;

export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

export const ALL_DIFFICULTIES: Difficulty[] = [
  Difficulty.within20NoCarry,
  Difficulty.within20WithCarry,
  Difficulty.twoDigitOnesNoCarry,
  Difficulty.twoDigitWithCarry,
];

export function debugName(difficulty: Difficulty): string {
  switch (difficulty) {
    case Difficulty.within20NoCarry:
      return 'within20NoCarry';
    case Difficulty.within20WithCarry:
      return 'within20WithCarry';
    case Difficulty.twoDigitOnesNoCarry:
      return 'twoDigitOnesNoCarry';
    case Difficulty.twoDigitWithCarry:
      return 'twoDigitWithCarry';
  }
}

export type Operation = 'addition' | 'subtraction';

export interface Problem {
  lhs: number;
  rhs: number;
  operation: Operation;
}

export function answerOf(problem: Problem): number {
  return problem.operation === 'addition' ? problem.lhs + problem.rhs : problem.lhs - problem.rhs;
}

/** Ones-place carry for addition, or ones-place borrow for subtraction. */
export function usesCarryOrBorrow(problem: Problem): boolean {
  const leftOnes = problem.lhs % 10;
  const rightOnes = problem.rhs % 10;
  if (problem.operation === 'addition') return leftOnes + rightOnes >= 10;
  return leftOnes < rightOnes;
}

export function problemKey(problem: Problem): string {
  return `${problem.operation}:${problem.lhs}:${problem.rhs}`;
}

export function formatProblem(problem: Problem): string {
  const symbol = problem.operation === 'addition' ? '+' : '-';
  return `${problem.lhs} ${symbol} ${problem.rhs} = ${answerOf(problem)}`;
}

/**
 * 3 stars at 90% or better first-try accuracy, 2 stars at 70%, otherwise 1.
 * For a 30-problem round the cutoffs are 27 and 21. Finishing always earns at least 1 star.
 */
export function starsFor(correct: number, total = ROUND_SIZE): number {
  const safeTotal = Math.max(total, 1);
  const safeCorrect = Math.min(Math.max(correct, 0), safeTotal);
  if (safeCorrect * 10 >= safeTotal * 9) return 3;
  if (safeCorrect * 10 >= safeTotal * 7) return 2;
  return 1;
}

export function isValid(problem: Problem, difficulty: Difficulty): boolean {
  return problem.operation === 'addition'
    ? isValidAddition(problem, difficulty)
    : isValidSubtraction(problem, difficulty);
}

export function generateRound(difficulty: Difficulty, seed: number | bigint): Problem[] {
  const seedValue = typeof seed === 'bigint' ? seed : BigInt(seed);
  const generator = new SeededGenerator(seedValue);
  const source = pool(difficulty);
  const additions = source.filter((problem) => problem.operation === 'addition');
  const subtractions = source.filter((problem) => problem.operation === 'subtraction');
  shuffle(additions, generator);
  shuffle(subtractions, generator);

  const round: Problem[] = [];
  while (round.length < ROUND_SIZE) {
    const preferAddition = round.length % 2 === 0;
    if (preferAddition && additions.length > 0) {
      round.push(additions.pop()!);
    } else if (subtractions.length > 0) {
      round.push(subtractions.pop()!);
    } else if (additions.length > 0) {
      round.push(additions.pop()!);
    } else {
      break;
    }
  }

  if (round.length !== ROUND_SIZE) {
    throw new Error(`Difficulty ${debugName(difficulty)} only has ${round.length} problems.`);
  }
  return round;
}

const MASK = (1n << 64n) - 1n;

/** SplitMix64. A zero seed is remapped so the state never sticks at zero. */
export class SeededGenerator {
  private state: bigint;

  constructor(seed: bigint) {
    const masked = seed & MASK;
    this.state = masked === 0n ? 0x9e3779b97f4a7c15n : masked;
  }

  next(): bigint {
    this.state = (this.state + 0x9e3779b97f4a7c15n) & MASK;
    let mixed = this.state;
    mixed = ((mixed ^ (mixed >> 30n)) * 0xbf58476d1ce4e5b9n) & MASK;
    mixed = ((mixed ^ (mixed >> 27n)) * 0x94d049bb133111ebn) & MASK;
    return (mixed ^ (mixed >> 31n)) & MASK;
  }

  /** Inclusive upper bound. */
  nextInt(maxInclusive: number): number {
    if (maxInclusive <= 0) return 0;
    const range = BigInt(maxInclusive + 1);
    return Number(this.next() % range);
  }
}

function shuffle<T>(items: T[], generator: SeededGenerator): void {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = generator.nextInt(i);
    const swap = items[i]!;
    items[i] = items[j]!;
    items[j] = swap;
  }
}

function isValidAddition(problem: Problem, difficulty: Difficulty): boolean {
  const left = problem.lhs;
  const right = problem.rhs;
  if (left < 1 || left > 99 || right < 1 || right > 99) return false;
  const sum = left + right;
  if (sum < 0 || sum > 100) return false;
  const carry = usesCarryOrBorrow(problem);

  switch (difficulty) {
    case Difficulty.within20NoCarry:
      return left <= 20 && right <= 20 && sum <= 20 && !carry;
    case Difficulty.within20WithCarry:
      return left <= 20 && right <= 20 && sum <= 20 && carry;
    case Difficulty.twoDigitOnesNoCarry:
      return !carry && isTwoDigitPlusOnes(left, right);
    case Difficulty.twoDigitWithCarry:
      return carry && sum >= 21 && sum <= 100 && Math.max(left, right) >= 10;
  }
}

function isValidSubtraction(problem: Problem, difficulty: Difficulty): boolean {
  const left = problem.lhs;
  const right = problem.rhs;
  if (left < 1 || left > 99 || right < 1 || right > 99 || left < right) return false;
  const borrow = usesCarryOrBorrow(problem);

  switch (difficulty) {
    case Difficulty.within20NoCarry:
      return left <= 20 && !borrow;
    case Difficulty.within20WithCarry:
      return left <= 20 && borrow;
    case Difficulty.twoDigitOnesNoCarry:
      return !borrow && left >= 20 && left <= 99 && right >= 1 && right <= 9;
    case Difficulty.twoDigitWithCarry:
      return borrow && left >= 21;
  }
}

/** One side is a one-digit number and the other is a two-digit number from 20 through 99. */
function isTwoDigitPlusOnes(left: number, right: number): boolean {
  const leftIsOnes = left >= 1 && left <= 9;
  const rightIsOnes = right >= 1 && right <= 9;
  const leftIsBig = left >= 20 && left <= 99;
  const rightIsBig = right >= 20 && right <= 99;
  return (leftIsOnes && rightIsBig) || (rightIsOnes && leftIsBig);
}

const pools = new Map<Difficulty, Problem[]>();

function pool(difficulty: Difficulty): Problem[] {
  const cached = pools.get(difficulty);
  if (cached) return cached;
  const built = makePool(difficulty);
  pools.set(difficulty, built);
  return built;
}

function makePool(difficulty: Difficulty): Problem[] {
  const seen = new Set<string>();
  const problems: Problem[] = [];

  const consider = (lhs: number, rhs: number, operation: Operation) => {
    const problem: Problem = { lhs, rhs, operation };
    if (!isValid(problem, difficulty)) return;
    const key = problemKey(problem);
    if (seen.has(key)) return;
    seen.add(key);
    problems.push(problem);
  };

  switch (difficulty) {
    case Difficulty.within20NoCarry:
    case Difficulty.within20WithCarry:
      for (let lhs = 1; lhs <= 20; lhs += 1) {
        for (let rhs = 1; rhs <= 20; rhs += 1) {
          consider(lhs, rhs, 'addition');
          consider(lhs, rhs, 'subtraction');
        }
      }
      break;
    case Difficulty.twoDigitOnesNoCarry:
      for (let big = 20; big <= 99; big += 1) {
        for (let small = 1; small <= 9; small += 1) {
          consider(big, small, 'addition');
          consider(small, big, 'addition');
          consider(big, small, 'subtraction');
        }
      }
      break;
    case Difficulty.twoDigitWithCarry:
      for (let lhs = 1; lhs <= 99; lhs += 1) {
        for (let rhs = 1; rhs <= 99; rhs += 1) {
          consider(lhs, rhs, 'addition');
          consider(lhs, rhs, 'subtraction');
        }
      }
      break;
  }

  return problems;
}
