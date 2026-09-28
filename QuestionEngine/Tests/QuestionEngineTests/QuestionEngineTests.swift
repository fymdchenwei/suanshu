import XCTest
import QuestionEngine

final class QuestionEngineTests: XCTestCase {
    private let seeds: [UInt64] = [0, 1, 42, 9_999, UInt64.max]

    func testRoundShapeForEveryDifficultyAndSeed() {
        for difficulty in Difficulty.allCases {
            for seed in seeds {
                assertRoundRules(difficulty: difficulty, seed: seed)
            }
        }
    }

    func testSameSeedIsDeterministic() {
        for difficulty in Difficulty.allCases {
            let first = QuestionEngine.generateRound(difficulty: difficulty, seed: 123_456_789)
            let second = QuestionEngine.generateRound(difficulty: difficulty, seed: 123_456_789)
            XCTAssertEqual(first, second)
        }
    }

    func testDifferentSeedsChangeTheRound() {
        for difficulty in Difficulty.allCases {
            let first = QuestionEngine.generateRound(difficulty: difficulty, seed: 1)
            let second = QuestionEngine.generateRound(difficulty: difficulty, seed: 2)
            XCTAssertNotEqual(first, second, difficulty.debugName)
        }
    }

    func testPromptExamplesAndBoundaries() {
        let fortyPlusSeven = Problem(lhs: 40, rhs: 7, operation: .addition)
        XCTAssertEqual(fortyPlusSeven.answer, 47)
        XCTAssertFalse(fortyPlusSeven.usesCarryOrBorrow)
        XCTAssertTrue(QuestionEngine.isValid(fortyPlusSeven, for: .twoDigitOnesNoCarry))
        assertValidOnly(fortyPlusSeven, for: .twoDigitOnesNoCarry)

        let fiftySixMinusSix = Problem(lhs: 56, rhs: 6, operation: .subtraction)
        XCTAssertEqual(fiftySixMinusSix.answer, 50)
        XCTAssertFalse(fiftySixMinusSix.usesCarryOrBorrow)
        assertValidOnly(fiftySixMinusSix, for: .twoDigitOnesNoCarry)

        let fiftySixMinusSeven = Problem(lhs: 56, rhs: 7, operation: .subtraction)
        XCTAssertEqual(fiftySixMinusSeven.answer, 49)
        XCTAssertTrue(fiftySixMinusSeven.usesCarryOrBorrow)
        assertValidOnly(fiftySixMinusSeven, for: .twoDigitWithCarry)

        let mockup = Problem(lhs: 38, rhs: 47, operation: .addition)
        XCTAssertEqual(mockup.answer, 85)
        XCTAssertTrue(mockup.usesCarryOrBorrow)
        assertValidOnly(mockup, for: .twoDigitWithCarry)

        let easy = Problem(lhs: 12, rhs: 3, operation: .addition)
        XCTAssertEqual(easy.answer, 15)
        XCTAssertFalse(easy.usesCarryOrBorrow)
        assertValidOnly(easy, for: .within20NoCarry)

        let carryWithin20 = Problem(lhs: 8, rhs: 7, operation: .addition)
        XCTAssertEqual(carryWithin20.answer, 15)
        XCTAssertTrue(carryWithin20.usesCarryOrBorrow)
        assertValidOnly(carryWithin20, for: .within20WithCarry)

        let borrowWithin20 = Problem(lhs: 13, rhs: 5, operation: .subtraction)
        XCTAssertTrue(borrowWithin20.usesCarryOrBorrow)
        assertValidOnly(borrowWithin20, for: .within20WithCarry)

        let tensBorrow = Problem(lhs: 20, rhs: 6, operation: .subtraction)
        XCTAssertTrue(tensBorrow.usesCarryOrBorrow)
        assertValidOnly(tensBorrow, for: .within20WithCarry)

        let resultZero = Problem(lhs: 7, rhs: 7, operation: .subtraction)
        XCTAssertEqual(resultZero.answer, 0)
        XCTAssertFalse(resultZero.usesCarryOrBorrow)
        assertValidOnly(resultZero, for: .within20NoCarry)

        let answerOneHundred = Problem(lhs: 45, rhs: 55, operation: .addition)
        XCTAssertEqual(answerOneHundred.answer, 100)
        XCTAssertTrue(answerOneHundred.usesCarryOrBorrow)
        assertValidOnly(answerOneHundred, for: .twoDigitWithCarry)

        let tooBig = Problem(lhs: 80, rhs: 30, operation: .addition)
        XCTAssertEqual(tooBig.answer, 110)
        assertInvalidEverywhere(tooBig)

        let negative = Problem(lhs: 4, rhs: 9, operation: .subtraction)
        XCTAssertLessThan(negative.answer, 0)
        assertInvalidEverywhere(negative)

        let zeroOperand = Problem(lhs: 15, rhs: 0, operation: .addition)
        assertInvalidEverywhere(zeroOperand)

        let noCarryTwoDigit = Problem(lhs: 23, rhs: 45, operation: .addition)
        XCTAssertEqual(noCarryTwoDigit.answer, 68)
        XCTAssertFalse(noCarryTwoDigit.usesCarryOrBorrow)
        assertInvalidEverywhere(noCarryTwoDigit)

        let reversedAddition = Problem(lhs: 7, rhs: 40, operation: .addition)
        assertValidOnly(reversedAddition, for: .twoDigitOnesNoCarry)
        XCTAssertNotEqual(reversedAddition, fortyPlusSeven)

        let level2DoesNotLeakIntoLevel4 = Problem(lhs: 15, rhs: 5, operation: .addition)
        XCTAssertEqual(level2DoesNotLeakIntoLevel4.answer, 20)
        assertValidOnly(level2DoesNotLeakIntoLevel4, for: .within20WithCarry)

        let justOverTwenty = Problem(lhs: 19, rhs: 9, operation: .addition)
        XCTAssertEqual(justOverTwenty.answer, 28)
        assertValidOnly(justOverTwenty, for: .twoDigitWithCarry)

        let twoDigitPlusOneWithCarry = Problem(lhs: 28, rhs: 5, operation: .addition)
        XCTAssertEqual(twoDigitPlusOneWithCarry.answer, 33)
        assertValidOnly(twoDigitPlusOneWithCarry, for: .twoDigitWithCarry)
    }

