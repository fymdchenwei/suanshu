# suanshu

算数小恐龙（小恐龙闯关岛）是一款给小学一年级孩子用的离线口算练习。一轮 30 道 100 以内的加减法，小恐龙踩着石头过关，答对了往前跳，每 10 题打开一次宝箱，拿走一张贴纸。

界面文字都是简体中文。不联网，也不依赖第三方库。

## 环境

- Mac，Xcode 15 或更新版本
- iOS 17 或更新版本
- 目标机型：iPhone 15 Pro，只支持横屏（左横屏、右横屏）
- 只做 iPhone，工程里没有 iPad 目标

这台开发环境是 Linux，没有 Xcode，所以 **iOS 工程没有在 Mac 上实际编译或跑过模拟器**。出题引擎是纯 Swift，已经用 `swift test` 跑过（见下面的「验证」）。

## 在 Mac 上打开并运行

1. 用 Xcode 打开仓库根目录的 `SuanShuXiaoKongLong.xcodeproj`。
2. 选中工程里的 App 目标 **SuanShuXiaoKongLong**，打开 **Signing & Capabilities**。
3. 勾选 Automatically manage signing，在 **Team** 里选你的开发团队。模拟器可以先不选团队；装到真机必须选。
4. 运行目标选 **iPhone 15 Pro**（iOS 17 或更高的模拟器，或一台横屏的 iPhone）。
5. 按 Run。应用启动后是横屏。Info.plist 和 AppDelegate 都只允许横屏左右两个方向。

Bundle ID 是 `com.suanshuxiaokonglong.app`。要上架或和别的 App 冲突时，改成你自己的 ID。

出题单元测试：

- 在 Xcode 里选 Product → Test，会跑 `SuanShuXiaoKongLongTests`。
- 也可以只测引擎。在 Mac 或 Linux 上：

```bash
cd QuestionEngine
swift test
```

## 怎么玩

首页是一座浮在云上的小岛：小恐龙、石头路、椰子树和宝箱。上面一排是累计一次答对的题数、贴纸本和最高连对。下面四个难度，选好后按 **开始闯关**。

| 难度 | 题目 |
| --- | --- |
| 轻松 | 20 以内，不进位、不退位 |
| 进位 | 20 以内，必须进位或退位，例如 8 + 7、13 − 5 |
| 进阶 | 20 到 99 的两位数加减一位数，不进位不退位，例如 40 + 7、56 − 6 |
| 挑战 | 100 以内，必须进位或退位。加法结果至少是 21，并且有一个两位数，例如 38 + 47、28 + 5。减法从 21 起步 |

一轮固定 30 题，分成 3 关，每关 10 题。加减法交替，各 15 题。同一轮里不会出现重复题目（3 + 5 和 5 + 3 算两道）。得数在 0 到 100，没有负数，两个数都是 1 到 99。

答错没有惩罚：算式轻轻晃一下，出现一句鼓励的话，还是这道题，可以改答案再交。星星只看 **第一次就答对** 的题数：

- 27 题及以上（90%）：3 颗星
- 21 到 26 题（70%）：2 颗星
- 不到 21 题：1 颗星

做完一轮至少有 1 颗星。连对 5 题、连对 10 题会有单独的庆祝。每做完 10 题，宝箱打开，送一张还没收集过的贴纸；贴纸集齐以后仍然会庆祝。

做题时，小恐龙沿着 10 块石头往前跳，跳满一关就回到起点，开始下一关。成绩页有领奖台、烟花和这一轮的贴纸，可以 **再来一轮** 或 **回到小岛**。

声音是程序合成的，没有音频文件。右上角可以静音，这个选择会记住。

## 会记住什么

用 SwiftData 存在本机：

- 每一轮的日期、难度、一次答对题数、星星、用时、这一轮的最高连对
- 每个难度的最佳星星和闯关次数
- 累计一次答对的题数、历史最高连对
- 已经收集的贴纸

中途按「小岛」离开，这一轮的成绩不保存；这一轮里已经打开宝箱拿到的贴纸会留下。

## 工程结构

```
QuestionEngine/                 纯 Swift 出题引擎和 XCTest
SuanShuXiaoKongLong.xcodeproj   Xcode 15 工程，本地引用上面的包
SuanShuXiaoKongLong/
  App/                          入口、横屏锁定、SwiftData 容器
  ViewModels/GameSession.swift  闯关状态
  Views/                        小岛、做题、成绩、贴纸本
  Reality/                      RealityKit 场景（恐龙、岛、石头、宝箱、领奖台）
  Audio/                        AVAudioEngine 合成音效
  Models/                       SwiftData 模型和贴纸目录
```

界面按 MVVM 分开：规则和出题在 `QuestionEngine`，闯关流程在 `GameSession`，SwiftUI 只负责画面。

### 关于 RealityView

3D 内容全部是 RealityKit 的实体，用球体、方块、圆柱、圆锥搭出来，没有模型文件。

`RealityView` 是 iOS 18 / Xcode 16 才加进 iPhone SDK 的。这个工程要在 Xcode 15 上打开，部署目标是 iOS 17，所以画面放在非 AR 的 `ARView`（`cameraMode = .nonAR`）里，这是 iOS 17 上可用的 RealityKit 视图。不会申请相机权限去拍照；Info.plist 里的相机说明只是为了避免 ARView 误触发相机时直接崩溃。

## 验证

已在 Linux 上用 Swift 6.0.3 执行 `cd QuestionEngine && swift test`。6 个 XCTest 用例全部通过，覆盖：

- 每个难度、多组种子都正好 30 题
- 没有重复题，加减法各 15 道并且交替出现
- 得数在 0...100，没有负数，操作数是 1...99
- 四个难度的进位、退位规则，包括 40 + 7、56 − 6、38 + 47
- 同一道题只属于一个难度
- 相同种子结果相同，不同种子结果不同
- 星星分界：27 题 3 星，26 题 2 星，21 题 2 星，20 题 1 星

没有验证的部分：Xcode 工程能否编译、签名、在 iPhone 15 Pro 模拟器或真机上运行、横屏锁定和 RealityKit 画面。这些需要 Mac 上的 Xcode。

## 这一版先不做

- 家长区
- 错题本
- 每日打卡

另外，两位数加两位数但不进位（例如 23 + 45）这一版四个难度都没有，留给以后加难度时用。
