// Procedural Sound Generator using Web Audio API
// Beautifully redesigned for the "Al-Darai Digital Library" with three tranquil romantic nature sounds:
// 1. Brook Stream ("خرير ماء ساقية دافئة"): Periodic tender wave movement mimicking a slow-turning garden water-wheel "ساقية".
// 2. Gentle Soft Birds ("عصافير ناعمة زقزقة"): Extremely delicate, high-pitched romantic birds calling with elegant silence.
// 3. Spaced Raindrops ("قطرات متباعدة"): Absolute tranquility with clear drops landing exactly every 2 seconds.

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  
  // Node references for Rain
  private rainGain: GainNode | null = null;
  private rainTimer: any = null;

  // Node references for Water (River flow & bubbles)
  private waterGain: GainNode | null = null;
  private bubbleTimer: any = null;

  // Node references for Birds
  private birdGain: GainNode | null = null;
  private birdTimer: any = null;

  // Overall Master Gain
  private masterGain: GainNode | null = null;

  // Sound States (volumes 0 to 1)
  private rainVolume: number = 0.55;
  private birdsVolume: number = 0.12;
  private waterVolume: number = 0.25;
  private isPlaying: boolean = false;

  constructor() {}

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    
    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Setup elements
    this.setupRain();
    this.setupWater();
    this.setupBirds();
  }

  private setupRain() {
    // Rain is disabled per user request: only chirping birds and flowing water remain active
  }

  // Generates single, relaxing rain droplets landing on a surface
  private triggerRainDrop() {
    // Disabled per user request
  }

  private setupWater() {
    if (!this.ctx || !this.masterGain) return;

    this.waterGain = this.ctx.createGain();
    this.waterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.waterGain.connect(this.masterGain);

    // Continuous soft garden brook water stream
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.015 * white)) / 1.015; // Deeper sweet pink relaxation noise
      lastOut = output[i];
    }

    const pinkNoise = this.ctx.createBufferSource();
    pinkNoise.buffer = noiseBuffer;
    pinkNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(325, this.ctx.currentTime); // Lower, sweeter stream frequency
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    // LFO representing the cyclic rotation of a romantic waterwheel "ساقية" (every ~5 seconds)
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime); // 5 seconds per swell

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(60, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const continuousWaterGain = this.ctx.createGain();
    continuousWaterGain.gain.setValueAtTime(0.09, this.ctx.currentTime); // Soft stream drone

    pinkNoise.connect(filter);
    filter.connect(continuousWaterGain);
    continuousWaterGain.connect(this.waterGain);

    lfo.start(0);
    pinkNoise.start(0);
  }

  // Simulates a tiny, delightful water bubble gurgle inside the river
  private triggerRiverBubble() {
    if (!this.ctx || !this.waterGain || !this.isPlaying || this.waterVolume === 0) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    
    // Bubble sound: fast frequency sweep upwards
    const startFreq = 180 + Math.random() * 120; // 180Hz - 300Hz
    const endFreq = startFreq * (2.0 + Math.random() * 0.3); // Sweeps up
    
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.15);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(this.waterVolume * 0.12, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.waterGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  private setupBirds() {
    if (!this.ctx || !this.masterGain) return;

    this.birdGain = this.ctx.createGain();
    this.birdGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.birdGain.connect(this.masterGain);
  }

  // Generates sweet, delicate, romantic bird calls (زقزقة ناعمة)
  private triggerBirdChirp() {
    if (!this.ctx || !this.birdGain || !this.isPlaying || this.birdsVolume === 0) return;

    const now = this.ctx.currentTime;
    const callType = Math.floor(Math.random() * 2); // 0 or 1 for best romantic chirps

    if (callType === 0) {
      // Very sweet, double soft chirps with tender glides
      let startTime = now;
      for (let i = 0; i < 2; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const startHertz = 3600 + Math.random() * 400; // Ultra high sweet soft pitch
        const peakHertz = startHertz + 600;

        osc.frequency.setValueAtTime(startHertz, startTime);
        osc.frequency.exponentialRampToValueAtTime(peakHertz, startTime + 0.035);
        osc.frequency.exponentialRampToValueAtTime(startHertz - 200, startTime + 0.09);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(this.birdsVolume * 0.55, startTime + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.09);

        osc.connect(gain);
        gain.connect(this.birdGain);

        osc.start(startTime);
        osc.stop(startTime + 0.1);

        startTime += 0.16;
      }
    } else {
      // Type 2: Melodious Nightingale Whisper (Glides slowly and tenderly down)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const startHertz = 2400 + Math.random() * 200;
      
      osc.frequency.setValueAtTime(startHertz, now);
      osc.frequency.linearRampToValueAtTime(startHertz - 250, now + 0.35);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(this.birdsVolume * 0.45, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(gain);
      gain.connect(this.birdGain);

      osc.start(now);
      osc.stop(now + 0.4);
    }
  }

  public start() {
    this.init();
    if (!this.ctx) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = true;

    // Fade in gain nodes slowly
    const now = this.ctx.currentTime;
    if (this.waterGain) {
      this.waterGain.gain.linearRampToValueAtTime(this.waterVolume, now + 2.0);
    }
    if (this.birdGain) {
      this.birdGain.gain.linearRampToValueAtTime(this.birdsVolume, now + 1.2);
    }

    // Set up scheduling of River Gurgling Bubbles
    if (this.bubbleTimer) clearInterval(this.bubbleTimer);
    this.bubbleTimer = setInterval(() => {
      if (Math.random() > 0.3) {
        this.triggerRiverBubble();
      }
    }, 1200);

    // Set interval for diverse, atmospheric bird chirps (every 6 to 8 seconds for luxury premium spacing)
    if (this.birdTimer) clearInterval(this.birdTimer);
    this.birdTimer = setInterval(() => {
      this.triggerBirdChirp();
    }, 7000);

    // Trigger initial ones for instant sound immersion
    setTimeout(() => {
      this.triggerBirdChirp();
      this.triggerRiverBubble();
    }, 300);
  }

  public stop() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Fade out elements smoothly
    if (this.rainGain) {
      this.rainGain.gain.linearRampToValueAtTime(0, now + 0.6);
    }
    if (this.waterGain) {
      this.waterGain.gain.linearRampToValueAtTime(0, now + 0.6);
    }
    if (this.birdGain) {
      this.birdGain.gain.linearRampToValueAtTime(0, now + 0.6);
    }

    this.isPlaying = false;

    if (this.rainTimer) {
      clearInterval(this.rainTimer);
      this.rainTimer = null;
    }
    if (this.bubbleTimer) {
      clearInterval(this.bubbleTimer);
      this.bubbleTimer = null;
    }
    if (this.birdTimer) {
      clearInterval(this.birdTimer);
      this.birdTimer = null;
    }
  }

  public setRainVolume(vol: number) {
    this.rainVolume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.isPlaying && this.rainGain) {
      this.rainGain.gain.setTargetAtTime(this.rainVolume, this.ctx.currentTime, 0.15);
    }
  }

  public setBirdsVolume(vol: number) {
    this.birdsVolume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.isPlaying && this.birdGain) {
      this.birdGain.gain.setTargetAtTime(this.birdsVolume, this.ctx.currentTime, 0.15);
    }
  }

  public setWaterVolume(vol: number) {
    this.waterVolume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.isPlaying && this.waterGain) {
      this.waterGain.gain.setTargetAtTime(this.waterVolume, this.ctx.currentTime, 0.15);
    }
  }

  public getIsPlaying() {
    return this.isPlaying;
  }

  public getVolumes() {
    return {
      rain: this.rainVolume,
      birds: this.birdsVolume,
      water: this.waterVolume
    };
  }
}

export const ambientSound = new AmbientAudioEngine();
