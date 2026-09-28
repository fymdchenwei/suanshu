import Foundation

/// Four practice difficulties for a first grader.
///
/// Raw values are stable and stored in SwiftData. Do not renumber them.
public enum Difficulty: Int, Codable, Hashable, Sendable, CaseIterable {
    /// Addition and subtraction within 20 with no carrying or borrowing.
    case within20NoCarry = 1
    /// Addition and subtraction within 20 that carry or borrow.
    case within20WithCarry = 2
    /// A two-digit number (20...99) plus or minus a one-digit number, no carry or borrow.
    case twoDigitOnesNoCarry = 3
    /// Within 100, with carrying or borrowing. Addition results are at least 21 and use a two-digit operand. Subtraction starts from 21 or more.
    case twoDigitWithCarry = 4

    public var debugName: String {
        switch self {
        case .within20NoCarry: return "within20NoCarry"
        case .within20WithCarry: return "within20WithCarry"
        case .twoDigitOnesNoCarry: return "twoDigitOnesNoCarry"
        case .twoDigitWithCarry: return "twoDigitWithCarry"
        }
    }
}
