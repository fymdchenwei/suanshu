import SwiftUI

struct Sticker: Identifiable, Equatable, Hashable {
    let id: String
    let name: String
    let emoji: String
    let phrase: String
    let red: Double
    let green: Double
    let blue: Double

    var color: Color {
        Color(red: red, green: green, blue: blue)
    }
}

enum StickerCatalog {
    static let all: [Sticker] = [
        Sticker(id: "star", name: "闪亮星星", emoji: "⭐", phrase: "你一闪一闪的！", red: 1.0, green: 0.86, blue: 0.35),
        Sticker(id: "rainbow", name: "彩虹", emoji: "🌈", phrase: "小岛下雨后就会出现。", red: 0.70, green: 0.85, blue: 1.0),
        Sticker(id: "palm", name: "椰子树", emoji: "🌴", phrase: "树荫下最适合做题。", red: 0.55, green: 0.85, blue: 0.45),
        Sticker(id: "gift", name: "小礼物", emoji: "🎁", phrase: "宝箱里的惊喜。", red: 1.0, green: 0.62, blue: 0.55),
        Sticker(id: "dino", name: "小恐龙", emoji: "🦕", phrase: "和你一起闯关的伙伴。", red: 0.55, green: 0.88, blue: 0.55),
        Sticker(id: "flower", name: "小花花", emoji: "🌸", phrase: "岛边上的花。", red: 1.0, green: 0.75, blue: 0.84),
        Sticker(id: "panda", name: "小熊猫", emoji: "🐼", phrase: "它从宝箱里跳出来。", red: 0.92, green: 0.92, blue: 0.94),
        Sticker(id: "heart", name: "爱心", emoji: "💖", phrase: "送给认真做题的你。", red: 1.0, green: 0.62, blue: 0.74),
        Sticker(id: "trophy", name: "奖杯", emoji: "🏆", phrase: "闯关完成的纪念。", red: 1.0, green: 0.84, blue: 0.40),
        Sticker(id: "sun", name: "太阳", emoji: "☀️", phrase: "小岛今天天气真好。", red: 1.0, green: 0.90, blue: 0.45),
        Sticker(id: "moon", name: "月亮", emoji: "🌙", phrase: "晚霞里的小月亮。", red: 0.78, green: 0.72, blue: 0.98),
        Sticker(id: "mushroom", name: "蘑菇", emoji: "🍄", phrase: "草地上的小房子。", red: 1.0, green: 0.62, blue: 0.50),
        Sticker(id: "butterfly", name: "蝴蝶", emoji: "🦋", phrase: "它跟着小恐龙飞。", red: 0.70, green: 0.82, blue: 1.0),
        Sticker(id: "melon", name: "西瓜", emoji: "🍉", phrase: "闯关后的甜甜奖励。", red: 0.55, green: 0.88, blue: 0.55),
        Sticker(id: "rocket", name: "小火箭", emoji: "🚀", phrase: "下一关冲呀！", red: 0.95, green: 0.70, blue: 0.85)
    ]

    static func sticker(id: String) -> Sticker? {
        all.first { $0.id == id }
    }
}
