import Foundation
import QuestionEngine

enum Copy {
    static let appName = "算数小恐龙"
    static let islandName = "小恐龙闯关岛"
    static let start = "开始闯关"
    static let stickerBook = "贴纸本"
    static let again = "再来一轮"
    static let backToIsland = "回到小岛"
    static let backToIslandShort = "小岛"
    static let stageDone = "关完成！"
    static let collectSticker = "收下贴纸"
    static let seeScore = "看看成绩"
    static let continuePlaying = "继续闯关"
    static let stickersComplete = "贴纸都集齐啦！"
    static let stickersCompleteDetail = "宝箱还是为你打开啦，你真厉害。"
    static let firstTryCaption = "一次答对"
    static let exitTitle = "要回到小岛吗？"
    static let exitMessage = "这次闯关还没完成，进度不会保存。已经拿到的贴纸会留下来。"
    static let keepPlaying = "继续答题"
    static let mute = "静音"
    static let unmute = "打开声音"
    static let share = "分享"
    static let lockedSticker = "还没收集到"
    static let noRoundsYet = "选一个难度，开始第一轮吧"
    static let streak5 = "连对 5 题！"
    static let streak10 = "连对 10 题！太厉害啦！"
    static let correctCheer = "答对啦！"
    static let correctAfterRetry = "这次对啦，前进吧！"

    static let encouragements = [
        "再试一次，你一定可以！",
        "差一点点，再想想～",
        "没关系，慢慢算！",
        "小恐龙给你加油！",
        "仔细看一看，再试一次～",
        "不着急，算对了再前进！"
    ]

    static func stageTitle(_ stage: Int) -> String {
        "第 \(stage) 关"
    }

    static func progress(current: Int, total: Int) -> String {
        "\(current) / \(total)"
    }

    static func clock(_ interval: TimeInterval) -> String {
        let seconds = max(0, Int(interval.rounded()))
        return String(format: "%d:%02d", seconds / 60, seconds % 60)
    }

    static func shareText(correct: Int, total: Int, stars: Int) -> String {
        "我在算数小恐龙闯关，一次答对 \(correct)/\(total)，得到 \(stars) 颗星！"
    }

    static func roundSummary(correct: Int, total: Int, stars: Int) -> String {
        "上一轮 \(correct)/\(total) · \(stars) 颗星"
    }

    static func collectedCount(_ count: Int, total: Int) -> String {
        "已收集 \(count) / \(total)"
    }

    static func roundsPlayed(_ count: Int) -> String {
        count == 0 ? noRoundsYet : "已经闯了 \(count) 轮"
    }
}

extension Difficulty {
    var shortTitle: String {
        switch self {
        case .within20NoCarry: return "轻松"
        case .within20WithCarry: return "进位"
        case .twoDigitOnesNoCarry: return "进阶"
        case .twoDigitWithCarry: return "挑战"
        }
    }

    var shortSubtitle: String {
        switch self {
        case .within20NoCarry: return "20以内"
        case .within20WithCarry: return "20以内"
        case .twoDigitOnesNoCarry: return "100以内"
        case .twoDigitWithCarry: return "100以内"
        }
    }

    var detail: String {
        switch self {
        case .within20NoCarry: return "二十以内，不进位、不退位"
        case .within20WithCarry: return "二十以内，有进位、有退位"
        case .twoDigitOnesNoCarry: return "两位数加减一位数，不进位不退位"
        case .twoDigitWithCarry: return "一百以内，有进位、有退位"
        }
    }

    var chipNote: String {
        switch self {
        case .within20NoCarry: return "不进位"
        case .within20WithCarry: return "有进位"
        case .twoDigitOnesNoCarry: return "不进位"
        case .twoDigitWithCarry: return "有进位"
        }
    }
}
