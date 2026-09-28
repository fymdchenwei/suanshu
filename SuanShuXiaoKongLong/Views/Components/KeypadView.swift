import SwiftUI

struct KeypadView: View {
    var onDigit: (Int) -> Void
    var onDelete: () -> Void
    var onConfirm: () -> Void
    var confirmEnabled: Bool

    private let rows: [[Key]] = [
        [.digit(1), .digit(2), .digit(3)],
        [.digit(4), .digit(5), .digit(6)],
        [.digit(7), .digit(8), .digit(9)],
        [.delete, .digit(0), .confirm]
    ]

    var body: some View {
        VStack(spacing: 6) {
            ForEach(rows.indices, id: \.self) { row in
                HStack(spacing: 6) {
                    ForEach(rows[row], id: \.self) { key in
                        keyButton(key)
                    }
                }
            }
        }
    }

    private func keyButton(_ key: Key) -> some View {
        Button {
            switch key {
            case .digit(let value):
                onDigit(value)
            case .delete:
                onDelete()
            case .confirm:
                onConfirm()
            }
        } label: {
            keyLabel(key)
                .frame(maxWidth: .infinity)
                .frame(height: 46)
        }
        .buttonStyle(PuffyButtonStyle(top: key.top, bottom: key.bottom, lip: key.lip))
        .disabled(key == .confirm && !confirmEnabled)
        .opacity(key == .confirm && !confirmEnabled ? 0.55 : 1)
        .accessibilityLabel(key.accessibilityLabel)
    }

    @ViewBuilder
    private func keyLabel(_ key: Key) -> some View {
        switch key {
        case .digit(let value):
            Text("\(value)")
                .font(.system(size: 26, weight: .black, design: .rounded))
        case .delete:
            Image(systemName: "arrow.left")
                .font(.system(size: 22, weight: .black))
        case .confirm:
            Image(systemName: "checkmark")
                .font(.system(size: 22, weight: .black))
        }
    }
}

private enum Key: Hashable {
    case digit(Int)
    case delete
    case confirm

    var accessibilityLabel: String {
        switch self {
        case .digit(let value): return "\(value)"
        case .delete: return "删除"
        case .confirm: return "确定"
        }
    }

    var top: Color {
        switch self {
        case .digit(1): return Theme.bubblePink
        case .digit(2): return Theme.bubbleYellow
        case .digit(3): return Theme.bubblePurple
        case .digit(4): return Theme.bubbleMint
        case .digit(5): return Theme.bubbleBlue
        case .digit(6): return Theme.bubbleOrange
        case .digit(7): return Theme.bubbleLavender
        case .digit(8): return Theme.bubblePink
        case .digit(9): return Theme.bubbleYellow
        case .digit(0): return Theme.bubblePurple
        case .digit(_):
            return Theme.bubbleBlue
        case .delete: return Theme.deleteBlue
        case .confirm: return Theme.confirmGreen
        }
    }

    var bottom: Color { top.opacity(0.92) }

    var lip: Color {
        switch self {
        case .confirm: return Theme.confirmLip
        case .delete: return Color(red: 0.18, green: 0.40, blue: 0.78)
        default: return Color.black.opacity(0.18)
        }
    }
}
