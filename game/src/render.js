// Turkey Run — all canvas drawing: farm-to-kitchen scenery, turkey, farmer,
// ovens, knives, corn, HUD, title and end screens. No images, no assets.
import { GROUND_Y, VIEW, stageFor } from './config.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function heart(ctx, x, y, s, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.35);
  ctx.bezierCurveTo(x - s, y - s * 0.45, x - s * 0.45, y - s, x, y - s * 0.35);
  ctx.bezierCurveTo(x + s * 0.45, y - s, x + s, y - s * 0.45, x, y + s * 0.35);
  ctx.closePath();
  ctx.fill();
}

function drawSky(ctx, world) {
  const stage = stageFor(world.distanceM);
  const g = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  g.addColorStop(0, stage.sky[0]);
  g.addColorStop(1, stage.sky[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW.width, GROUND_Y);
  // Low autumn sun.
  ctx.fillStyle = '#fff3b0';
  ellipse(ctx, 1080, 110, 58, 58);
  ctx.fillStyle = '#ffd23f';
  ellipse(ctx, 1080, 110, 46, 46);
  // Drifting clouds (positions from scroll, so they parallax).
  ctx.fillStyle = 'rgba(255,244,214,0.85)';
  for (let i = 0; i < 4; i += 1) {
    const cx = ((i * 360 - world.scrollX * 0.15) % 1400 + 1400) % 1400 - 60;
    const cy = 70 + i * 42;
    ellipse(ctx, cx, cy, 66, 20);
    ellipse(ctx, cx + 42, cy + 6, 48, 16);
    ellipse(ctx, cx - 44, cy + 8, 40, 14);
  }
}

function drawScenery(ctx, world) {
  const stage = stageFor(world.distanceM);
  // Distant barn (farmyard/barn) or kitchen window (kitchen stage).
  ctx.save();
  ctx.globalAlpha = 0.9;
  if (stage.name === 'KITCHEN') {
    ctx.fillStyle = '#5d1f14';
    ctx.fillRect(880, 300, 330, 300);
    ctx.fillStyle = '#ffd98a';
    for (let i = 0; i < 3; i += 1) ctx.fillRect(910 + i * 100, 340, 64, 90);
    ctx.fillStyle = '#3d130c';
    ctx.fillRect(1010, 430, 70, 170);
  } else {
    ctx.fillStyle = '#a63d2f';
    ctx.fillRect(880, 330, 300, 270);
    ctx.beginPath();
    ctx.moveTo(860, 332); ctx.lineTo(1030, 220); ctx.lineTo(1200, 332); ctx.closePath();
    ctx.fillStyle = '#7e2c22';
    ctx.fill();
    ctx.fillStyle = '#5d1f14';
    ctx.fillRect(990, 460, 80, 140);
    ctx.fillStyle = '#ffd98a';
    ctx.fillRect(910, 380, 56, 56);
    ctx.fillRect(1090, 380, 56, 56);
  }
  ctx.restore();
  // Fence posts scrolling by.
  ctx.fillStyle = '#7a4a22';
  for (let i = 0; i < 9; i += 1) {
    const fx = ((i * 180 - world.scrollX * 0.6) % 1440 + 1440) % 1440 - 80;
    ctx.fillRect(fx, GROUND_Y - 78, 14, 78);
  }
  ctx.fillRect(0, GROUND_Y - 62, VIEW.width, 10);
  ctx.fillRect(0, GROUND_Y - 34, VIEW.width, 8);
  // Pumpkins and hay bales on the ground.
  for (let i = 0; i < 6; i += 1) {
    const px = ((i * 260 + 90 - world.scrollX * 0.85) % 1400 + 1400) % 1400 - 70;
    ctx.fillStyle = '#e86a17';
    ellipse(ctx, px, GROUND_Y - 16, 26, 20);
    ctx.fillStyle = '#3f7a2a';
    ctx.fillRect(px - 3, GROUND_Y - 42, 6, 12);
    ctx.fillStyle = '#d9a441';
    ellipse(ctx, px + 150, GROUND_Y - 14, 34, 16);
  }
}

function drawGround(ctx, world) {
  const stage = stageFor(world.distanceM);
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, GROUND_Y, VIEW.width, VIEW.height - GROUND_Y);
  ctx.fillStyle = stage.grass;
  ctx.fillRect(0, GROUND_Y, VIEW.width, 16);
  // Dirt speckles scrolling with the world.
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let i = 0; i < 40; i += 1) {
    const sx = ((i * 173 - world.scrollX) % 1400 + 1400) % 1400 - 60;
    const sy = GROUND_Y + 26 + ((i * 37) % 80);
    ellipse(ctx, sx, sy, 7, 4);
  }
}

