// Turkey Run — the simulation: running, jumping, spawning, collisions, the farmer.
// Pure logic, no drawing and no DOM: shots.js and main.js drive it with fixed steps.
import { ESCAPE_DISTANCE_M, GROUND_Y, PHYSICS, PIXELS_PER_METER, SCORE, TURKEY_X, makeRng, stageFor } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';

export const KIND_OVEN = 'oven';
export const KIND_KNIFE = 'knife';
export const KIND_CORN = 'corn';
export const KIND_WING = 'wing';

const TURKEY_W = 64;
const TURKEY_H = 80;

export function createWorld(seed = 20261127) {
  return {
    seed,
    rng: makeRng(seed),
    screen: SCREEN_TITLE,
    time: 0,
    scrollX: 0,
    distanceM: 0,
    score: 0,
    corn: 0,
    hearts: 3,
    speed: PHYSICS.baseSpeed,
    farmerGap: PHYSICS.farmerStartGap,
    turkey: { y: GROUND_Y, vy: 0, onGround: true, jumpsUsed: 0, winged: 0, runPhase: 0 },
    entities: [],
    nextSpawnM: 14,
    invulnerableUntil: -1,
    slowUntil: -1,
    overReason: null, // 'caught' | 'escaped'
    best: 0,
  };
}

export function startRun(world) {
  const fresh = createWorld(world.seed);
  fresh.best = world.best;
  fresh.screen = SCREEN_PLAY;
  Object.assign(world, fresh);
}

function spawnPattern(world) {
  const stage = stageFor(world.distanceM);
  const roll = world.rng();
  const baseX = TURKEY_X + 1280 + world.rng() * 120;
  if (roll < 0.16) {
    // Wing power-up floating at jump height, guarded by nothing.
    world.entities.push({ kind: KIND_WING, x: baseX, y: GROUND_Y - 190, w: 54, h: 44, active: true, vy: 0, hover: 0 });
  } else if (roll < 0.16 + stage.knifeChance) {
    // Carving knife: hovers, glints, then plunges where the turkey is headed.
    world.entities.push({ kind: KIND_KNIFE, x: baseX, y: -40, w: 34, h: 96, active: true, vy: 0, hover: 0.55, falling: false });
  } else if (roll < 0.62) {
    // Hot oven on the ground: jump it.
    world.entities.push({ kind: KIND_OVEN, x: baseX, y: GROUND_Y - 118, w: 100, h: 118, active: true, vy: 0, hover: 0 });
  } else {
    // Corn arc: three cobs, the middle one high enough to need a jump.
    const low = world.rng() < 0.5;
    for (let i = 0; i < 3; i += 1) {
      world.entities.push({
        kind: KIND_CORN, x: baseX + i * 62, y: low ? GROUND_Y - 56 - (i === 1 ? 96 : 0) : GROUND_Y - 150 - (i === 1 ? 60 : 0),
        w: 40, h: 40, active: true, vy: 0, hover: 0,
      });
    }
  }
  const gap = stage.spawnGap[0] + world.rng() * (stage.spawnGap[1] - stage.spawnGap[0]);
  world.nextSpawnM = world.distanceM + gap / PIXELS_PER_METER;
}

