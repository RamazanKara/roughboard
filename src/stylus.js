// Stylus support: palm rejection.
//
// Excalidraw already draws pressure-sensitively from PointerEvent.pressure (the
// Android WebView delivers it for pen input), so variable-width strokes work
// out of the box. What it lacks is palm rejection: while you write with a
// stylus, a resting palm fires touch events that draw stray marks.
//
// This installs capture-phase pointer listeners that, while a pen is active (or
// just lifted), swallow finger/palm *touch* events on the drawing canvas before
// Excalidraw sees them. It only ever blocks `touch` pointers on a <canvas> while
// a pen is in play — finger drawing with no stylus present is untouched, and UI
// (toolbar, menus) is never affected.

const KEY = "roughboard:palm-rejection";

// Default ON: harmless for finger-only users (it never triggers without a pen).
let enabled = localStorage.getItem(KEY) !== "false";
let penActive = false;
let lastPenTs = -1e9;
const GRACE_MS = 300; // keep rejecting briefly after the pen lifts (trailing palm)

export function getPalmRejection() {
  return enabled;
}

export function setPalmRejection(value) {
  enabled = !!value;
  try {
    localStorage.setItem(KEY, enabled ? "true" : "false");
  } catch {
    /* ignore */
  }
}

function onPointer(event) {
  if (event.pointerType === "pen") {
    if (event.type === "pointerdown") penActive = true;
    else if (event.type === "pointerup" || event.type === "pointercancel")
      penActive = false;
    lastPenTs = event.timeStamp;
    return; // never interfere with the pen itself
  }

  if (!enabled || event.pointerType !== "touch") return;

  const penInPlay = penActive || event.timeStamp - lastPenTs < GRACE_MS;
  if (!penInPlay) return; // no stylus in use → normal finger behaviour

  // Only reject on the drawing surface, never on the toolbar/menus/dialogs.
  const target = event.target;
  if (target && target.tagName === "CANVAS") {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
}

export function installStylusSupport() {
  const opts = { capture: true, passive: false };
  ["pointerdown", "pointermove", "pointerup", "pointercancel"].forEach((type) =>
    window.addEventListener(type, onPointer, opts)
  );
}
