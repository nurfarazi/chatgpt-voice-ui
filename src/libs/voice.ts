export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private stream: MediaStream | null = null;

  constructor() {
    this.audioContext = null;
  }

  async start() {
    if (this.audioContext) {
      return;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      
      this.analyser.fftSize = 64; // Small size for visualizer bars
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      
      this.microphone.connect(this.analyser);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      void this.audioContext.close();
      this.audioContext = null;
    }
  }

  getLevels(count: number = 7): number[] {
    if (!this.analyser || !this.dataArray) {
      return Array(count).fill(0.1); // Default idle state
    }

    this.analyser.getByteFrequencyData(this.dataArray as any);
    
    // Normalize and sample data
    const step = Math.floor(this.dataArray.length / count);
    const levels = [];
    
    for (let i = 0; i < count; i++) {
      const value = this.dataArray[i * step] || 0;
      // Normalize to 0.0 - 1.0 range, with a minimum floor
      levels.push(Math.max(0.1, value / 255));
    }

    return levels;
  }
}
