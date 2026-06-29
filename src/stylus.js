// Stylus support for Roughboard.
//
// Three things, all working around the fact that Excalidraw has no native
// stylus handling:
//
//  1. Pressure — already automatic (Excalidraw reads PointerEvent.pressure,
//     which the Android WebView supplies for pen input). No code needed.
//
//  2. Touch mode (cycled from the menu): "off" | "palm" | "only"
//       off  — stock behaviour, no interference.
//       palm — palm rejection: while a pen is active/just-lifted, finger touches
//              on the canvas are ignored (so a resting palm doesn't draw).
//       only — pen-only: finger never draws; instead one finger pans and two
//              fingers pinch-zoom, driven via the Excalidraw scene API.
//
//  3. Pen eraser tip — when the stylus reports its eraser end (Pointer Events
//     button 5 / buttons bit 0x20), switch to the eraser tool while it's in use
//     and restore the previous tool afterwards. Inert on devices that don't
//     report an eraser.
//
// We classify a pointer as a pen by pointerType === "pen" and a mouse by
// "mouse"; everything else (real "touch", or the empty pointerType some
// synthetic inputs report) is treated as touch.

const MODE_KEY = "roughboard:stylus-mode";
const ERASER_KEY = "roughboard:pen-eraser";
const MODES = ["off", "palm", "only"];

let mode = localStorage.getItem(MODE_KEY);
if (!MODES.includes(mode)) {
  // migrate the previous boolean palm-rejection setting
  mode = localStorage.getItem("roughboard:palm-rejection") === "false" ? "off" : "palm";
}
let eraserTip = localStorage.getItem(ERASER_KEY) !== "false";

let api = null;
export function setStylusApi(a) {
  api = a;
}

export function getStylusMode() {
  return mode;
}
export function cycleStylusMode() {
  mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    /* ignore */
  }
  resetGesture();
  return mode;
}
export function getEraserTip() {
  return eraserTip;
}
export function setEraserTip(value) {
  eraserTip = !!value;
  try {
    localStorage.setItem(ERASER_KEY, eraserTip ? "true" : "false");
  } catch {
    /* ignore */
  }
}

// --- shared pen tracking ---
let penActive = false;
let lastPenTs = -1e9;
const GRACE_MS = 300;

// --- pen-only finger gesture state ---
const touches = new Map();
let pinchPrevDist = 0;
let prevMidX = 0;
let prevMidY = 0;
function resetGesture() {
  touches.clear();
  pinchPrevDist = 0;
}

// --- eraser-tip state ---
let eraserEngaged = false;
let toolBeforeEraser = null;

function onCanvas(e) {
  return e.target && e.target.tagName === "CANVAS";
}
function block(e) {
  e.stopImmediatePropagation();
  e.preventDefault();
}

function panBy(dxScreen, dyScreen) {
  if (!api) return;
  const st = api.getAppState();
  const z = st.zoom?.value || 1;
  api.updateScene({
    appState: { scrollX: st.scrollX + dxScreen / z, scrollY: st.scrollY + dyScreen / z },
  });
}

function pinchZoom(midX, midY, dist) {
  if (!api || pinchPrevDist <= 0) return;
  const st = api.getAppState();
  const z0 = st.zoom?.value || 1;
  const offL = st.offsetLeft || 0;
  const offT = st.offsetTop || 0;
  const z1 = Math.max(0.1, Math.min(30, z0 * (dist / pinchPrevDist)));
  // Keep the scene point under the pinch midpoint fixed, and follow the
  // midpoint's translation.
  const scrollX = st.scrollX + (midX - offL) * (1 / z1 - 1 / z0) + (midX - prevMidX) / z1;
  const scrollY = st.scrollY + (midY - offT) * (1 / z1 - 1 / z0) + (midY - prevMidY) / z1;
  api.updateScene({ appState: { zoom: { value: z1 }, scrollX, scrollY } });
}

function handleOnlyTouch(e) {
  if (e.type === "pointerdown") {
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touches.size === 2) {
      const [a, b] = [...touches.values()];
      pinchPrevDist = Math.hypot(a.x - b.x, a.y - b.y);
      prevMidX = (a.x + b.x) / 2;
      prevMidY = (a.y + b.y) / 2;
    }
  } else if (e.type === "pointermove") {
    if (!touches.has(e.pointerId)) return;
    const prev = touches.get(e.pointerId);
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touches.size === 1) {
      panBy(e.clientX - prev.x, e.clientY - prev.y);
    } else if (touches.size >= 2) {
      const [a, b] = [...touches.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      pinchZoom(midX, midY, dist);
      pinchPrevDist = dist;
      prevMidX = midX;
      prevMidY = midY;
    }
  } else if (e.type === "pointerup" || e.type === "pointercancel") {
    touches.delete(e.pointerId);
    if (touches.size < 2) pinchPrevDist = 0;
  }
}

function isEraserSignal(e) {
  // Pointer Events: the stylus eraser reports button 5 / buttons bit 0x20.
  return e.pointerType === "pen" && (e.button === 5 || (e.buttons & 32) === 32);
}

function handleEraser(e) {
  if (!eraserTip || !api) return;
  const eraser = isEraserSignal(e);
  if (eraser && !eraserEngaged) {
    const active = api.getAppState().activeTool?.type || "selection";
    toolBeforeEraser = active === "eraser" ? "selection" : active;
    api.setActiveTool({ type: "eraser" });
    eraserEngaged = true;
  } else if (!eraser && eraserEngaged) {
    // pen flipped back to its tip — restore the previous tool
    api.setActiveTool({ type: toolBeforeEraser || "selection" });
    eraserEngaged = false;
    toolBeforeEraser = null;
  }
}

function onPointer(e) {
  if (e.pointerType === "pen") {
    if (e.type === "pointerdown") penActive = true;
    else if (e.type === "pointerup" || e.type === "pointercancel") penActive = false;
    lastPenTs = e.timeStamp;
    handleEraser(e);
    return; // never interfere with the pen itself
  }

  // Treat everything that isn't a pen or a mouse as touch.
  if (e.pointerType === "mouse" || mode === "off") return;

  if (mode === "palm") {
    const penInPlay = penActive || e.timeStamp - lastPenTs < GRACE_MS;
    if (penInPlay && onCanvas(e)) block(e);
    return;
  }

  // mode === "only": canvas touches drive pan/zoom and never reach Excalidraw.
  if (!onCanvas(e) && !touches.has(e.pointerId)) return; // let UI touches through
  handleOnlyTouch(e);
  block(e);
}

export function installStylusSupport() {
  const opts = { capture: true, passive: false };
  ["pointerdown", "pointermove", "pointerup", "pointercancel"].forEach((type) =>
    window.addEventListener(type, onPointer, opts)
  );
}
