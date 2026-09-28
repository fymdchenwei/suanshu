import QuestionEngine
import SwiftUI

struct ResultsView: View {
    @EnvironmentObject private var session: GameSession
    @State private var starsShown = false

    var body: some View {
        ZStack {
            SkyBackground(style: .night)
            FireworksView()
            ConfettiView(pieceCount: 42)
            VStack(spacing: 6) {
                topBar
                starRow
                PodiumViewport()
                    .frame(maxHeight: .infinity)
                    .allowsHitTesting(false)
                scoreCard
                buttons
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 8)
        }
        .onAppear { starsShown = true }
    }

    private var topBar: some View {
        HStack {
            Button(action: session.goHome) {
                Image(systemName: "chevron.left")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundStyle(.white)
                    .frame(width: 40, height: 40)
                    .background(Circle().fill(Color.white.opacity(0.22)))
            }
            .buttonStyle(.plain)
            .accessibilityLabel(Copy.backToIsland)

            Spacer()

            ShareLink(item: Copy.shareText(
                correct: session.firstTryCorrect,
                total: QuestionEngine.roundSize,
                stars: session.stars
            )) {
                Image(systemName: "square.and.arrow.up")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundStyle(.white)
                    .frame(width: 40, height: 40)
                    .background(Circle().fill(Color.white.opacity(0.22)))
            }
            .accessibilityLabel(Copy.share)
        }
    }

    private var starRow: some View {
        HStack(spacing: 14) {
            ForEach(0..<3, id: \.self) { index in
                Image(systemName: index < session.stars ? "star.fill" : "star")
                    .font(.system(size: index == 1 ? 48 : 36, weight: .black))
                    .foregroundStyle(index < session.stars ? Theme.gold : Color.white.opacity(0.45))
                    .shadow(color: Theme.gold.opacity(index < session.stars ? 0.7 : 0), radius: 8)
                    .offset(y: index == 1 ? -8 : 4)
                    .scaleEffect(starsShown ? 1 : 0.2)
                    .animation(
                        .spring(response: 0.45, dampingFraction: 0.55).delay(0.12 * Double(index)),
                        value: starsShown
                    )
            }
        }
        .frame(height: 58)
        .accessibilityLabel("得到 \(session.stars) 颗星")
    }

    private var scoreCard: some View {
        HStack(spacing: 16) {
            ZStack {
                Circle().fill(Color(red: 0.55, green: 0.35, blue: 0.85))
                Image(systemName: "trophy.fill")
                    .font(.system(size: 22))
                    .foregroundStyle(Theme.gold)
            }
            .frame(width: 48, height: 48)

            HStack(alignment: .firstTextBaseline, spacing: 4) {
                Text("\(session.firstTryCorrect)")
                    .font(.system(size: 40, weight: .black, design: .rounded))
                    .foregroundStyle(Theme.bubblePink)
                Text("/")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundStyle(Theme.ink.opacity(0.35))
                Text("\(QuestionEngine.roundSize)")
                    .font(.system(size: 40, weight: .black, design: .rounded))
                    .foregroundStyle(Theme.bubbleBlue)
            }
            .accessibilityLabel("一次答对 \(session.firstTryCorrect) 题，共 \(QuestionEngine.roundSize) 题")

            VStack(alignment: .leading, spacing: 2) {
                Text(Copy.firstTryCaption)
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                    .foregroundStyle(Theme.ink.opacity(0.55))
                Label(Copy.clock(session.duration), systemImage: "clock.fill")
                    .font(.system(size: 14, weight: .heavy, design: .rounded))
                    .foregroundStyle(Theme.ink.opacity(0.7))
            }

            Spacer(minLength: 0)

            Text(session.earnedThisRound.last?.emoji ?? "💖")
                .font(.system(size: 32))
                .frame(width: 48, height: 48)
                .background(Circle().fill(Theme.pillFlame))
                .accessibilityLabel(session.earnedThisRound.last?.name ?? "贴纸")
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .fill(Color.white.opacity(0.94))
        )
    }

    private var buttons: some View {
        HStack(spacing: 12) {
            Button(action: session.playAgain) {
                HStack(spacing: 6) {
                    Image(systemName: "arrow.clockwise")
                    Text(Copy.again)
                }
                .font(.system(size: 22, weight: .heavy, design: .rounded))
                .frame(maxWidth: .infinity)
                .frame(height: 52)
            }
            .buttonStyle(PuffyButtonStyle(top: Theme.confirmGreen, bottom: Color(red: 0.32, green: 0.72, blue: 0.40), lip: Theme.confirmLip))

            Button(action: session.goHome) {
                HStack(spacing: 6) {
                    Image(systemName: "house.fill")
                    Text(Copy.backToIsland)
                }
                .font(.system(size: 22, weight: .heavy, design: .rounded))
                .frame(maxWidth: .infinity)
                .frame(height: 52)
            }
            .buttonStyle(PuffyButtonStyle(top: Theme.bubbleBlue, bottom: Color(red: 0.24, green: 0.50, blue: 0.92), lip: Color(red: 0.16, green: 0.36, blue: 0.75)))
        }
    }
}
