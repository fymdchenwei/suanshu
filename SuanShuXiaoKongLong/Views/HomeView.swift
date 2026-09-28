import QuestionEngine
import SwiftData
import SwiftUI

struct HomeView: View {
    @EnvironmentObject private var session: GameSession
    @Query(sort: \RoundRecord.playedAt, order: .reverse) private var rounds: [RoundRecord]
    @Query private var bests: [DifficultyBest]
    @Query private var stats: [PlayerStats]
    @Query private var stickers: [CollectedSticker]

    var body: some View {
        ZStack {
            SkyBackground(style: .day)
            IslandViewport()
                .ignoresSafeArea()
                .allowsHitTesting(false)
            VStack(spacing: 8) {
                topBar
                Spacer(minLength: 0)
                difficultyRow
                startButton
                Text(Copy.roundsPlayed(rounds.count))
                    .font(.system(size: 13, weight: .semibold, design: .rounded))
                    .foregroundStyle(Theme.ink.opacity(0.75))
                if let last = rounds.first {
                    Text(Copy.roundSummary(correct: last.firstTryCorrect, total: last.total, stars: last.stars))
                        .font(.system(size: 12, weight: .bold, design: .rounded))
                        .foregroundStyle(Theme.ink.opacity(0.6))
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 8)
        }
    }

    private var cumulativeStars: Int {
        if let stats = stats.first {
            return stats.cumulativeStars
        }
        return rounds.reduce(0) { $0 + $1.firstTryCorrect }
    }

    private var bestStreak: Int {
        if let stats = stats.first {
            return stats.bestStreak
        }
        return rounds.map(\.bestStreak).max() ?? 0
    }

    private var topBar: some View {
        HStack(spacing: 10) {
            StatusPill(fill: Theme.pillStar) {
                HStack(spacing: 6) {
                    Image(systemName: "star.fill")
                        .foregroundStyle(Theme.orange)
                    Text("\(cumulativeStars)")
                        .font(.system(size: 22, weight: .heavy, design: .rounded))
                        .foregroundStyle(Theme.ink)
                }
            }
            .accessibilityLabel("累计一次答对 \(cumulativeStars) 题")

            Button(action: session.openStickers) {
                StatusPill(fill: Theme.pillBook) {
                    HStack(spacing: 6) {
                        Text("🦕")
                        Text(Copy.stickerBook)
                            .font(.system(size: 16, weight: .heavy, design: .rounded))
                            .foregroundStyle(Theme.ink)
                        Text("\(stickers.count)")
                            .font(.system(size: 14, weight: .bold, design: .rounded))
                            .foregroundStyle(Theme.ink.opacity(0.7))
                    }
                }
            }
            .buttonStyle(.plain)
            .accessibilityLabel("\(Copy.stickerBook)，已收集 \(stickers.count) 张")

            Spacer(minLength: 0)

            StatusPill(fill: Theme.pillFlame) {
                HStack(spacing: 4) {
                    Image(systemName: "flame.fill")
                        .foregroundStyle(Theme.coral)
                    Text("\(bestStreak)")
                        .font(.system(size: 22, weight: .heavy, design: .rounded))
                        .foregroundStyle(Theme.ink)
                }
            }
            .accessibilityLabel("最高连对 \(bestStreak) 题")

            MuteButton(isMuted: session.isMuted, action: session.toggleMute)
        }
    }

    private var difficultyRow: some View {
        HStack(spacing: 8) {
            ForEach(Difficulty.allCases, id: \.self) { difficulty in
                difficultyButton(difficulty)
            }
        }
    }

    private func difficultyButton(_ difficulty: Difficulty) -> some View {
        let selected = session.difficulty == difficulty
        let best = bests.first { $0.difficultyRaw == difficulty.rawValue }?.bestStars ?? 0
        return Button {
            session.difficulty = difficulty
        } label: {
            VStack(spacing: 1) {
                Text(difficulty.shortTitle)
                    .font(.system(size: 16, weight: .heavy, design: .rounded))
                Text(difficulty.chipNote)
                    .font(.system(size: 11, weight: .bold, design: .rounded))
                HStack(spacing: 1) {
                    ForEach(0..<3, id: \.self) { star in
                        Image(systemName: star < best ? "star.fill" : "star")
                            .font(.system(size: 8))
                    }
                }
                .foregroundStyle(Theme.orange)
            }
            .foregroundStyle(Theme.ink)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 7)
            .background(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(selected ? Color.white : Color.white.opacity(0.72))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(selected ? Theme.orange : Color.white, lineWidth: selected ? 3 : 2)
            )
            .shadow(color: .black.opacity(selected ? 0.12 : 0.05), radius: 3, y: 2)
            .scaleEffect(selected ? 1.04 : 1)
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(difficulty.detail)，最佳 \(best) 颗星")
        .accessibilityAddTraits(selected ? .isSelected : [])
    }

    private var startButton: some View {
        Button(action: { session.startRound() }) {
            HStack(spacing: 8) {
                Image(systemName: "sparkle")
                Text(Copy.start)
                Image(systemName: "sparkle")
            }
            .font(.system(size: 30, weight: .heavy, design: .rounded))
            .frame(maxWidth: 520)
            .frame(height: 58)
        }
        .buttonStyle(PuffyButtonStyle(top: Theme.gold, bottom: Theme.orange, lip: Theme.orangeLip))
        .accessibilityHint(session.difficulty.detail)
    }
}

struct MuteButton: View {
    var isMuted: Bool
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: isMuted ? "speaker.slash.fill" : "speaker.wave.2.fill")
                .font(.system(size: 16, weight: .bold))
                .foregroundStyle(Theme.ink)
                .frame(width: 40, height: 40)
                .background(Circle().fill(Color.white.opacity(0.9)))
                .overlay(Circle().stroke(Color.white, lineWidth: 2))
        }
        .buttonStyle(.plain)
        .accessibilityLabel(isMuted ? Copy.unmute : Copy.mute)
    }
}
