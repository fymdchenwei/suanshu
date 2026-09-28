import QuestionEngine
import SwiftData
import SwiftUI

struct QuizView: View {
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject private var session: GameSession
    @State private var confirmExit = false

    var body: some View {
        ZStack {
            SkyBackground(style: .meadow)
            VStack(spacing: 6) {
                header
                ZStack {
                    QuizViewport(landed: session.stonesLanded, chestOpen: session.chest != nil)
                        .allowsHitTesting(false)
                    SparkleBurst(token: session.correctToken)
                }
                .frame(maxHeight: .infinity)
                HStack(alignment: .center, spacing: 12) {
                    questionColumn
                    KeypadView(
                        onDigit: session.tapDigit,
                        onDelete: session.deleteDigit,
                        onConfirm: { session.submit(context: modelContext) },
                        confirmEnabled: !session.input.isEmpty && session.chest == nil
                    )
                    .frame(width: 292)
                    .opacity(session.chest == nil ? 1 : 0.45)
                    .allowsHitTesting(session.chest == nil)
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 6)

            if let banner = session.streakBanner {
                VStack {
                    StreakBanner(text: banner)
                        .padding(.top, 8)
                    Spacer()
                }
                .transition(.scale.combined(with: .opacity))
            }

            if let chest = session.chest {
                ChestOverlay(
                    stage: chest.stage,
                    sticker: chest.sticker,
                    isFinal: chest.isFinal,
                    onContinue: session.dismissChest
                )
            }
        }
        .alert(Copy.exitTitle, isPresented: $confirmExit) {
            Button(Copy.keepPlaying, role: .cancel) {}
            Button(Copy.backToIsland, role: .destructive, action: session.goHome)
        } message: {
            Text(Copy.exitMessage)
        }
        .sensoryFeedback(.error, trigger: session.wrongToken)
        .sensoryFeedback(.success, trigger: session.correctToken)
        .animation(.spring(response: 0.35, dampingFraction: 0.8), value: session.streakBanner)
    }

    private var header: some View {
        HStack(spacing: 10) {
            Button(action: { confirmExit = true }) {
                Text(Copy.backToIslandShort)
                    .font(.system(size: 15, weight: .heavy, design: .rounded))
                    .foregroundStyle(Theme.ink)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Capsule().fill(Color.white.opacity(0.9)))
            }
            .buttonStyle(.plain)

            Text(Copy.stageTitle(session.stageNumber))
                .font(.system(size: 16, weight: .heavy, design: .rounded))
                .foregroundStyle(Theme.ink)
            Text(session.difficulty.chipNote)
                .font(.system(size: 13, weight: .bold, design: .rounded))
                .foregroundStyle(Theme.ink.opacity(0.65))

            Spacer(minLength: 0)

            Text(Copy.progress(current: min(session.index, QuestionEngine.roundSize), total: QuestionEngine.roundSize))
                .font(.system(size: 18, weight: .heavy, design: .rounded))
                .foregroundStyle(Theme.ink)
                .padding(.horizontal, 14)
                .padding(.vertical, 6)
                .background(Capsule().fill(Color.white.opacity(0.92)))
                .accessibilityLabel("已完成 \(min(session.index, QuestionEngine.roundSize)) 题，共 \(QuestionEngine.roundSize) 题")

            if session.streak >= 2 {
                HStack(spacing: 2) {
                    Image(systemName: "flame.fill")
                        .foregroundStyle(Theme.coral)
                    Text("\(session.streak)")
                        .font(.system(size: 16, weight: .heavy, design: .rounded))
                }
                .foregroundStyle(Theme.ink)
            }

            MuteButton(isMuted: session.isMuted, action: session.toggleMute)
        }
    }

    private var questionColumn: some View {
        VStack(spacing: 6) {
            if let problem = session.currentProblem {
                EquationView(problem: problem, typed: session.input, wrongToken: session.wrongToken)
            }
            Text(session.encouragement ?? " ")
                .font(.system(size: 16, weight: .heavy, design: .rounded))
                .foregroundStyle(session.encouragementIsCheer ? Theme.grassDeep : Theme.coral)
                .frame(maxWidth: .infinity)
                .frame(height: 22)
                .animation(.easeInOut(duration: 0.2), value: session.encouragement)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .padding(.horizontal, 8)
        .background(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .fill(Theme.cream.opacity(0.94))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .stroke(Color.white, lineWidth: 3)
        )
    }
}