function drawTurkey(ctx, world, x, feetY, scale, running) {
  const t = world.turkey;
  const s = scale;
  ctx.save();
  ctx.translate(x, feetY);
  ctx.scale(s, s);
  if (world.time < world.invulnerableUntil && world.screen === 'play') ctx.globalAlpha = 0.55 + 0.35 * Math.sin(world.time * 30);
  const legSwing = running ? Math.sin(t.runPhase * 2) * 10 : 0;
  // Tail fan: five autumn feathers.
  const featherColors = ['#c0392b', '#e67e22', '#f1c40f', '#d35400', '#922b21'];
  for (let i = 0; i < 5; i += 1) {
    const a = (-0.9 + i * 0.45) - Math.PI / 2;
    ctx.save();
    ctx.translate(-14, -46);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillStyle = featherColors[i];
    ellipse(ctx, 0, -26, 11, 26);
    ctx.fillStyle = '#fdebd0';
    ellipse(ctx, 0, -38, 4, 7);
    ctx.restore();
  }
  // Legs.
  ctx.strokeStyle = '#e67e22';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, -16); ctx.lineTo(-6 + legSwing, 0);
  ctx.moveTo(6, -16); ctx.lineTo(6 - legSwing, 0);
  ctx.stroke();
  // Body.
  ctx.fillStyle = '#6b4423';
  ellipse(ctx, 0, -38, 30, 32);
  ctx.fillStyle = '#8a5a2b';
  ellipse(ctx, 4, -34, 22, 24);
  // Wing.
  ctx.fillStyle = '#5d3a1a';
  ctx.beginPath();
  ctx.ellipse(-4, -36, 18, 12, -0.5, 0, Math.PI * 2);
  ctx.fill();
  // Head + beak + wattle.
  ctx.fillStyle = '#8a5a2b';
  ellipse(ctx, 22, -72, 15, 15);
  ctx.fillStyle = '#f39c12';
  ctx.beginPath();
  ctx.moveTo(34, -76); ctx.lineTo(48, -70); ctx.lineTo(34, -64); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c0392b';
  ellipse(ctx, 30, -60, 5, 9);
  ctx.fillStyle = '#fff';
  ellipse(ctx, 26, -76, 4, 4);
  ctx.fillStyle = '#1a1a1a';
  ellipse(ctx, 27, -76, 2, 2);
  // Panic sweat drop when the farmer is close.
  if (world.farmerGap < 120) {
    ctx.fillStyle = '#7fd4ff';
    ellipse(ctx, 10, -92, 4, 6);
  }
  ctx.restore();
}

