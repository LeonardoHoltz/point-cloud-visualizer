import * as THREE from 'three';

// Camera and event-driven controls (WASD + Space/Ctrl + right-click rotation)
// This module dispatches a 'cameraChanged' CustomEvent on window whenever the camera changes.
export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);
camera.rotation.order = 'YXZ'; // yaw (Y) then pitch (X)

const moveState = { forward: false, backward: false, left: false, right: false, up: false, down: false, boost: false };
let rotating = false;
let prevMouse = { x: 0, y: 0 };
let yaw = 0;
let pitch = 0;

const sensitivity = 0.0025;
const speedBase = 3.0;
const boostMultiplier = 3.0;

let rafId = null;
let lastTime = 0;

function dispatchCameraChanged() {
  window.dispatchEvent(new CustomEvent('cameraChanged', { detail: { camera } }));
}

function anyMovementActive() {
  return moveState.forward || moveState.backward || moveState.left || moveState.right || moveState.up || moveState.down || moveState.boost || rotating;
}

function startLoop() {
  if (rafId !== null) return;
  lastTime = performance.now();
  rafId = requestAnimationFrame(loop);
}

function stopLoop() {
  if (rafId === null) return;
  cancelAnimationFrame(rafId);
  rafId = null;
}

function loop(t) {
  const delta = Math.min(0.1, (t - lastTime) / 1000); // clamp for big deltas
  lastTime = t;
  updateCamera(delta);
  if (anyMovementActive()) {
    rafId = requestAnimationFrame(loop);
  } else {
    rafId = null;
  }
}

function updateCamera(delta) {
  const moveSpeed = speedBase * (moveState.boost ? boostMultiplier : 1.0);

  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  const right = new THREE.Vector3();
  right.crossVectors(forward, camera.up).normalize();

  const velocity = new THREE.Vector3();
  if (moveState.forward) velocity.add(forward);
  if (moveState.backward) velocity.sub(forward);
  if (moveState.right) velocity.add(right);
  if (moveState.left) velocity.sub(right);
  if (moveState.up) velocity.y += 1;
  if (moveState.down) velocity.y -= 1;

  if (velocity.lengthSq() > 0) {
    velocity.normalize().multiplyScalar(moveSpeed * delta);
    camera.position.add(velocity);
    dispatchCameraChanged();
  }
}

// Keyboard handling
window.addEventListener('keydown', (e) => {
  let changed = false;
  switch (e.code) {
    case 'KeyW': if (!moveState.forward) { moveState.forward = true; changed = true; } break;
    case 'KeyS': if (!moveState.backward) { moveState.backward = true; changed = true; } break;
    case 'KeyA': if (!moveState.left) { moveState.left = true; changed = true; } break;
    case 'KeyD': if (!moveState.right) { moveState.right = true; changed = true; } break;
    case 'Space': if (!moveState.up) { moveState.up = true; changed = true; } break;
    case 'ShiftLeft': case 'ShiftRight': if (!moveState.boost) { moveState.boost = true; changed = true; } break;
    case 'ControlLeft': case 'ControlRight': if (!moveState.down) { moveState.down = true; changed = true; } break;
  }
  if (changed) startLoop();
});
window.addEventListener('keyup', (e) => {
  let changed = false;
  switch (e.code) {
    case 'KeyW': if (moveState.forward) { moveState.forward = false; changed = true; } break;
    case 'KeyS': if (moveState.backward) { moveState.backward = false; changed = true; } break;
    case 'KeyA': if (moveState.left) { moveState.left = false; changed = true; } break;
    case 'KeyD': if (moveState.right) { moveState.right = false; changed = true; } break;
    case 'Space': if (moveState.up) { moveState.up = false; changed = true; } break;
    case 'ShiftLeft': case 'ShiftRight': if (moveState.boost) { moveState.boost = false; changed = true; } break;
    case 'ControlLeft': case 'ControlRight': if (moveState.down) { moveState.down = false; changed = true; } break;
  }
  if (changed && !anyMovementActive()) stopLoop();
});

// Mouse handling for right-button rotation
window.addEventListener('contextmenu', (e) => e.preventDefault());
window.addEventListener('mousedown', (e) => {
  if (e.button === 2) { // right button
    rotating = true;
    prevMouse.x = e.clientX;
    prevMouse.y = e.clientY;
    startLoop();
  }
});
window.addEventListener('mouseup', (e) => {
  if (e.button === 2) {
    rotating = false;
    if (!anyMovementActive()) stopLoop();
  }
});
window.addEventListener('mousemove', (e) => {
  if (!rotating) return;
  const dx = e.clientX - prevMouse.x;
  const dy = e.clientY - prevMouse.y;
  prevMouse.x = e.clientX;
  prevMouse.y = e.clientY;

  yaw -= dx * sensitivity;
  pitch -= dy * sensitivity;

  const maxPitch = Math.PI / 2 - 0.01;
  pitch = Math.max(-maxPitch, Math.min(maxPitch, pitch));

  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  dispatchCameraChanged();
});

// Resize handling: update camera projection and notify
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  dispatchCameraChanged();
});

// Export helper to programmatically trigger a camera update/render if needed
export function triggerCameraRender() {
  dispatchCameraChanged();
}