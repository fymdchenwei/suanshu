import SwiftUI
import UIKit

/// Shared candy colors. SwiftUI and the RealityKit scenes both read these values.
enum Theme {
    static let skyTop = rgb(0.43, 0.78, 0.98)
    static let skyBottom = rgb(0.82, 0.94, 1.0)
    static let grass = rgb(0.48, 0.80, 0.36)
    static let grassDeep = rgb(0.33, 0.68, 0.28)
    static let nightTop = rgb(0.33, 0.14, 0.56)
    static let nightBottom = rgb(0.62, 0.32, 0.78)
    static let cream = rgb(1.0, 0.97, 0.92)
    static let ink = rgb(0.29, 0.20, 0.13)
    static let gold = rgb(1.0, 0.76, 0.22)
    static let orange = rgb(1.0, 0.55, 0.14)
    static let orangeLip = rgb(0.86, 0.40, 0.05)
    static let coral = rgb(1.0, 0.45, 0.42)
    static let bubblePink = rgb(1.0, 0.54, 0.70)
    static let bubblePurple = rgb(0.66, 0.51, 0.98)
    static let bubbleBlue = rgb(0.36, 0.66, 0.98)
    static let bubbleOrange = rgb(1.0, 0.64, 0.30)
    static let bubbleMint = rgb(0.42, 0.84, 0.68)
    static let bubbleYellow = rgb(1.0, 0.84, 0.35)
    static let bubbleLavender = rgb(0.76, 0.64, 0.98)
    static let confirmGreen = rgb(0.40, 0.80, 0.46)
    static let confirmLip = rgb(0.24, 0.62, 0.32)
    static let deleteBlue = rgb(0.34, 0.60, 0.98)
    static let pillStar = rgb(1.0, 0.90, 0.55)
    static let pillBook = rgb(0.84, 0.95, 0.78)
    static let pillFlame = rgb(1.0, 0.80, 0.84)
    static let white = Color.white

    static func rgb(_ red: Double, _ green: Double, _ blue: Double) -> Color {
        Color(red: red, green: green, blue: blue)
    }

    static func uiColor(_ red: Double, _ green: Double, _ blue: Double) -> UIColor {
        UIColor(red: red, green: green, blue: blue, alpha: 1)
    }
}

struct PuffyButtonStyle: ButtonStyle {
    var top: Color
    var bottom: Color
    var lip: Color

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .foregroundStyle(.white)
            .shadow(color: .black.opacity(0.12), radius: 0, y: 1)
            .background(
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .fill(LinearGradient(colors: [top, bottom], startPoint: .top, endPoint: .bottom))
            )
            .background(
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .fill(lip)
                    .offset(y: configuration.isPressed ? 1 : 5)
            )
            .offset(y: configuration.isPressed ? 4 : 0)
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .animation(.spring(response: 0.22, dampingFraction: 0.7), value: configuration.isPressed)
    }
}

struct StatusPill<Content: View>: View {
    var fill: Color
    @ViewBuilder var content: () -> Content

    var body: some View {
        content()
            .padding(.horizontal, 12)
            .padding(.vertical, 7)
            .background(Capsule().fill(fill))
            .overlay(Capsule().stroke(Color.white.opacity(0.85), lineWidth: 2))
            .shadow(color: .black.opacity(0.08), radius: 3, y: 2)
    }
}
