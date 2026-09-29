export interface AudioPlayer {
  muted: boolean;
  unlock(): void;
  playTap(): void;
  playCorrect(): void;
  playWrong(): void;
  playHop(): void;
  playChest(): void;
  playStreak(): void;
  playBigStreak(): void;
  playFanfare(): void;
}

type Note = [frequency: number, start: number, duration: number];

/** Synthesized effects. No audio files, so the site stays a static bundle. */
export class WebAudioPlayer implements AudioPlayer {
  muted = false;
  private context: AudioContext | null = null;

  unlock(): void {
    const context = this.ensure();
    if (context.state === 'suspended') {
      void context.resume();
    }
  }

  playTap(): void {
    this.play([[660, 0, 0.045]], 0.12);
  }

  playCorrect(): void {
    this.play(
      [
        [523.25, 0, 0.11],
        [659.25, 0.08, 0.12],
        [783.99, 0.16, 0.18],
      ],
      0.22,
    );
  }

  playWrong(): void {
    this.play(
      [
        [392, 0, 0.12],
        [311, 0.09, 0.18],
      ],
      0.14,
    );
  }

  playHop(): void {
    this.play([[740, 0, 0.06]], 0.14);
  }

  playChest(): void {
    this.play(
      [
        [523.25, 0, 0.1],
        [659.25, 0.09, 0.1],
        [783.99, 0.18, 0.11],
        [1046.5, 0.27, 0.24],
      ],
      0.24,
    );
  }

  playStreak(): void {
    this.play(
      [
        [659.25, 0, 0.1],
        [783.99, 0.1, 0.1],
        [987.77, 0.2, 0.18],
      ],
      0.22,
    );
  }

  playBigStreak(): void {
    this.playFanfare();
  }

  playFanfare(): void {
    this.play(
      [
        [523.25, 0, 0.12],
        [659.25, 0.12, 0.12],
        [783.99, 0.24, 0.12],
        [1046.5, 0.36, 0.3],
      ],
      0.26,
    );
  }

  private ensure(): AudioContext {
    if (!this.context) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.context = new Ctx();
    }
    return this.context;
  }

  private play(notes: Note[], volume: number): void {
    if (this.muted || !this.context || this.context.state !== 'running') return;
    const now = this.context.currentTime;
    for (const [frequency, start, duration] of notes) {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      const begin = now + start;
      gain.gain.setValueAtTime(0.0001, begin);
      gain.gain.exponentialRampToValueAtTime(volume, begin + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, begin + Math.max(0.03, duration));
      oscillator.connect(gain);
      gain.connect(this.context.destination);
      oscillator.start(begin);
      oscillator.stop(begin + duration + 0.02);
    }
  }
}

export class SilentAudio implements AudioPlayer {
  muted = false;
  taps = 0;
  corrects = 0;
  wrongs = 0;
  unlock(): void {}
  playTap(): void {
    this.taps += 1;
  }
  playCorrect(): void {
    this.corrects += 1;
  }
  playWrong(): void {
    this.wrongs += 1;
  }
  playHop(): void {}
  playChest(): void {}
  playStreak(): void {}
  playBigStreak(): void {}
  playFanfare(): void {}
}
