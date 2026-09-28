import Combine
import Foundation
import QuestionEngine
import SwiftData

@MainActor
final class GameSession: ObservableObject {
    enum Screen: Equatable {
        case home
        case quiz
        case results
        case stickers
    }

    struct ChestAward: Identifiable {
        let id = UUID()
        let stage: Int
        let sticker: Sticker?
        var isFinal: Bool { stage == QuestionEngine.stageCount }
    }

    @Published var screen: Screen = .home
    @Published private(set) var screenBeforeStickers: Screen = .home
    @Published var difficulty: Difficulty {
        didSet { UserDefaults.standard.set(difficulty.rawValue, forKey: Self.difficultyKey) }
    }
    @Published private(set) var problems: [Problem] = []
    @Published private(set) var index: Int = 0
    @Published var input: String = ""
    @Published private(set) var firstTryCorrect: Int = 0
    @Published private(set) var streak: Int = 0
    @Published private(set) var bestStreakThisRound: Int = 0
    @Published private(set) var wrongToken: Int = 0
    @Published private(set) var correctToken: Int = 0
    @Published private(set) var encouragement: String?
    @Published private(set) var encouragementIsCheer = false
    @Published private(set) var streakBanner: String?
    @Published private(set) var chest: ChestAward?
    @Published private(set) var earnedThisRound: [Sticker] = []
    @Published private(set) var duration: TimeInterval = 0
    @Published private(set) var isMuted: Bool

    private var missedCurrent = false
    private var savedRound = false
    private var startedAt: Date?
    private var messageTask: Task<Void, Never>?
    private let sound: SoundPlayer

    private static let muteKey = "suanshu.muted"
    private static let difficultyKey = "suanshu.difficulty"

    init() {
        sound = SoundPlayer()
        let storedDifficulty = UserDefaults.standard.integer(forKey: Self.difficultyKey)
        difficulty = Difficulty(rawValue: storedDifficulty) ?? .within20NoCarry
        isMuted = UserDefaults.standard.bool(forKey: Self.muteKey)
        sound.isMuted = isMuted
    }

    var currentProblem: Problem? {
        guard problems.indices.contains(index) else { return nil }
        return problems[index]
    }

    var displayNumber: Int {
        min(index + 1, QuestionEngine.roundSize)
    }

    var stageNumber: Int {
        let clamped = min(index, max(0, QuestionEngine.roundSize - 1))
        return clamped / QuestionEngine.problemsPerStage + 1
    }

    /// Stones the dinosaur has landed on in the current stage. Stays at 10 while the chest is open.
    var stonesLanded: Int {
        if chest != nil, index > 0, index.isMultiple(of: QuestionEngine.problemsPerStage) {
            return QuestionEngine.problemsPerStage
        }
        return index % QuestionEngine.problemsPerStage
    }

    var stars: Int {
        QuestionEngine.stars(forFirstTryCorrect: firstTryCorrect)
    }

    func startRound(seed: UInt64 = UInt64(Date().timeIntervalSince1970 * 1000)) {
        problems = QuestionEngine.generateRound(difficulty: difficulty, seed: seed)
        index = 0
        input = ""
        firstTryCorrect = 0
        streak = 0
        bestStreakThisRound = 0
        encouragement = nil
        encouragementIsCheer = false
        streakBanner = nil
        chest = nil
        earnedThisRound = []
        missedCurrent = false
        savedRound = false
        duration = 0
        startedAt = Date()
        screen = .quiz
        sound.playTap()
    }

    func tapDigit(_ digit: Int) {
        guard screen == .quiz, chest == nil, (0...9).contains(digit) else { return }
        if input.count >= 3 { return }
        if input == "0" {
            input = digit == 0 ? "0" : String(digit)
        } else {
            input.append(String(digit))
        }
        sound.playTap()
    }

    func deleteDigit() {
        guard screen == .quiz, chest == nil, !input.isEmpty else { return }
        input.removeLast()
        sound.playTap()
    }

