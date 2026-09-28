import SwiftUI

enum SkyStyle {
    case day
    case meadow
    case night
}

struct SkyBackground: View {
    var style: SkyStyle

    var body: some View {
        ZStack {
            LinearGradient(colors: gradient, startPoint: .top, endPoint: .bottom)
            switch style {
            case .day:
                dayDecor
            case .meadow:
                meadowDecor
            case .night:
                nightDecor
            }
        }
        .ignoresSafeArea()
        .allowsHitTesting(false)
    }

    private var gradient: [Color] {
        switch style {
        case .day:
            return [Theme.skyTop, Theme.skyBottom]
        case .meadow:
            return [Theme.skyTop, Color(red: 0.72, green: 0.90, blue: 0.55)]
        case .night:
            return [Theme.nightTop, Theme.nightBottom]
        }
    }

    private var dayDecor: some View {
        ZStack {
            RainbowShape()
                .frame(width: 210, height: 110)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                .padding(.leading, 36)
                .padding(.top, 28)
            CloudShape()
                .frame(width: 90, height: 48)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
                .padding(.top, 18)
                .offset(x: 40)
            CloudShape()
                .frame(width: 70, height: 38)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
                .padding(.top, 46)
                .padding(.trailing, 80)
        }
    }

    private var meadowDecor: some View {
        ZStack {
            CloudShape()
                .frame(width: 78, height: 40)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                .padding(.leading, 24)
                .padding(.top, 8)
            CloudShape()
                .frame(width: 64, height: 34)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
                .padding(.trailing, 30)
                .padding(.top, 16)
            Ellipse()
                .fill(Theme.grass)
                .frame(height: 220)
                .offset(y: 150)
            Ellipse()
                .fill(Theme.grassDeep.opacity(0.35))
                .frame(width: 280, height: 70)
                .offset(x: -180, y: 90)
            HStack(spacing: 28) {
                Text("🌸")
                Text("🌼")
                Text("🌷")
            }
            .font(.system(size: 16))
            .frame(maxHeight: .infinity, alignment: .bottom)
            .padding(.bottom, 8)
            .opacity(0.8)
        }
    }

    private var nightDecor: some View {
        ZStack {
            ForEach(0..<18, id: \.self) { index in
                Circle()
                    .fill(Color.white.opacity(index.isMultiple(of: 3) ? 0.9 : 0.55))
                    .frame(width: index.isMultiple(of: 4) ? 4 : 2.5, height: index.isMultiple(of: 4) ? 4 : 2.5)
                    .position(x: starX(index), y: starY(index))
            }
        }
    }

    private func starX(_ index: Int) -> CGFloat {
        CGFloat(40 + (index * 97) % 780)
    }

    private func starY(_ index: Int) -> CGFloat {
        CGFloat(16 + (index * 53) % 180)
    }
}

struct RainbowShape: View {
    private let colors: [Color] = [
        Color(red: 1.0, green: 0.45, blue: 0.48),
        Color(red: 1.0, green: 0.72, blue: 0.30),
        Color(red: 1.0, green: 0.90, blue: 0.40),
        Color(red: 0.45, green: 0.82, blue: 0.48),
        Color(red: 0.40, green: 0.66, blue: 0.98)
    ]

    var body: some View {
        ZStack {
            ForEach(0..<colors.count, id: \.self) { index in
                Circle()
                    .trim(from: 0.50, to: 1.0)
                    .stroke(colors[index], style: StrokeStyle(lineWidth: 7, lineCap: .round))
                    .padding(CGFloat(index) * 7)
            }
        }
    }
}

struct CloudShape: View {
    var body: some View {
        ZStack {
            Circle().frame(width: 28, height: 28).offset(x: -18, y: 4)
            Circle().frame(width: 40, height: 40).offset(y: -2)
            Circle().frame(width: 26, height: 26).offset(x: 20, y: 6)
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .frame(width: 48, height: 18)
                .offset(y: 12)
        }
        .foregroundStyle(Color.white.opacity(0.94))
        .shadow(color: .white.opacity(0.4), radius: 2, y: 1)
    }
}
