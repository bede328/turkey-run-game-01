// Turkey Run — staged screenshot scenes behind ?shot=title|play|jump|end.
// Each scene plays the real simulation forward from a fresh world for a fixed
// number of steps, steered by a simple autopilot (jump when an oven is close),
// so every frame is what a real game looks like and the same seed always
// gives the same frame. The cover (play) is topped up with one oven, one
// falling knife and a corn arc so the busiest moment is on screen at once.
import { GROUND_Y } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, createWorld, startRun, stepWorld, tryJump } from './world.js';

const STEP = 1 / 60;

function nearestOvenAhead(world) {
  let best = null;
  for (const e of world.entities) {
    if (!e.active || e.kind !== 'oven') continue;
    const gap = e.x - 300;
    if (gap > 0 && gap < 170 && (best === null || gap < best.x - 300)) best = e;
  }
  return best;
}

function autopilot(world) {
  const t = world.turkey;
  if (t.onGround && nearestOvenAhead(world)) tryJump(world);
}

function runSeconds(world, seconds, pilot, keepAlive = false) {
  const steps = Math.round(seconds / STEP);
  for (let i = 0; i < steps; i += 1) {
    if (world.screen !== SCREEN_PLAY) break;
    if (pilot) autopilot(world);
    stepWorld(world, STEP);
    if (keepAlive && world.screen === SCREEN_PLAY) {
      if (world.hearts < 3) world.hearts = 3;
      if (world.farmerGap < 150) world.farmerGap = 150;
    }
  }
}

// Set `world` to the named scene and return the screen to draw.
export function stageShot(name, seed = 20261127) {
  const world = createWorld(seed);
  world.best = 2450;
  if (name === 'title') {
    startRun(world);
    runSeconds(world, 5, true, true);
    world.entities = [];
    world.screen = SCREEN_TITLE;
    return world;
  }
  if (name === 'jump') {
    startRun(world);
    runSeconds(world, 9, true, true);
    // Freeze the turkey mid-air over an oven, a knife plunging nearby.
    world.turkey.y = GROUND_Y - 170;
    world.turkey.vy = -220;
    world.turkey.onGround = false;
    world.entities.push({ kind: 'oven', x: 330, y: GROUND_Y - 118, w: 100, h: 118, active: true, vy: 0, hover: 0 });
    world.entities.push({ kind: 'knife', x: 830, y: 120, w: 34, h: 96, active: true, vy: 500, hover: 0, falling: true });
    world.entities.push({ kind: 'corn', x: 620, y: GROUND_Y - 150, w: 40, h: 40, active: true, vy: 0, hover: 0 });
    world.entities.push({ kind: 'corn', x: 682, y: GROUND_Y - 210, w: 40, h: 40, active: true, vy: 0, hover: 0 });
    world.screen = SCREEN_PLAY;
    return world;
  }
  if (name === 'end') {
    startRun(world);
    // No jumps at all: the turkey trips on the ovens until the farmer catches it.
    runSeconds(world, 600, false);
    if (world.screen !== SCREEN_OVER) {
      world.hearts = 0;
      world.screen = SCREEN_OVER;
      world.overReason = 'caught';
    }
    return world;
  }
  // 'play' (and anything else): a busy mid-run frame, the cover.
  startRun(world);
  runSeconds(world, 16, true, true);
  world.entities.push({ kind: 'oven', x: 690, y: GROUND_Y - 118, w: 100, h: 118, active: true, vy: 0, hover: 0 });
  world.entities.push({ kind: 'knife', x: 980, y: 60, w: 34, h: 96, active: true, vy: 420, hover: 0, falling: true });
  world.entities.push({ kind: 'corn', x: 520, y: GROUND_Y - 56, w: 40, h: 40, active: true, vy: 0, hover: 0 });
  world.entities.push({ kind: 'corn', x: 582, y: GROUND_Y - 152, w: 40, h: 40, active: true, vy: 0, hover: 0 });
  world.entities.push({ kind: 'corn', x: 644, y: GROUND_Y - 56, w: 40, h: 40, active: true, vy: 0, hover: 0 });
  world.entities.push({ kind: 'wing', x: 1120, y: GROUND_Y - 190, w: 54, h: 44, active: true, vy: 0, hover: 0.4 });
  world.screen = SCREEN_PLAY;
  return world;
}

export { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE };
