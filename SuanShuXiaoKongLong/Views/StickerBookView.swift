import SwiftData
import SwiftUI

struct StickerBookView: View {
    @EnvironmentObject private var session: GameSession
    @Query(sort: \CollectedSticker.earnedAt) private var collected: [CollectedSticker]
    @State private var selectedID: String?

    private let columns = Array(repeating: GridItem(.flexible(), spacing: 12), count: 5)

    var body: some View {
        ZStack {
            SkyBackground(style: .day)
            VStack(spacing: 10) {
                header
                LazyVGrid(columns: columns, spacing: 12) {
                    ForEach(StickerCatalog.all) { sticker in
                        stickerCell(sticker, owned: ownedIDs.contains(sticker.id))
                    }
                }
                .padding(.horizontal, 8)
                detail
                Spacer(minLength: 0)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
        }
    }

    private var ownedIDs: Set<String> {
        Set(collected.map(\.stickerID))
    }

    private var header: some View {
        HStack {
            Button(action: session.closeStickers) {
                HStack(spacing: 4) {
                    Image(systemName: "chevron.left")
                    Text(Copy.backToIslandShort)
                }
                .font(.system(size: 16, weight: .heavy, design: .rounded))
                .foregroundStyle(Theme.ink)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Capsule().fill(Color.white.opacity(0.9)))
            }
            .buttonStyle(.plain)

            Spacer()
            Text(Copy.stickerBook)
                .font(.system(size: 26, weight: .heavy, design: .rounded))
                .foregroundStyle(Theme.ink)
            Spacer()
            Text(Copy.collectedCount(collected.count, total: StickerCatalog.all.count))
                .font(.system(size: 15, weight: .heavy, design: .rounded))
                .foregroundStyle(Theme.ink)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(Capsule().fill(Theme.pillBook))
        }
    }

    private func stickerCell(_ sticker: Sticker, owned: Bool) -> some View {
        Button {
            selectedID = sticker.id
        } label: {
            VStack(spacing: 4) {
                ZStack {
                    Circle()
                        .fill(owned ? sticker.color : Color.white.opacity(0.45))
                        .frame(width: 64, height: 64)
                        .overlay(Circle().stroke(Color.white, lineWidth: 3))
                    Text(sticker.emoji)
                        .font(.system(size: 32))
                        .opacity(owned ? 1 : 0.22)
                        .grayscale(owned ? 0 : 1)
                }
                Text(owned ? sticker.name : "？？？")
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                    .foregroundStyle(Theme.ink.opacity(owned ? 0.85 : 0.45))
                    .lineLimit(1)
            }
        }
        .buttonStyle(.plain)
        .accessibilityLabel(owned ? sticker.name : Copy.lockedSticker)
    }

    @ViewBuilder
    private var detail: some View {
        if let selectedID, let sticker = StickerCatalog.sticker(id: selectedID) {
            let owned = ownedIDs.contains(sticker.id)
            Text(owned ? "\(sticker.emoji) \(sticker.name)：\(sticker.phrase)" : Copy.lockedSticker)
                .font(.system(size: 16, weight: .heavy, design: .rounded))
                .foregroundStyle(Theme.ink)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(Capsule().fill(Color.white.opacity(0.9)))
        }
    }
}