    func testStarThresholds() {
        XCTAssertEqual(QuestionEngine.roundSize, 30)
        XCTAssertEqual(QuestionEngine.problemsPerStage * QuestionEngine.stageCount, QuestionEngine.roundSize)

        XCTAssertEqual(QuestionEngine.stars(forFirstTryCorrect: 30), 3)
        XCTAssertEqual(QuestionEngine.stars(forFirstTryCorrect: 27), 3)
        XCTAssertEqual(QuestionEngine.stars(forFirstTryCorrect: 26), 2)
        XCTAssertEqual(QuestionEngine.stars(forFirstTryCorrect: 21), 2)
        XCTAssertEqual(QuestionEngine.stars(forFirstTryCorrect: 20), 1)
        XCTAssertEqual(QuestionEngine.stars(forFirstTryCorrect: 0), 1)
        XCTAssertEqual(QuestionEngine.stars(forFirstTryCorrect: -4), 1)
        XCTAssertEqual(QuestionEngine.stars(forFirstTryCorrect: 500), 3)

        XCTAssertEqual(QuestionEngine.stars(forFirstTryCorrect: 9, total: 10), 3)
        XCTAssertEqual(QuestionEngine.stars(forFirstTryCorrect: 7, total: 10), 2)
        XCTAssertEqual(QuestionEngine.stars(forFirstTryCorrect: 6, total: 10), 1)
        XCTAssertEqual(QuestionEngine.stars(forFirstTryCorrect: 0, total: 0), 1)
    }

    func testCarryAndBorrowFlags() {
        XCTAssertFalse(Problem(lhs: 40, rhs: 7, operation: .addition).usesCarryOrBorrow)
        XCTAssertTrue(Problem(lhs: 38, rhs: 47, operation: .addition).usesCarryOrBorrow)
        XCTAssertFalse(Problem(lhs: 56, rhs: 6, operation: .subtraction).usesCarryOrBorrow)
        XCTAssertTrue(Problem(lhs: 50, rhs: 6, operation: .subtraction).usesCarryOrBorrow)
        XCTAssertFalse(Problem(lhs: 30, rhs: 10, operation: .subtraction).usesCarryOrBorrow)
    }

