import SwiftUI

struct SparkleBurst: View {
    var token: Int
    @State private var expanded = false

    var body: some View {
        ZStack {
            ForEach(0..<12, id: \.self) { index in
                let angle = Double(index) / 12 * Double.pi * 2
                Image(systemName: index.isMultiple(of: 2) ? "sparkle" : "star.fill")
                    .font(.system(size: index.isMultiple(of: 3) ? 18 : 12, weight: .bold))
                    .foregroundStyle(index.isMultiple(of: 2) ? Theme.gold : Theme.bubblePink)
                    .offset(
                        x: expanded ? CGFloat(cos(angle)) * 52 : 0,
                        y: expanded ? CGFloat(sin(angle)) * 32 : 0
                    )
                    .scaleEffect(expanded ? 1.05 : 0.2)
                    .opacity(expanded ? 0 : 1)
            }
        }
        .allowsHitTesting(false)
        .onChange(of: token) { _, newValue in
            guard newValue > 0 else { return }
            expanded = false
            withAnimation(.easeOut(duration: 0.55)) {
                expanded = true
            }
        }
    }
}

struct StreakBanner: View {
    var text: String

    var body: some View {
        Text(text)
            .font(.system(size: 26, weight: .heavy, design: .rounded))
            .foregroundStyle(Theme.ink)
            .padding(.horizontal, 22)
            .padding(.vertical, 10)
            .background(
                Capsule().fill(Theme.gold)
            )
            .overlay(Capsule().stroke(Color.white, lineWidth: 3))
            .shadow(color: Theme.orange.opacity(0.35), radius: 8, y: 4)
            .transition(.scale.combined(with: .opacity))
    }
}

struct ChestOverlay: View {
    var stage: Int
    var sticker: Sticker?
    var isFinal: Bool
    var onContinue: () -> Void

    @State private var popped = false

    var body: some View {
        ZStack {
            Color.black.opacity(0.28).ignoresSafeArea()
            ConfettiView(pieceCount: 28)
            VStack(spacing: 10) {
                Text("第 \(stage) 关完成！")
                    .font(.system(size: 28, weight: .heavy, design: .rounded))
                    .foregroundStyle(Theme.ink)
                stickerFace
                    .scaleEffect(popped ? 1 : 0.2)
                    .rotationEffect(.degrees(popped ? 0 : -12))
                Text(sticker?.name ?? Copy.stickersComplete)
                    .font(.system(size: 22, weight: .heavy, design: .rounded))
                    .foregroundStyle(Theme.ink)
                Text(sticker?.phrase ?? Copy.stickersCompleteDetail)
                    .font(.system(size: 15, weight: .semibold, design: .rounded))
                    .foregroundStyle(Theme.ink.opacity(0.7))
                    .multilineTextAlignment(.center)
                Button(action: onContinue) {
                    Text(isFinal ? Copy.seeScore : Copy.continuePlaying)
                        .font(.system(size: 22, weight: .heavy, design: .rounded))
                        .frame(width: 220, height: 50)
                }
                .buttonStyle(PuffyButtonStyle(top: Theme.gold, bottom: Theme.orange, lip: Theme.orangeLip))
                .padding(.top, 4)
            }
            .padding(.horizontal, 28)
            .padding(.vertical, 18)
            .background(
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .fill(Theme.cream)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .stroke(Color.white, lineWidth: 4)
            )
            .shadow(color: .black.opacity(0.18), radius: 16, y: 8)
            .padding(.horizontal, 40)
        }
        .onAppear {
            withAnimation(.spring(response: 0.45, dampingFraction: 0.62)) {
                popped = true
            }
        }
    }

    @ViewBuilder
    private var stickerFace: some View {
        if let sticker {
            ZStack {
                Circle()
                    .fill(sticker.color)
                    .frame(width: 96, height: 96)
                    .shadow(color: sticker.color.opacity(0.6), radius: 8)
                Text(sticker.emoji)
                    .font(.system(size: 52))
            }
            .accessibilityLabel(sticker.name)
        } else {
            Text("💖")
                .font(.system(size: 58))
        }
    }
}

struct ConfettiView: View {
    var pieceCount: Int = 36

    private let colors: [Color] = [
        Theme.bubblePink, Theme.gold, Theme.bubbleBlue, Theme.bubbleMint,
        Theme.bubbleOrange, Theme.bubblePurple, Theme.confirmGreen
    ]

    var body: some View {
        TimelineView(.animation(minimumInterval: 1.0 / 30.0)) { timeline in
            Canvas { context, size in
                let time = timeline.date.timeIntervalSinceReferenceDate
                for index in 0..<pieceCount {
                    let seed = Double(index)
                    let drift = sin(time * 1.4 + seed) * 16
                    let speed = 36 + Double(index % 5) * 18
                    let loop = size.height + 30
                    let y = (time * speed + seed * 47).truncatingRemainder(dividingBy: loop) - 20
                    let x = (seed * 67).truncatingRemainder(dividingBy: Double(size.width)) + drift
                    let width: CGFloat = index.isMultiple(of: 2) ? 8 : 11
                    let height: CGFloat = index.isMultiple(of: 2) ? 12 : 7
                    let rect = CGRect(x: x, y: y, width: width, height: height)
                    context.fill(Path(roundedRect: rect, cornerRadius: 2), with: .color(colors[index % colors.count]))
                }
            }
        }
        .allowsHitTesting(false)
        .ignoresSafeArea()
    }
}

struct FireworksView: View {
    var body: some View {
        TimelineView(.animation(minimumInterval: 1.0 / 30.0)) { timeline in
            Canvas { context, size in
                let time = timeline.date.timeIntervalSinceReferenceDate
                let bursts: [(CGFloat, CGFloat, Double)] = [
                    (size.width * 0.22, size.height * 0.28, 0),
                    (size.width * 0.78, size.height * 0.24, 1.3),
                    (size.width * 0.5, size.height * 0.18, 2.4)
                ]
                let colors: [Color] = [Theme.gold, Theme.bubblePink, .white, Theme.bubbleBlue]
                for (originX, originY, phase) in bursts {
                    let cycle = (time + phase).truncatingRemainder(dividingBy: 2.6)
                    let progress = cycle / 1.1
                    guard progress < 1 else { continue }
                    for spark in 0..<16 {
                        let angle = Double(spark) / 16 * Double.pi * 2
                        let distance = CGFloat(progress) * 54
                        let x = originX + CGFloat(cos(angle)) * distance
                        let y = originY + CGFloat(sin(angle)) * distance + CGFloat(progress * progress) * 18
                        let rect = CGRect(x: x, y: y, width: 5, height: 5)
                        context.fill(
                            Path(ellipseIn: rect),
                            with: .color(colors[spark % colors.count].opacity(1 - progress))
                        )
                    }
                }
            }
        }
        .allowsHitTesting(false)
        .ignoresSafeArea()
    }
}
