// Turkey Run — entry point: canvas setup, game loop, screen flow, sounds.
// ?shot=title|play|jump|end stages one deterministic frame for screenshots;
// ?seed=N picks the run's seed. Otherwise the game plays live.
import { VIEW } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, createWorld, startRun, stepWorld, tryJump } from './world.js';
import { END_BUTTON, TITLE_BUTTON, render } from './render.js';
import { createInput } from './input.js';
import { ensureAudio, isMuted, playCaught, playClick, playCorn, playDoubleJump, playEscape, playHit, playJump, playWing, toggleMute } from './audio.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const params = new URLSearchParams(location.search);
const seed = Number(params.get('seed') || 20261127) || 20261127;

function fitCanvas() {
  const scale = Math.min(window.innerWidth / VIEW.width, window.innerHeight / VIEW.height);
  canvas.style.width = `${Math.floor(VIEW.width * scale)}px`;
  canvas.style.height = `${Math.floor(VIEW.height * scale)}px`;
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

function announce(world) {
  const line = world.screen === SCREEN_TITLE
    ? 'Turkey Run. Press Enter or click to start running from the farmer.'
    : world.screen === SCREEN_OVER
      ? `${world.overReason === 'escaped' ? 'Escaped!' : 'Caught!'} Score ${Math.floor(world.score)}, distance ${Math.floor(world.distanceM)} meters. Press Enter to run again.`
      : `Score ${Math.floor(world.score)}, ${Math.floor(world.distanceM)} meters, ${world.hearts} lives.`;
  if (status.textContent !== line) status.textContent = line;
}

function playEvents(events) {
  for (const e of events) {
    if (e === 'corn') playCorn();
    else if (e === 'wing') playWing();
    else if (e === 'hit') playHit();
    else if (e === 'caught') playCaught();
    else if (e === 'escaped') playEscape();
  }
}

// Staged screenshot mode: one deterministic frame, no loop.
const shot = params.get('shot');
if (shot) {
  const world = stageShot(shot, seed);
  render(ctx, world, false);
  announce(world);
  window.__shotWorld = world;
} else {
  const world = createWorld(seed);
  let paused = false;
  let last = performance.now();

  function frame(now) {
    const dt = Math.min(1 / 30, Math.max(0, (now - last) / 1000));
    last = now;
    if (!paused && world.screen === SCREEN_PLAY) playEvents(stepWorld(world, dt));
    render(ctx, world, paused);
    announce(world);
    requestAnimationFrame(frame);
  }

  function start() {
    ensureAudio();
    playClick();
    startRun(world);
    paused = false;
  }

  createInput(canvas, {
    onJump() {
      ensureAudio();
      if (world.screen !== SCREEN_PLAY || paused) return;
      const result = tryJump(world);
      if (result === 'jump') playJump();
      else if (result === 'double') playDoubleJump();
    },
    onStart() {
      if (world.screen === SCREEN_TITLE || world.screen === SCREEN_OVER) start();
    },
    onMute() {
      const muted = toggleMute();
      if (status) status.textContent = muted ? 'Muted.' : 'Sound on.';
    },
    onPause() {
      if (world.screen === SCREEN_PLAY) paused = !paused;
    },
    onTap(nx, ny) {
      ensureAudio();
      const px = nx * VIEW.width;
      const py = ny * VIEW.height;
      if (world.screen === SCREEN_TITLE) {
        if (px >= TITLE_BUTTON.x && px <= TITLE_BUTTON.x + TITLE_BUTTON.w && py >= TITLE_BUTTON.y && py <= TITLE_BUTTON.y + TITLE_BUTTON.h) start();
        else start();
        return;
      }
      if (world.screen === SCREEN_OVER) {
        if (px >= END_BUTTON.x && px <= END_BUTTON.x + END_BUTTON.w && py >= END_BUTTON.y && py <= END_BUTTON.y + END_BUTTON.h) start();
        return;
      }
      if (paused) { paused = false; return; }
      const result = tryJump(world);
      if (result === 'jump') playJump();
      else if (result === 'double') playDoubleJump();
    },
  });

  requestAnimationFrame(frame);
}
