import Foundation

public enum Operation: Codable, Hashable, Sendable, CaseIterable {
    case addition
    case subtraction
}

/// One arithmetic problem. Identity is the ordered triple (lhs, operation, rhs),
/// so 3 + 5 and 5 + 3 are different problems.
public struct Problem: Codable, Hashable, Sendable, CustomStringConvertible {
    public let lhs: Int
    public let rhs: Int
    public let operation: Operation

    public init(lhs: Int, rhs: Int, operation: Operation) {
        self.lhs = lhs
        self.rhs = rhs
        self.operation = operation
    }

    public var answer: Int {
        switch operation {
        case .addition:
            return lhs + rhs
        case .subtraction:
            return lhs - rhs
        }
    }

    /// Ones-place carry for addition, or ones-place borrow for subtraction.
    ///
    /// Only meaningful for non-negative operands. `QuestionEngine.isValid` rejects negatives first.
    public var usesCarryOrBorrow: Bool {
        let leftOnes = lhs % 10
        let rightOnes = rhs % 10
        switch operation {
        case .addition:
            return leftOnes + rightOnes >= 10
        case .subtraction:
            return leftOnes < rightOnes
        }
    }

    public var description: String {
        let symbol = operation == .addition ? "+" : "-"
        return "\(lhs) \(symbol) \(rhs) = \(answer)"
    }
}
