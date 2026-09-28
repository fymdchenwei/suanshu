import AVFoundation
import Foundation

/// Short synthesized effects. The app stays fully offline and ships no audio files.
/// Called from the main actor by `GameSession`.
final class SoundPlayer {
    var isMuted = false

    private let engine = AVAudioEngine()
    private let player = AVAudioPlayerNode()
    private let format: AVAudioFormat?
    private var started = false

    init() {
        format = AVAudioFormat(standardFormatWithSampleRate: 44_100, channels: 1)
        guard let format else { return }
        engine.attach(player)
        engine.connect(player, to: engine.mainMixerNode, format: format)
        engine.mainMixerNode.outputVolume = 0.9
        startIfNeeded()
    }

    func playTap() {
        play(notes: [(660, 0, 0.045)], volume: 0.12)
    }

    func playCorrect() {
        play(notes: [(523.25, 0, 0.11), (659.25, 0.08, 0.12), (783.99, 0.16, 0.18)], volume: 0.28)
    }

    func playWrong() {
        play(notes: [(392, 0, 0.12), (311, 0.09, 0.18)], volume: 0.16)
    }

    func playHop() {
        play(notes: [(740, 0, 0.06)], volume: 0.16)
    }

    func playChest() {
        play(notes: [
            (523.25, 0, 0.10),
            (659.25, 0.09, 0.10),
            (783.99, 0.18, 0.11),
            (1046.5, 0.27, 0.24)
        ], volume: 0.30)
    }

    func playStreak() {
        play(notes: [(659.25, 0, 0.10), (783.99, 0.10, 0.10), (987.77, 0.20, 0.18)], volume: 0.28)
    }

    func playBigStreak() {
        playFanfare()
    }

    func playFanfare() {
        play(notes: [
            (523.25, 0, 0.12),
            (659.25, 0.12, 0.12),
            (783.99, 0.24, 0.12),
            (1046.5, 0.36, 0.30)
        ], volume: 0.32)
    }

    private func startIfNeeded() {
        guard !started, let format, format.sampleRate > 0, format.channelCount > 0 else { return }
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.ambient, mode: .default, options: [.mixWithOthers])
            try session.setActive(true)
            try engine.start()
            started = true
        } catch {
            started = false
        }
    }

    /// Notes are `(frequency Hz, start seconds, duration seconds)`.
    private func play(notes: [(Double, Double, Double)], volume: Float) {
        guard !isMuted else { return }
        startIfNeeded()
        guard started, let format, format.sampleRate > 0 else { return }

        let sampleRate = format.sampleRate
        let total = notes.map { $0.1 + $0.2 }.max() ?? 0
        let frameCount = AVAudioFrameCount(max(1, total * sampleRate))
        guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount),
              let samples = buffer.floatChannelData?[0] else { return }
        buffer.frameLength = frameCount
        let count = Int(frameCount)
        for index in 0..<count {
            samples[index] = 0
        }

        for note in notes {
            let startFrame = Int(note.1 * sampleRate)
            let noteFrames = max(1, Int(note.2 * sampleRate))
            for offset in 0..<noteFrames {
                let index = startFrame + offset
                if index >= count { break }
                let time = Double(offset) / sampleRate
                let envelope = envelopeValue(index: offset, total: noteFrames)
                samples[index] += Float(sin(2 * Double.pi * note.0 * time) * envelope) * volume
            }
        }

        for index in 0..<count {
            samples[index] = max(-1, min(1, samples[index]))
        }

        player.scheduleBuffer(buffer, completionHandler: nil)
        if !player.isPlaying {
            player.play()
        }
    }

    private func envelopeValue(index: Int, total: Int) -> Double {
        let attack = min(max(1, Int(0.012 * 44_100)), max(1, total / 4))
        let release = min(max(1, Int(0.045 * 44_100)), max(1, total / 3))
        if index < attack {
            return Double(index) / Double(attack)
        }
        if index > total - release {
            return max(0, Double(total - index) / Double(release))
        }
        return 1
    }
}
