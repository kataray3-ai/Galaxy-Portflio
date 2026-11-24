class CosmicAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private lfoOsc: OscillatorNode | null = null;
  private chimeIntervalId: number | null = null;
  private isPlaying = false;
  private isEnabled = true;
  private stateListeners = new Set<() => void>();

  public subscribe(listener: () => void): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  private notify() {
    this.stateListeners.forEach((fn) => fn());
  }

  public getStatus(): { enabled: boolean; active: boolean; awaitingGesture: boolean } {
    const awaitingGesture =
      this.isEnabled && (!this.ctx || this.ctx.state !== 'running');
    return {
      enabled: this.isEnabled,
      active: this.isEnabled && this.ctx?.state === 'running' && this.isPlaying,
      awaitingGesture,
    };
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    return this.ctx;
  }

  private buildAmbientGraph(ctx: AudioContext) {
    if (this.isPlaying) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    masterGain.connect(ctx.destination);
    this.masterGain = masterGain;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(340, ctx.currentTime);
    filter.Q.setValueAtTime(1.4, ctx.currentTime);
    filter.connect(masterGain);
    this.filterNode = filter;

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.065, ctx.currentTime);
    lfoGain.gain.setValueAtTime(140, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    this.lfoOsc = lfo;

    const freqs = [55.0, 82.41, 110.0, 138.59, 164.81];
    const gains = [0.22, 0.16, 0.14, 0.06, 0.08];
    const types: OscillatorType[] = ['sine', 'triangle', 'sine', 'sine', 'sine'];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = types[idx];
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.detune.setValueAtTime((idx - 2) * 4.5, ctx.currentTime);
      oscGain.gain.setValueAtTime(gains[idx], ctx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();
      this.oscillators.push(osc);
    });

    this.isPlaying = true;

    this.chimeIntervalId = window.setInterval(() => {
      if (this.isEnabled && this.ctx && this.ctx.state === 'running') {
        this.triggerSoftStarNote();
      }
    }, 4600);
  }

  private triggerSoftStarNote() {
    if (!this.ctx || !this.masterGain || this.ctx.state !== 'running') return;
    const pentatonic = [440, 523.25, 587.33, 659.25, 783.99, 880];
    const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(0.025, now + 0.35);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

    osc.connect(env);
    env.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 3.3);
  }

  public tryAutoStartIfPermitted(): boolean {
    if (!this.isEnabled) return false;
    const userActivation = (
      navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }
    ).userActivation;

    if (userActivation && !userActivation.hasBeenActive) {
      this.notify();
      return false;
    }

    void this.start();
    return true;
  }

  public async start(): Promise<boolean> {
    this.isEnabled = true;
    const ctx = this.ensureContext();
    if (!ctx) {
      this.notify();
      return false;
    }

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        this.notify();
        return false;
      }
    }

    if (ctx.state !== 'running') {
      this.notify();
      return false;
    }

    this.buildAmbientGraph(ctx);
    if (this.masterGain) {
      const now = ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(Math.max(this.masterGain.gain.value, 0.0001), now);
      this.masterGain.gain.linearRampToValueAtTime(0.24, now + 1.4);
    }
    this.notify();
    return true;
  }

  public mute() {
    this.isEnabled = false;
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.35);
    }
    this.notify();
  }

  public async toggle(): Promise<boolean> {
    if (this.isEnabled) {
      this.mute();
      return false;
    }
    return this.start();
  }

  public playPlanetChime(planetIndex = 0) {
    if (!this.isEnabled) return;
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running' || !this.masterGain) return;

    const scale = [329.63, 392.0, 440.0, 493.88, 587.33, 659.25];
    const baseFreq = scale[planetIndex % scale.length];
    const now = ctx.currentTime;

    [baseFreq, baseFreq * 1.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);

      gain.gain.setValueAtTime(0.0001, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(i === 0 ? 0.055 : 0.032, now + i * 0.06 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 1.1);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 1.2);
    });
  }

  private lastHoverSoundTime = 0;

  public playHoverSparkle(planetIndex = 0) {
    if (!this.isEnabled) return;
    const nowMs = performance.now();
    if (nowMs - this.lastHoverSoundTime < 180) return;
    this.lastHoverSoundTime = nowMs;

    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running' || !this.masterGain) return;

    const notes = [659.25, 783.99, 880.0, 987.77, 1046.5, 1174.66];
    const freq = notes[planetIndex % notes.length];
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.022, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  public dispose() {
    if (this.chimeIntervalId !== null) {
      clearInterval(this.chimeIntervalId);
      this.chimeIntervalId = null;
    }
    this.oscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    });
    this.oscillators = [];
    if (this.lfoOsc) {
      try {
        this.lfoOsc.stop();
        this.lfoOsc.disconnect();
      } catch {
        // ignore
      }
      this.lfoOsc = null;
    }
    this.filterNode?.disconnect();
    this.masterGain?.disconnect();
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
    this.isPlaying = false;
  }
}

export const cosmicAudio = new CosmicAudioEngine();
