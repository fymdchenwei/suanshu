import Foundation

/// Pure generator for one offline practice round.
///
/// A round is 30 unique problems: 15 additions and 15 subtractions, alternating,
/// grouped by the caller into 3 stages of 10. Every answer is in 0...100.
/// Operands are positive and at most two digits. The same ordered problem is
/// never repeated inside a round.
///
/// Curriculum boundaries:
/// - Level 1 keeps both operands and the result inside 0...20 and never carries or borrows.
/// - Level 2 is the same range but every problem carries or borrows (for example 8 + 7, 13 - 5).
/// - Level 3 is a two-digit number from 20...99 plus or minus a one-digit number, with no carry
///   or borrow (for example 40 + 7, 56 - 6).
/// - Level 4 carries or borrows and stays within 100. Addition sums to at least 21 and includes a
///   two-digit operand (so 8 + 7 stays in level 2, while 38 + 47 and 19 + 9 are level 4).
///   Subtraction starts from 21 or more. Two-digit plus two-digit with no carry (23 + 45) is not in v1.
public enum QuestionEngine {
    public static let roundSize = 30
    public static let problemsPerStage = 10
    public static let stageCount = 3

    /// 3 stars at 90% or better first-try accuracy, 2 stars at 70%, otherwise 1 star.
    /// For a 30-problem round those cutoffs are 27 and 21. Finishing always earns at least 1 star.
    public static func stars(forFirstTryCorrect correct: Int, total: Int = roundSize) -> Int {
        let safeTotal = max(total, 1)
        let safeCorrect = min(max(correct, 0), safeTotal)
        if safeCorrect * 10 >= safeTotal * 9 {
            return 3
        }
        if safeCorrect * 10 >= safeTotal * 7 {
            return 2
        }
        return 1
    }

    public static func isValid(_ problem: Problem, for difficulty: Difficulty) -> Bool {
        switch problem.operation {
        case .addition:
            return isValidAddition(problem, for: difficulty)
        case .subtraction:
            return isValidSubtraction(problem, for: difficulty)
        }
    }

    /// Deterministic for a given difficulty and seed. Pools are built once and shuffled.
    public static func generateRound(difficulty: Difficulty, seed: UInt64) -> [Problem] {
        var generator = SeededGenerator(seed: seed)
        var additions = pool(for: difficulty)
            .filter { $0.operation == .addition }
            .shuffled(using: &generator)
        var subtractions = pool(for: difficulty)
            .filter { $0.operation == .subtraction }
            .shuffled(using: &generator)

        var round: [Problem] = []
        round.reserveCapacity(roundSize)
        while round.count < roundSize {
            let preferAddition = round.count.isMultiple(of: 2)
            if preferAddition, !additions.isEmpty {
                round.append(additions.removeLast())
            } else if !subtractions.isEmpty {
                round.append(subtractions.removeLast())
            } else if !additions.isEmpty {
                round.append(additions.removeLast())
            } else {
                break
            }
        }

        precondition(
            round.count == roundSize,
            "Difficulty \(difficulty.debugName) only has \(round.count) problems."
        )
        return round
    }

    // MARK: - Rules

    private static func isValidAddition(_ problem: Problem, for difficulty: Difficulty) -> Bool {
        let left = problem.lhs
        let right = problem.rhs
        guard (1...99).contains(left), (1...99).contains(right) else { return false }
        let sum = left + right
        guard (0...100).contains(sum) else { return false }
        let carry = problem.usesCarryOrBorrow

        switch difficulty {
        case .within20NoCarry:
            return (1...20).contains(left) && (1...20).contains(right) && sum <= 20 && !carry
        case .within20WithCarry:
            return (1...20).contains(left) && (1...20).contains(right) && sum <= 20 && carry
        case .twoDigitOnesNoCarry:
            return !carry && isTwoDigitPlusOnes(left, right)
        case .twoDigitWithCarry:
            return carry && (21...100).contains(sum) && max(left, right) >= 10
        }
    }

    private static func isValidSubtraction(_ problem: Problem, for difficulty: Difficulty) -> Bool {
        let left = problem.lhs
        let right = problem.rhs
        guard (1...99).contains(left), (1...99).contains(right), left >= right else { return false }
        let borrow = problem.usesCarryOrBorrow

        switch difficulty {
        case .within20NoCarry:
            return left <= 20 && !borrow
        case .within20WithCarry:
            return left <= 20 && borrow
        case .twoDigitOnesNoCarry:
            return !borrow && (20...99).contains(left) && (1...9).contains(right)
        case .twoDigitWithCarry:
            return borrow && left >= 21
        }
    }

    /// One side is a one-digit number and the other is a two-digit number from 20 through 99.
    private static func isTwoDigitPlusOnes(_ left: Int, _ right: Int) -> Bool {
        let leftIsOnes = (1...9).contains(left)
        let rightIsOnes = (1...9).contains(right)
        let leftIsBig = (20...99).contains(left)
        let rightIsBig = (20...99).contains(right)
        return (leftIsOnes && rightIsBig) || (rightIsOnes && leftIsBig)
    }

    // MARK: - Pools

    private static let pools: [Difficulty: [Problem]] = {
        var built: [Difficulty: [Problem]] = [:]
        for difficulty in Difficulty.allCases {
            built[difficulty] = makePool(for: difficulty)
        }
        return built
    }()

    private static func pool(for difficulty: Difficulty) -> [Problem] {
        pools[difficulty] ?? []
    }

    private static func makePool(for difficulty: Difficulty) -> [Problem] {
        var seen: Set<Problem> = []
        var problems: [Problem] = []

        func consider(_ lhs: Int, _ rhs: Int, _ operation: Operation) {
            let problem = Problem(lhs: lhs, rhs: rhs, operation: operation)
            guard isValid(problem, for: difficulty), seen.insert(problem).inserted else { return }
            problems.append(problem)
        }

        switch difficulty {
        case .within20NoCarry, .within20WithCarry:
            for lhs in 1...20 {
                for rhs in 1...20 {
                    consider(lhs, rhs, .addition)
                    consider(lhs, rhs, .subtraction)
                }
            }
        case .twoDigitOnesNoCarry:
            for big in 20...99 {
                for small in 1...9 {
                    consider(big, small, .addition)
                    consider(small, big, .addition)
                    consider(big, small, .subtraction)
                }
            }
        case .twoDigitWithCarry:
            for lhs in 1...99 {
                for rhs in 1...99 {
                    consider(lhs, rhs, .addition)
                    consider(lhs, rhs, .subtraction)
                }
            }
        }

        return problems
    }
}

/// SplitMix64. A zero seed is remapped so the state never sticks at zero.
struct SeededGenerator: RandomNumberGenerator {
    private var state: UInt64

    init(seed: UInt64) {
        state = seed == 0 ? 0x9E37_79B9_7F4A_7C15 : seed
    }

    mutating func next() -> UInt64 {
        state &+= 0x9E37_79B9_7F4A_7C15
        var mixed = state
        mixed = (mixed ^ (mixed >> 30)) &* 0xBF58_476D_1CE4_E5B9
        mixed = (mixed ^ (mixed >> 27)) &* 0x94D0_49BB_1331_11EB
        return mixed ^ (mixed >> 31)
    }
}
