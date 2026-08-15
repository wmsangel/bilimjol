// Звуковые эффекты через WebAudio — без файлов, просто короткие тоны.
// Уважает флаг «выключить звук» в localStorage.

const KEY = "izn.study:sound:v1";

let ctx: AudioContext | null = null;
function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

export function isMuted(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "off";
}

export function setMuted(muted: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, muted ? "off" : "on");
  window.dispatchEvent(new CustomEvent("izn-sound"));
}

export function toggleMuted(): boolean {
  const next = !isMuted();
  setMuted(next);
  return next;
}

type Note = { f: number; t: number; d: number; type?: OscillatorType; g?: number };

function play(notes: Note[]) {
  if (isMuted()) return;
  const c = audio();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  const now = c.currentTime;
  for (const n of notes) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = n.type ?? "sine";
    osc.frequency.value = n.f;
    const start = now + n.t;
    const peak = n.g ?? 0.14;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + n.d);
    osc.connect(gain).connect(c.destination);
    osc.start(start);
    osc.stop(start + n.d + 0.02);
  }
}

const N = { C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, G4: 392, E4: 329.63 };

export type SoundKind = "correct" | "wrong" | "unlock" | "click";

export function playSound(kind: SoundKind) {
  switch (kind) {
    case "correct":
      play([
        { f: N.E5, t: 0, d: 0.12 },
        { f: N.G5, t: 0.09, d: 0.12 },
        { f: N.C6, t: 0.18, d: 0.2 },
      ]);
      break;
    case "wrong":
      play([
        { f: N.E4, t: 0, d: 0.16, type: "triangle", g: 0.1 },
        { f: 220, t: 0.12, d: 0.22, type: "triangle", g: 0.1 },
      ]);
      break;
    case "unlock":
      play([
        { f: N.C5, t: 0, d: 0.13 },
        { f: N.E5, t: 0.1, d: 0.13 },
        { f: N.G5, t: 0.2, d: 0.13 },
        { f: N.C6, t: 0.3, d: 0.28 },
        { f: N.A5, t: 0.42, d: 0.3 },
      ]);
      break;
    case "click":
      play([{ f: N.A5, t: 0, d: 0.06, type: "triangle", g: 0.08 }]);
      break;
  }
}
