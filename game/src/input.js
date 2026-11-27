// Turkey Run — keyboard + mouse input. One job: turn presses into intents.
// Space / ArrowUp / W: jump (twice = double jump with wings). Click / tap: same.
// Enter: start / restart. M: mute. P: pause.
export const KEYS = { jump: ['Space', 'ArrowUp', 'KeyW'], start: ['Enter', 'Space'], mute: ['KeyM'], pause: ['KeyP'] };

export function createInput(canvas, handlers) {
  const pressed = new Set();
  function onKeyDown(event) {
    if (event.repeat) return;
    pressed.add(event.code);
    if (KEYS.jump.includes(event.code)) { event.preventDefault(); handlers.onJump(); }
    else if (KEYS.start.includes(event.code)) { handlers.onStart(); }
    else if (KEYS.mute.includes(event.code)) { handlers.onMute(); }
    else if (KEYS.pause.includes(event.code)) { handlers.onPause(); }
  }
  function onKeyUp(event) { pressed.delete(event.code); }
  function onPointer(event) {
    const rect = canvas.getBoundingClientRect();
    handlers.onTap((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
  }
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('pointerdown', onPointer);
  return {
    destroy() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('pointerdown', onPointer);
    },
  };
}
