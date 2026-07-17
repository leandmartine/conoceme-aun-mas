/**
 * Lightweight procedural SFX (no asset files). Mute-aware.
 * Not a full soundtrack — just presence.
 */
export class GameAudio {
  private ctx: AudioContext | null = null;
  private muted = false;
  private unlocked = false;

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      localStorage.setItem('conoceme-mute', muted ? '1' : '0');
    } catch {
      /* ignore */
    }
  }

  loadPreference(): void {
    try {
      this.muted = localStorage.getItem('conoceme-mute') === '1';
    } catch {
      this.muted = false;
    }
  }

  async unlock(): Promise<void> {
    if (this.unlocked) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    this.unlocked = true;
  }

  /** Soft UI tick */
  tick(): void {
    if (this.muted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(520, t);
    o.frequency.exponentialRampToValueAtTime(280, t + 0.08);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.04, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    o.connect(g);
    g.connect(this.ctx.destination);
    o.start(t);
    o.stop(t + 0.12);
  }

  /** Discovery chime when opening a place */
  discover(): void {
    if (this.muted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [392, 494, 587];
    notes.forEach((freq, i) => {
      const o = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      o.type = 'triangle';
      o.frequency.value = freq;
      const start = t + i * 0.07;
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(0.05, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);
      o.connect(g);
      g.connect(this.ctx!.destination);
      o.start(start);
      o.stop(start + 0.28);
    });
  }
}

export const gameAudio = new GameAudio();