function drawFarmer(ctx, world) {
  const gap = world.farmerGap;
  const x = 300 - gap - 46;
  const feetY = GROUND_Y;
  const bob = Math.abs(Math.sin(world.turkey.runPhase * 2)) * 4;
  ctx.save();
  ctx.translate(x, feetY - bob);
  // Legs (blue overalls).
  ctx.strokeStyle = '#2c4a7a';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  const swing = Math.sin(world.turkey.runPhase * 2) * 12;
  ctx.beginPath();
  ctx.moveTo(-6, -34); ctx.lineTo(-6 + swing, 0);
  ctx.moveTo(6, -34); ctx.lineTo(6 - swing, 0);
  ctx.stroke();
  // Body: red plaid shirt.
  ctx.fillStyle = '#b03a2e';
  rr(ctx, -24, -78, 48, 48, 10);
  ctx.fill();
  ctx.strokeStyle = '#7b241c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-24, -62); ctx.lineTo(24, -62);
  ctx.moveTo(-24, -46); ctx.lineTo(24, -46);
  ctx.moveTo(-6, -78); ctx.lineTo(-6, -30);
  ctx.moveTo(10, -78); ctx.lineTo(10, -30);
  ctx.stroke();
  // Reaching arms.
  ctx.strokeStyle = '#b03a2e';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(18, -70); ctx.lineTo(46, -78);
  ctx.moveTo(18, -58); ctx.lineTo(44, -58);
  ctx.stroke();
  ctx.fillStyle = '#f5c99b';
  ellipse(ctx, 48, -78, 6, 6);
  ellipse(ctx, 46, -58, 6, 6);
  // Head, angry brows, straw hat.
  ctx.fillStyle = '#f5c99b';
  ellipse(ctx, 0, -92, 17, 17);
  ctx.fillStyle = '#e8c33a';
  ctx.beginPath();
  ctx.ellipse(0, -102, 30, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-14, -122, 28, 20);
  ctx.fillStyle = '#1a1a1a';
  ellipse(ctx, -6, -94, 2.5, 2.5);
  ellipse(ctx, 6, -94, 2.5, 2.5);
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-11, -100); ctx.lineTo(-2, -97);
  ctx.moveTo(11, -100); ctx.lineTo(2, -97);
  ctx.moveTo(-6, -82); ctx.lineTo(6, -82);
  ctx.stroke();
  ctx.restore();
  // "HE'S COMING!" warning when the gap is small.
  if (gap < 130 && world.screen === 'play') {
    ctx.fillStyle = '#c0392b';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DIA MENDEKAT!', x + 10, GROUND_Y - 150);
  }
}

function drawOven(ctx, e) {
  ctx.save();
  ctx.translate(e.x, e.y);
  // Chimney + smoke.
  ctx.fillStyle = '#4a4a4a';
  ctx.fillRect(62, -26, 22, 30);
  ctx.fillStyle = 'rgba(220,220,220,0.7)';
  ellipse(ctx, 73, -40, 12, 8);
  ellipse(ctx, 78, -56, 15, 9);
  // Body.
  ctx.fillStyle = '#5d6d7e';
  rr(ctx, 0, 0, 100, 118, 8);
  ctx.fill();
  ctx.fillStyle = '#2e4053';
  rr(ctx, 8, 8, 84, 20, 6);
  ctx.fill();
  // Door window with fire.
  ctx.fillStyle = '#1a1a1a';
  rr(ctx, 14, 38, 72, 56, 8);
  ctx.fill();
  ctx.fillStyle = '#ff7b00';
  ctx.beginPath();
  ctx.moveTo(30, 86); ctx.quadraticCurveTo(28, 62, 42, 52); ctx.quadraticCurveTo(46, 66, 54, 56);
  ctx.quadraticCurveTo(62, 68, 58, 86); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath();
  ctx.moveTo(38, 86); ctx.quadraticCurveTo(40, 70, 50, 66); ctx.quadraticCurveTo(56, 76, 54, 86); ctx.closePath(); ctx.fill();
  // Knobs + HOT label.
  ctx.fillStyle = '#f5f5f5';
  ellipse(ctx, 26, 18, 5, 5);
  ellipse(ctx, 50, 18, 5, 5);
  ellipse(ctx, 74, 18, 5, 5);
  ctx.fillStyle = '#ffdf00';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HOT!', 50, 112);
  ctx.restore();
}

