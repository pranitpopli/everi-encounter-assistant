/** Demo knobs — change freely. */
export const DEMO_SPEED = 2; // the mock recording runs this many times faster than real time
export const TICK_MS = 1000 / DEMO_SPEED; // one tick of the mock clock
export const SEC_PER_LINE = 3; // ticks between mock transcript lines
export const TIME_SCALE = 20; // mock visit-clock seconds per real second
export const LAYER2_DELAY_MS = 2500;
export const LAYER2_STAGGER_MS = 800;
export const VOICE_DELAY_MS = 1000;

export const fmtClock = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};
