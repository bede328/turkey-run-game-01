// Turkey Run — tiny synthesized sounds via WebAudio. No audio files, no network.
// Created lazily on the first user gesture; silent until then.
let ctx = null;
let muted = false;

export function ensureAudio() {
  if (ctx === null) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { ctx = undefined; }
  }
  if (ctx && ctx.state === 'suspended') void ctx.resume();
}

export function toggleMute() { muted = !muted; return muted; }
export function isMuted() { return muted; }

function tone(freq, dur, type, vol, slideTo) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export function playJump() { tone(420, 0.16, 'sine', 0.18, 780); }
export function playDoubleJump() { tone(620, 0.18, 'triangle', 0.16, 1100); }
export function playCorn() { tone(880, 0.09, 'square', 0.10, 1320); }
export function playWing() { tone(523, 0.12, 'sine', 0.16, 784); setTimeout(() => tone(784, 0.16, 'sine', 0.14, 1046), 90); }
export function playHit() { tone(220, 0.25, 'sawtooth', 0.20, 90); }
export function playCaught() { tone(330, 0.3, 'sawtooth', 0.20, 110); setTimeout(() => tone(196, 0.5, 'sawtooth', 0.18, 65), 220); }
export function playEscape() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.22, 'triangle', 0.16), i * 130)); }
export function playClick() { tone(700, 0.06, 'sine', 0.12); }