    private func assertRoundRules(
        difficulty: Difficulty,
        seed: UInt64,
        file: StaticString = #filePath,
        line: UInt = #line
    ) {
        let round = QuestionEngine.generateRound(difficulty: difficulty, seed: seed)
        XCTAssertEqual(round.count, QuestionEngine.roundSize, "\(difficulty.debugName) seed \(seed)", file: file, line: line)
        XCTAssertEqual(Set(round).count, round.count, "duplicates in \(difficulty.debugName)", file: file, line: line)

        var additions = 0
        var subtractions = 0
        for (offset, problem) in round.enumerated() {
            XCTAssertTrue(
                QuestionEngine.isValid(problem, for: difficulty),
                "\(problem) is not valid for \(difficulty.debugName)",
                file: file,
                line: line
            )
            XCTAssertGreaterThan(problem.lhs, 0, file: file, line: line)
            XCTAssertGreaterThan(problem.rhs, 0, file: file, line: line)
            XCTAssertGreaterThanOrEqual(problem.answer, 0, problem.description, file: file, line: line)
            XCTAssertLessThanOrEqual(problem.answer, 100, problem.description, file: file, line: line)
            XCTAssertLessThanOrEqual(problem.lhs, 99, file: file, line: line)
            XCTAssertLessThanOrEqual(problem.rhs, 99, file: file, line: line)

            let matches = Difficulty.allCases.filter { QuestionEngine.isValid(problem, for: $0) }
            XCTAssertEqual(matches, [difficulty], problem.description, file: file, line: line)

            switch problem.operation {
            case .addition:
                additions += 1
                XCTAssertEqual(problem.answer, problem.lhs + problem.rhs, file: file, line: line)
                XCTAssertTrue(offset.isMultiple(of: 2), "\(problem) at \(offset)", file: file, line: line)
            case .subtraction:
                subtractions += 1
                XCTAssertEqual(problem.answer, problem.lhs - problem.rhs, file: file, line: line)
                XCTAssertGreaterThanOrEqual(problem.lhs, problem.rhs, file: file, line: line)
                XCTAssertFalse(offset.isMultiple(of: 2), "\(problem) at \(offset)", file: file, line: line)
            }

            switch difficulty {
            case .within20NoCarry:
                XCTAssertLessThanOrEqual(problem.answer, 20, file: file, line: line)
                XCTAssertFalse(problem.usesCarryOrBorrow, file: file, line: line)
            case .within20WithCarry:
                XCTAssertLessThanOrEqual(max(problem.lhs, problem.answer), 20, file: file, line: line)
                XCTAssertTrue(problem.usesCarryOrBorrow, file: file, line: line)
            case .twoDigitOnesNoCarry:
                XCTAssertFalse(problem.usesCarryOrBorrow, file: file, line: line)
                if problem.operation == .subtraction {
                    XCTAssertTrue((20...99).contains(problem.lhs), file: file, line: line)
                    XCTAssertTrue((1...9).contains(problem.rhs), file: file, line: line)
                }
            case .twoDigitWithCarry:
                XCTAssertTrue(problem.usesCarryOrBorrow, file: file, line: line)
            }
        }

        XCTAssertEqual(additions, 15, difficulty.debugName, file: file, line: line)
        XCTAssertEqual(subtractions, 15, difficulty.debugName, file: file, line: line)
    }

    private func assertValidOnly(
        _ problem: Problem,
        for expected: Difficulty,
        file: StaticString = #filePath,
        line: UInt = #line
    ) {
        for difficulty in Difficulty.allCases {
            XCTAssertEqual(
                QuestionEngine.isValid(problem, for: difficulty),
                difficulty == expected,
                "\(problem) / \(difficulty.debugName)",
                file: file,
                line: line
            )
        }
    }

    private func assertInvalidEverywhere(
        _ problem: Problem,
        file: StaticString = #filePath,
        line: UInt = #line
    ) {
        for difficulty in Difficulty.allCases {
            XCTAssertFalse(
                QuestionEngine.isValid(problem, for: difficulty),
                "\(problem) / \(difficulty.debugName)",
                file: file,
                line: line
            )
        }
    }
}
