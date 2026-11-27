# Turkey Run — Kabur dari Thanksgiving!

An original endless-runner turkey escape game for the make.fun
`turkey-run-game-01` bounty. A turkey sprints away from becoming
Thanksgiving dinner: the farmer chases from behind, hot ovens block the
path, carving knives plunge from above, and corn is worth points.

## How to play

- **Space / ↑ / click** — jump. Grab a wing power-up for a double jump.
- **Enter** — start / restart. **P** — pause. **M** — mute.
- Jump the ovens, don't stand under a falling knife, collect corn.
- Every hit costs a heart and lets the farmer close in. Lose all 3 hearts
  — or let the farmer catch you — and you're dinner.
- Survive **1500 m** through the farmyard, the barn and the kitchen to
  escape into the woods.

## Run it

```sh
node serve.ts        # serves game/ at http://localhost:8080
```

Or build the submission dossier:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Layout

- `game/index.html` — page shell, loads `src/main.js`
- `game/src/config.js` — tuning constants, stages, seeded RNG
- `game/src/world.js` — simulation: running, spawning, collisions, farmer
- `game/src/render.js` — all canvas art (drawn in code, no assets)
- `game/src/input.js` — keyboard + mouse
- `game/src/audio.js` — synthesized WebAudio sounds
- `game/src/shots.js` — deterministic staged scenes for screenshots
- `game/src/main.js` — entry point and game loop
- `screenshots/` — 4 real renders of the game (cover first)
- `main.ts` — copies game/ + screenshots/ to /output, writes dossier.json
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

All art is drawn in code on canvas. No external assets, no network requests.