function overlaps(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function tryJump(world) {
  if (world.screen !== SCREEN_PLAY) return false;
  const t = world.turkey;
  if (t.onGround) {
    t.vy = PHYSICS.jumpVelocity;
    t.onGround = false;
    t.jumpsUsed = 1;
    return 'jump';
  }
  if (t.winged > 0 && t.jumpsUsed < 2) {
    t.vy = PHYSICS.doubleJumpVelocity;
    t.jumpsUsed = 2;
    t.winged -= 1;
    return 'double';
  }
  return false;
}

// Advance the world by dt seconds. Returns a list of events for sounds/HUD.
export function stepWorld(world, dt) {
  const events = [];
  if (world.screen !== SCREEN_PLAY) return events;
  world.time += dt;
  const t = world.turkey;

  // Speed grows with distance; a fresh hit slows the turkey briefly.
  const targetSpeed = Math.min(PHYSICS.maxSpeed, PHYSICS.baseSpeed + world.distanceM * PHYSICS.speedPerMeter);
  world.speed = world.time < world.slowUntil ? targetSpeed * 0.55 : targetSpeed;
  const dx = world.speed * dt;
  world.scrollX += dx;
  world.distanceM = world.scrollX / PIXELS_PER_METER;
  world.score += (dx / PIXELS_PER_METER) * SCORE.perMeter;
  t.runPhase += dt * (world.speed / 40);

  // Turkey vertical physics.
  t.vy += PHYSICS.gravity * dt;
  t.y += t.vy * dt;
  if (t.y >= GROUND_Y) {
    t.y = GROUND_Y;
    t.vy = 0;
    t.onGround = true;
    t.jumpsUsed = 0;
  } else {
    t.onGround = false;
  }

  // The farmer gains when the turkey is hurt, recovers slowly otherwise.
  if (world.time >= world.invulnerableUntil) {
    world.farmerGap = Math.min(PHYSICS.farmerMaxGap, world.farmerGap + PHYSICS.gapRecoverPerSecond * dt);
  }

  // Spawn ahead.
  if (world.distanceM >= world.nextSpawnM) spawnPattern(world);

  // Move entities, fall knives, collect and collide.
  const tx = TURKEY_X;
  const ty = t.y - TURKEY_H;
  const vulnerable = world.time >= world.invulnerableUntil;
  for (const e of world.entities) {
    if (!e.active) continue;
    e.x -= dx;
    if (e.kind === KIND_KNIFE) {
      if (!e.falling) {
        e.hover -= dt;
        if (e.hover <= 0) e.falling = true;
      } else {
        e.vy += 4200 * dt;
        e.y += e.vy * dt;
      }
      if (e.y > GROUND_Y + 40) e.active = false;
    }
    if (e.kind === KIND_WING) e.hover += dt;
    if (e.x + e.w < -80) { e.active = false; continue; }
    const hitBoxPad = e.kind === KIND_OVEN ? 10 : 4;
    if (overlaps(tx + 8, ty + 6, TURKEY_W - 16, TURKEY_H - 10, e.x + hitBoxPad, e.y + hitBoxPad, e.w - hitBoxPad * 2, e.h - hitBoxPad * 2)) {
      if (e.kind === KIND_CORN) {
        e.active = false;
        world.corn += 1;
        world.score += SCORE.perCorn;
        events.push('corn');
      } else if (e.kind === KIND_WING) {
        e.active = false;
        t.winged = Math.min(2, t.winged + 1);
        world.score += SCORE.perWing;
        events.push('wing');
      } else if (vulnerable) {
        world.hearts -= 1;
        world.invulnerableUntil = world.time + PHYSICS.invulnerableSeconds;
        world.slowUntil = world.time + 0.8;
        world.farmerGap -= PHYSICS.hitGapLoss;
        events.push('hit');
        if (e.kind === KIND_KNIFE) e.active = false;
      }
    }
  }
  world.entities = world.entities.filter((e) => e.active);

  // Caught: no hearts left, or the farmer closes the gap.
  if (world.hearts <= 0 || world.farmerGap <= PHYSICS.farmerCatchGap) {
    world.screen = SCREEN_OVER;
    world.overReason = 'caught';
    world.best = Math.max(world.best, world.score);
    events.push('caught');
    return events;
  }
  // Escaped: survived the whole 1500 m to the woods.
  if (world.distanceM >= ESCAPE_DISTANCE_M) {
    world.screen = SCREEN_OVER;
    world.overReason = 'escaped';
    world.score += SCORE.escapeBonus;
    world.best = Math.max(world.best, world.score);
    events.push('escaped');
    return events;
  }
  return events;
}

export function turkeyBox(world) {
  return { x: TURKEY_X, y: world.turkey.y - TURKEY_H, w: TURKEY_W, h: TURKEY_H };
}
