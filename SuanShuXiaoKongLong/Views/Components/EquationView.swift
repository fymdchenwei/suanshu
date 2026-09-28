import QuestionEngine
import SwiftUI

struct EquationView: View {
    var problem: Problem
    var typed: String
    var wrongToken: Int

    var body: some View {
        HStack(spacing: 6) {
            ForEach(Array(tokens.enumerated()), id: \.offset) { _, token in
                tokenView(token)
            }
        }
        .modifier(ShakeEffect(shakes: CGFloat(wrongToken) * 3))
        .animation(.linear(duration: 0.36), value: wrongToken)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(accessibilityText)
    }

    private var tokens: [EquationToken] {
        var items: [EquationToken] = []
        for character in String(problem.lhs) {
            items.append(.digit(character, paletteIndex: items.count))
        }
        items.append(.symbol(problem.operation == .addition ? "+" : "−", fill: Theme.confirmGreen))
        let rhsStart = items.count
        for character in String(problem.rhs) {
            items.append(.digit(character, paletteIndex: items.count - rhsStart + 2))
        }
        items.append(.symbol("=", fill: Theme.bubblePurple))
        if typed.isEmpty {
            items.append(.question)
        } else {
            for character in typed {
                items.append(.digit(character, paletteIndex: 5))
            }
        }
        return items
    }

    private var accessibilityText: String {
        let symbol = problem.operation == .addition ? "加" : "减"
        let typedText = typed.isEmpty ? "还没填写" : typed
        return "\(problem.lhs) \(symbol) \(problem.rhs) 等于 \(typedText)"
    }

    @ViewBuilder
    private func tokenView(_ token: EquationToken) -> some View {
        switch token {
        case .digit(let character, let paletteIndex):
            BlockFace(text: String(character), fill: digitColor(paletteIndex), width: 46)
        case .symbol(let text, let fill):
            BlockFace(text: text, fill: fill, width: 42)
        case .question:
            ZStack {
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [Color.white, Theme.gold.opacity(0.85)],
                            center: .center,
                            startRadius: 2,
                            endRadius: 28
                        )
                    )
                    .overlay(Circle().stroke(Color.white, lineWidth: 3))
                    .shadow(color: Theme.gold.opacity(0.8), radius: 8)
                Text("?")
                    .font(.system(size: 30, weight: .black, design: .rounded))
                    .foregroundStyle(Theme.ink.opacity(0.75))
            }
            .frame(width: 54, height: 54)
        }
    }

    private func digitColor(_ index: Int) -> Color {
        let colors = [
            Theme.bubblePink,
            Theme.bubblePurple,
            Theme.bubbleBlue,
            Theme.bubbleOrange,
            Theme.bubbleMint,
            Theme.bubbleYellow
        ]
        return colors[abs(index) % colors.count]
    }
}

private enum EquationToken {
    case digit(Character, paletteIndex: Int)
    case symbol(String, fill: Color)
    case question
}

struct BlockFace: View {
    var text: String
    var fill: Color
    var width: CGFloat

    var body: some View {
        Text(text)
            .font(.system(size: 32, weight: .black, design: .rounded))
            .foregroundStyle(.white)
            .shadow(color: .black.opacity(0.15), radius: 0, y: 2)
            .frame(width: width, height: 54)
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [fill.opacity(0.95), fill],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
            )
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(fill.opacity(0.55))
                    .offset(y: 5)
            )
    }
}

struct ShakeEffect: GeometryEffect {
    var shakes: CGFloat

    var animatableData: CGFloat {
        get { shakes }
        set { shakes = newValue }
    }

    func effectValue(size: CGSize) -> ProjectionTransform {
        let translation = 7 * sin(shakes * .pi * 2)
        return ProjectionTransform(CGAffineTransform(translationX: translation, y: 0))
    }
}