function drawKnife(ctx, e) {
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
  ctx.rotate(0.5);
  // Blade.
  ctx.fillStyle = '#dfe6e9';
  ctx.beginPath();
  ctx.moveTo(-8, -48); ctx.lineTo(8, -48); ctx.lineTo(8, 18); ctx.lineTo(0, 34); ctx.lineTo(-8, 18); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#b2bec3';
  ctx.beginPath();
  ctx.moveTo(-8, -48); ctx.lineTo(-2, -48); ctx.lineTo(-2, 18); ctx.lineTo(-8, 18); ctx.closePath();
  ctx.fill();
  // Handle.
  ctx.fillStyle = '#6b4423';
  rr(ctx, -9, -72, 18, 26, 6);
  ctx.fill();
  ctx.fillStyle = '#f5f5f5';
  ellipse(ctx, -4, -60, 2, 2);
  ellipse(ctx, 4, -60, 2, 2);
  ctx.restore();
  // Telegraph: red marker on the ground + dashed fall line while it hovers.
  if (!e.falling) {
    ctx.save();
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(performance.now() / 90);
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.moveTo(e.x + e.w / 2, GROUND_Y - 8);
    ctx.lineTo(e.x + e.w / 2 - 16, GROUND_Y + 18);
    ctx.lineTo(e.x + e.w / 2 + 16, GROUND_Y + 18);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(192,57,43,0.6)';
    ctx.setLineDash([8, 8]);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(e.x + e.w / 2, e.y + e.h);
    ctx.lineTo(e.x + e.w / 2, GROUND_Y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
}

function drawCorn(ctx, e) {
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
  ctx.rotate(Math.sin(e.x * 0.05) * 0.15);
  ctx.fillStyle = '#f1c40f';
  ellipse(ctx, 0, 0, 13, 18);
  ctx.fillStyle = '#d4a017';
  for (let r = -1; r <= 1; r += 1) for (let c = -1; c <= 1; c += 1) ellipse(ctx, c * 7, r * 10, 2.5, 2.5);
  ctx.fillStyle = '#27ae60';
  ctx.beginPath();
  ctx.moveTo(-12, 6); ctx.quadraticCurveTo(-22, 22, -10, 26); ctx.quadraticCurveTo(-6, 14, -12, 6); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(12, 6); ctx.quadraticCurveTo(22, 22, 10, 26); ctx.quadraticCurveTo(6, 14, 12, 6); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawWing(ctx, e) {
  const bob = Math.sin(e.hover * 4) * 6;
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h / 2 + bob);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ellipse(ctx, 0, 0, 34, 30);
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.ellipse(-8 + i * 9, -4 + i * 4, 16, 7, -0.6 + i * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#2c3e50';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('x2 JUMP', 0, 26);
  ctx.restore();
}

function drawHud(ctx, world) {
  const stage = stageFor(world.distanceM);
  ctx.fillStyle = 'rgba(20,10,4,0.55)';
  rr(ctx, 16, 12, 1248, 64, 12);
  ctx.fill();
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText(`SKOR ${Math.floor(world.score)}`, 34, 52);
  ctx.font = 'bold 22px sans-serif';
  ctx.fillStyle = '#ffd23f';
  ctx.fillText(`JAGUNG x${world.corn}`, 300, 50);
  // Hearts.
  for (let i = 0; i < 3; i += 1) heart(ctx, 520 + i * 44, 44, 15, i < world.hearts ? '#e74c3c' : 'rgba(255,255,255,0.25)');
  // Stage + distance progress.
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`${stage.name}  •  ${Math.floor(world.distanceM)} m / 1500 m`, 860, 38);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  rr(ctx, 700, 50, 320, 12, 6);
  ctx.fill();
  ctx.fillStyle = '#2ecc71';
  rr(ctx, 700, 50, Math.max(8, 320 * Math.min(1, world.distanceM / 1500)), 12, 6);
  ctx.fill();
  ctx.textAlign = 'right';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillStyle = '#fff';
  ctx.fillText(world.turkey.winged > 0 ? `SAYAP x${world.turkey.winged}` : 'M = mute', 1246, 50);
  ctx.textAlign = 'left';
}

function drawTitle(ctx, world) {
  ctx.fillStyle = 'rgba(20,10,4,0.45)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  // Big title.
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd23f';
  ctx.strokeStyle = '#7a2d1d';
  ctx.lineWidth = 10;
  ctx.font = 'bold 96px sans-serif';
  ctx.strokeText('TURKEY RUN', 640, 150);
  ctx.fillText('TURKEY RUN', 640, 150);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText('Kabur dari Thanksgiving!', 640, 205);
  // Hero turkey + farmer peeking.
  drawTurkey(ctx, world, 640, 470, 1.6, false);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('SPACE / KLIK — lompat   •   sayap = lompat ganda', 640, 540);
  ctx.fillText('Hindari OVEN panas & PISAU ukir  •  Kumpulkan JAGUNG', 640, 578);
  ctx.fillStyle = '#ffd23f';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('Jangan sampai petani menangkapmu — lari 1500 m sampai hutan!', 640, 616);
  // Start button.
  ctx.fillStyle = '#27ae60';
  rr(ctx, 490, 636, 300, 56, 14);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('▶  MULAI LARI', 640, 674);
  if (world.best > 0) {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`Skor terbaik: ${Math.floor(world.best)}`, 640, 30);
  }
  ctx.textAlign = 'left';
}

function drawEnd(ctx, world) {
  ctx.fillStyle = 'rgba(20,10,4,0.6)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  const escaped = world.overReason === 'escaped';
  ctx.textAlign = 'center';
  ctx.fillStyle = escaped ? '#2ecc71' : '#e74c3c';
  ctx.strokeStyle = '#2b1608';
  ctx.lineWidth = 10;
  ctx.font = 'bold 88px sans-serif';
  const title = escaped ? 'LOLOS!' : 'KETANGKAP!';
  ctx.strokeText(title, 640, 170);
  ctx.fillText(title, 640, 170);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText(escaped ? 'Kamu kabur ke hutan — Thanksgiving batal tahun ini!' : 'Petani berhasil menangkapmu... jadi santapan Thanksgiving.', 640, 225);
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText(`SKOR AKHIR: ${Math.floor(world.score)}`, 640, 300);
  ctx.font = '26px sans-serif';
  ctx.fillText(`Jarak: ${Math.floor(world.distanceM)} m   •   Jagung: ${world.corn}   •   Terbaik: ${Math.floor(world.best)}`, 640, 345);
  ctx.fillStyle = '#27ae60';
  rr(ctx, 470, 400, 340, 60, 14);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('LARI LAGI (ENTER)', 640, 439);
  ctx.font = '22px sans-serif';
  ctx.fillStyle = '#ffd23f';
  ctx.fillText('Tip: lompat lebih awal di depan oven, jangan diam di bawah pisau!', 640, 500);
  ctx.textAlign = 'left';
}

function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(20,10,4,0.55)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 64px sans-serif';
  ctx.fillText('JEDA (P)', 640, 360);
  ctx.textAlign = 'left';
}

