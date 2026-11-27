// Turkey Run — tuning constants and stage table. One job: numbers, no logic.
// Canvas is a fixed 1280x720 stage, scaled to the window by main.js.
export const VIEW = { width: 1280, height: 720 };
export const GROUND_Y = 600;
export const TURKEY_X = 300;
export const ESCAPE_DISTANCE_M = 1500;
export const PIXELS_PER_METER = 50;

export const PHYSICS = {
  gravity: 2600,
  jumpVelocity: -980,
  doubleJumpVelocity: -860,
  baseSpeed: 330,
  maxSpeed: 640,
  speedPerMeter: 0.22,
  invulnerableSeconds: 1.6,
  farmerStartGap: 170,
  farmerMaxGap: 195,
  farmerCatchGap: 26,
  hitGapLoss: 55,
  gapRecoverPerSecond: 26,
};

export const SCORE = { perMeter: 10, perCorn: 50, perWing: 25, escapeBonus: 1000 };

// Stages: farmyard -> barn -> kitchen. The run gets faster and denser per stage.
export const STAGES = [
  { name: 'FARMYARD', untilM: 500, sky: ['#ffb347', '#ff8c42'], ground: '#8a5a2b', grass: '#5d8a3c', spawnGap: [760, 1150], knifeChance: 0.3 },
  { name: 'BARN', untilM: 1000, sky: ['#f4845f', '#c94b4b'], ground: '#7a4a22', grass: '#6d7a2e', spawnGap: [640, 1000], knifeChance: 0.45 },
  { name: 'KITCHEN', untilM: 1500, sky: ['#e2583e', '#7a2d1d'], ground: '#6b3a1e', grass: '#4a5d23', spawnGap: [540, 880], knifeChance: 0.6 },
];

export function stageFor(distanceM) {
  for (const stage of STAGES) if (distanceM < stage.untilM) return stage;
  return STAGES[STAGES.length - 1];
}

// Deterministic RNG (mulberry32) so staged screenshots reproduce exactly.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
