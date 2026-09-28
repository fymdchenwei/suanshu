import Foundation
import SwiftData

@Model
final class RoundRecord {
    var id: UUID
    var playedAt: Date
    var difficultyRaw: Int
    var firstTryCorrect: Int
    var total: Int
    var stars: Int
    var durationSeconds: Double
    var bestStreak: Int

    init(
        id: UUID = UUID(),
        playedAt: Date,
        difficultyRaw: Int,
        firstTryCorrect: Int,
        total: Int,
        stars: Int,
        durationSeconds: Double,
        bestStreak: Int
    ) {
        self.id = id
        self.playedAt = playedAt
        self.difficultyRaw = difficultyRaw
        self.firstTryCorrect = firstTryCorrect
        self.total = total
        self.stars = stars
        self.durationSeconds = durationSeconds
        self.bestStreak = bestStreak
    }
}

@Model
final class CollectedSticker {
    @Attribute(.unique) var stickerID: String
    var earnedAt: Date
    var difficultyRaw: Int
    var stage: Int

    init(stickerID: String, earnedAt: Date, difficultyRaw: Int, stage: Int) {
        self.stickerID = stickerID
        self.earnedAt = earnedAt
        self.difficultyRaw = difficultyRaw
        self.stage = stage
    }
}

@Model
final class DifficultyBest {
    @Attribute(.unique) var difficultyRaw: Int
    var bestStars: Int
    var bestFirstTry: Int
    var roundsPlayed: Int

    init(difficultyRaw: Int, bestStars: Int, bestFirstTry: Int, roundsPlayed: Int) {
        self.difficultyRaw = difficultyRaw
        self.bestStars = bestStars
        self.bestFirstTry = bestFirstTry
        self.roundsPlayed = roundsPlayed
    }
}

@Model
final class PlayerStats {
    var cumulativeStars: Int
    var bestStreak: Int

    init(cumulativeStars: Int, bestStreak: Int) {
        self.cumulativeStars = cumulativeStars
        self.bestStreak = bestStreak
    }
}