// One frame: scenery + entities + actor + HUD + screen overlays.
export function render(ctx, world, paused = false) {
  ctx.clearRect(0, 0, VIEW.width, VIEW.height);
  drawSky(ctx, world);
  drawScenery(ctx, world);
  drawGround(ctx, world);
  for (const e of world.entities) {
    if (!e.active) continue;
    if (e.kind === 'oven') drawOven(ctx, e);
    else if (e.kind === 'knife') drawKnife(ctx, e);
    else if (e.kind === 'corn') drawCorn(ctx, e);
    else if (e.kind === 'wing') drawWing(ctx, e);
  }
  if (world.screen !== 'title') drawFarmer(ctx, world);
  const running = world.screen === 'play' && world.turkey.onGround;
  // Title screen draws its own big hero turkey in drawTitle; skip the runner there.
  if (world.screen !== 'title') drawTurkey(ctx, world, 300, world.turkey.y, 1, running);
  if (world.screen === 'play' || world.screen === 'over') drawHud(ctx, world);
  if (world.screen === 'title') drawTitle(ctx, world);
  if (world.screen === 'over') drawEnd(ctx, world);
  if (paused) drawPaused(ctx);
}

export const TITLE_BUTTON = { x: 490, y: 636, w: 300, h: 56 };
export const END_BUTTON = { x: 470, y: 400, w: 340, h: 60 };
