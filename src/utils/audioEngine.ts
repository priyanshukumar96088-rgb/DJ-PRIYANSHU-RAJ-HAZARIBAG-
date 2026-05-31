// Simple Web Audio API Synthesizer and Audio Effects Engine for DJ Remix Deck
export class DjAudioEngine {
  private static ctx: AudioContext | null = null;

  public static getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Effect 1: Deep Electronic Bass Drop
  public static playBassDrop() {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    // Sweep frequency down to 30Hz exponentially
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 1.8);

    gainNode.gain.setValueAtTime(0.8, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 2.1);
  }

  // Effect 2: Rave Upward/Downward Laser Sweep
  public static playLaserSweep() {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.6);

    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

    // Simple low pass filter to make it warmer
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, ctx.currentTime);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  }

  // Effect 3: Rave Siren / Airhorn Synth
  public static playRaveSiren() {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // Create dual oscillators for detuned rave sound
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';

    // Detune slightly for lush thickness
    osc1.frequency.setValueAtTime(320, now);
    osc2.frequency.setValueAtTime(323, now);

    // Dynamic pitch oscillation (wobble)
    for (let i = 0; i < 6; i++) {
      const t = now + i * 0.25;
      osc1.frequency.linearRampToValueAtTime(450, t + 0.12);
      osc1.frequency.linearRampToValueAtTime(320, t + 0.25);
      osc2.frequency.linearRampToValueAtTime(453, t + 0.12);
      osc2.frequency.linearRampToValueAtTime(323, t + 0.25);
    }

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 1.2);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();

    osc1.stop(now + 1.6);
    osc2.stop(now + 1.6);
  }

  // Effect 4: Echo Delay Blip / Retro Sound
  public static playRetroBlip() {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const delay = ctx.createDelay();
    const feedback = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    // Set up delay loop
    delay.delayTime.setValueAtTime(0.18, ctx.currentTime);
    feedback.gain.setValueAtTime(0.4, ctx.currentTime);

    // Connections
    osc.connect(gainNode);
    gainNode.connect(ctx.destination); // Direct source

    // Connect to feed delay
    gainNode.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay); // Create feedback loop
    delay.connect(ctx.destination); // Send delay trail to output

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }

  // Effect 5: White Noise Snare / Eco Crash
  public static playEcoSizzle() {
    const ctx = this.getContext();
    const bufferSize = ctx.sampleRate * 1.0; // 1 second buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Populate with white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const filterNode = ctx.createBiquadFilter();
    filterNode.type = 'highpass';
    filterNode.frequency.setValueAtTime(1000, ctx.currentTime);
    filterNode.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.8);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.95);

    noiseNode.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseNode.start();
    noiseNode.stop(ctx.currentTime + 1.0);
  }

  // Sound scratch mimic
  public static playVinylScratch() {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(40, now);
    osc.frequency.linearRampToValueAtTime(480, now + 0.08);
    osc.frequency.linearRampToValueAtTime(80, now + 0.16);
    osc.frequency.linearRampToValueAtTime(440, now + 0.22);
    osc.frequency.linearRampToValueAtTime(10, now + 0.3);

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(700, now);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(now + 0.36);
  }
}