    func submit(context: ModelContext) {
        guard screen == .quiz, chest == nil, let problem = currentProblem else { return }
        guard !input.isEmpty, let value = Int(input) else { return }

        if value != problem.answer {
            missedCurrent = true
            streak = 0
            wrongToken += 1
            encouragementIsCheer = false
            encouragement = Copy.encouragements.randomElement()
            messageTask?.cancel()
            sound.playWrong()
            return
        }

        let firstTry = !missedCurrent
        if firstTry {
            firstTryCorrect += 1
            streak += 1
            bestStreakThisRound = max(bestStreakThisRound, streak)
        } else {
            streak = 0
        }
        input = ""
        missedCurrent = false
        correctToken += 1
        encouragementIsCheer = true
        encouragement = firstTry ? Copy.correctCheer : Copy.correctAfterRetry
        scheduleClearEncouragement()
        sound.playCorrect()
        sound.playHop()

        if streak == 5 {
            showStreakBanner(Copy.streak5)
            sound.playStreak()
        } else if streak == 10 {
            showStreakBanner(Copy.streak10)
            sound.playBigStreak()
        }

        index += 1
        guard index.isMultiple(of: QuestionEngine.problemsPerStage) else { return }

        let stage = index / QuestionEngine.problemsPerStage
        chest = grantSticker(context: context, stage: stage)
        sound.playChest()
        if index == QuestionEngine.roundSize {
            duration = Date().timeIntervalSince(startedAt ?? Date())
            persistRound(context: context)
        }
    }

    func dismissChest() {
        let finished = chest?.isFinal == true
        chest = nil
        if finished {
            screen = .results
            sound.playFanfare()
        }
    }

    func playAgain() {
        startRound()
    }

    func goHome() {
        messageTask?.cancel()
        streakBanner = nil
        chest = nil
        screen = .home
    }

    func openStickers() {
        screenBeforeStickers = screen
        screen = .stickers
        sound.playTap()
    }

    func closeStickers() {
        screen = screenBeforeStickers
    }

    func toggleMute() {
        isMuted.toggle()
        UserDefaults.standard.set(isMuted, forKey: Self.muteKey)
        sound.isMuted = isMuted
        if !isMuted {
            sound.playTap()
        }
    }

    private func showStreakBanner(_ text: String) {
        streakBanner = text
        messageTask?.cancel()
        messageTask = Task { @MainActor in
            try? await Task.sleep(nanoseconds: 1_500_000_000)
            guard !Task.isCancelled else { return }
            if streakBanner == text {
                streakBanner = nil
            }
        }
    }

    private func scheduleClearEncouragement() {
        let snapshot = encouragement
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 700_000_000)
            if encouragement == snapshot, encouragementIsCheer {
                encouragement = nil
            }
        }
    }

    private func grantSticker(context: ModelContext, stage: Int) -> ChestAward {
        let owned = (try? context.fetch(FetchDescriptor<CollectedSticker>())) ?? []
        let ownedIDs = Set(owned.map(\.stickerID)).union(earnedThisRound.map(\.id))
        let remaining = StickerCatalog.all.filter { !ownedIDs.contains($0.id) }
        guard let sticker = remaining.randomElement() else {
            return ChestAward(stage: stage, sticker: nil)
        }
        context.insert(
            CollectedSticker(
                stickerID: sticker.id,
                earnedAt: Date(),
                difficultyRaw: difficulty.rawValue,
                stage: stage
            )
        )
        try? context.save()
        earnedThisRound.append(sticker)
        return ChestAward(stage: stage, sticker: sticker)
    }

    private func persistRound(context: ModelContext) {
        guard !savedRound else { return }
        savedRound = true

        let starCount = stars
        context.insert(
            RoundRecord(
                playedAt: Date(),
                difficultyRaw: difficulty.rawValue,
                firstTryCorrect: firstTryCorrect,
                total: QuestionEngine.roundSize,
                stars: starCount,
                durationSeconds: duration,
                bestStreak: bestStreakThisRound
            )
        )

        let bests = (try? context.fetch(FetchDescriptor<DifficultyBest>())) ?? []
        if let best = bests.first(where: { $0.difficultyRaw == difficulty.rawValue }) {
            best.roundsPlayed += 1
            best.bestStars = max(best.bestStars, starCount)
            best.bestFirstTry = max(best.bestFirstTry, firstTryCorrect)
        } else {
            context.insert(
                DifficultyBest(
                    difficultyRaw: difficulty.rawValue,
                    bestStars: starCount,
                    bestFirstTry: firstTryCorrect,
                    roundsPlayed: 1
                )
            )
        }

        let stats = (try? context.fetch(FetchDescriptor<PlayerStats>())) ?? []
        if let stats = stats.first {
            stats.cumulativeStars += firstTryCorrect
            stats.bestStreak = max(stats.bestStreak, bestStreakThisRound)
        } else {
            context.insert(
                PlayerStats(
                    cumulativeStars: firstTryCorrect,
                    bestStreak: bestStreakThisRound
                )
            )
        }

        try? context.save()
    }
}
