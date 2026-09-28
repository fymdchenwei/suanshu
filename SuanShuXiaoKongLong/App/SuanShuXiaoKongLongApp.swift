import SwiftData
import SwiftUI

@main
struct SuanShuXiaoKongLongApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate

    private let container: ModelContainer = {
        do {
            return try ModelContainer(
                for: RoundRecord.self,
                CollectedSticker.self,
                DifficultyBest.self,
                PlayerStats.self
            )
        } catch {
            do {
                let memory = ModelConfiguration(isStoredInMemoryOnly: true)
                return try ModelContainer(
                    for: RoundRecord.self,
                    CollectedSticker.self,
                    DifficultyBest.self,
                    PlayerStats.self,
                    configurations: memory
                )
            } catch {
                fatalError("无法创建本地存档：\(error.localizedDescription)")
            }
        }
    }()

    var body: some Scene {
        WindowGroup {
            RootView()
        }
        .modelContainer(container)
    }
}

final class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        supportedInterfaceOrientationsFor window: UIWindow?
    ) -> UIInterfaceOrientationMask {
        .landscape
    }
}

struct RootView: View {
    @StateObject private var session = GameSession()

    var body: some View {
        Group {
            switch session.screen {
            case .home:
                HomeView()
            case .quiz:
                QuizView()
            case .results:
                ResultsView()
            case .stickers:
                StickerBookView()
            }
        }
        .environmentObject(session)
        .preferredColorScheme(.light)
        .animation(.easeInOut(duration: 0.25), value: session.screen)
    }
}
