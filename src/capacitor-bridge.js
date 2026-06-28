// Bridges Excalidraw's web-style file downloads to native Android.
//
// Android System WebView ignores `<a download>` / blob-URL downloads (there is
// no download manager wired up), and the File System Access API is unavailable,
// so Excalidraw's "Export image" / "Save to disk" would silently do nothing.
//
// We intercept those download clicks, materialise the blob into the app cache
// via the Filesystem plugin, then hand it to the native Share sheet so the user
// can save it to Files/Gallery or send it anywhere.
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Toast } from "@capacitor/toast";

const LOG = "[excalidraw-bridge]";

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.slice(result.indexOf(",") + 1) : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function notify(message) {
  try {
    await Toast.show({ text: message, duration: "short" });
  } catch {
    /* toast is best-effort */
  }
}

async function resolveBlob(href) {
  // Prefer the Blob captured by the URL.createObjectURL hook (set up in
  // index.html) — it survives URL revocation. Fall back to fetching the URL,
  // which also covers data: URLs from canvas exports.
  const captured =
    window.__excaliBlobs && href ? window.__excaliBlobs.get(href) : null;
  if (captured) return captured;
  const resp = await fetch(href);
  return await resp.blob();
}

async function saveAndShare(href, filename) {
  console.log(LOG, "saving", filename, href && href.slice(0, 24));
  const blob = await resolveBlob(href);
  const base64 = await blobToBase64(blob);

  // App cache dir needs no storage permission and is shareable via FileProvider.
  await Filesystem.writeFile({
    path: filename,
    data: base64,
    directory: Directory.Cache,
  });
  const { uri } = await Filesystem.getUri({
    path: filename,
    directory: Directory.Cache,
  });
  console.log(LOG, "wrote", uri);

  try {
    await Share.share({ title: filename, url: uri });
    console.log(LOG, "shared");
  } catch (e) {
    // User dismissed the sheet, or no share target — the file is still saved.
    console.log(LOG, "share dismissed/failed:", e && e.message);
    await notify("Saved: " + filename);
  }
}

function isDownloadAnchor(el) {
  return (
    el &&
    el.tagName === "A" &&
    el.hasAttribute("download") &&
    typeof el.href === "string" &&
    (el.href.startsWith("blob:") || el.href.startsWith("data:"))
  );
}

// Avoid double-handling when both the prototype hook and the event listener
// see the same click.
const handled = new WeakSet();

function handleAnchor(anchor) {
  if (!anchor || handled.has(anchor)) return false;
  handled.add(anchor);
  const filename = anchor.getAttribute("download") || "excalidraw-export";
  const href = anchor.getAttribute("href") || anchor.href || "";
  saveAndShare(href, filename).catch((err) => {
    console.error(LOG, "export failed:", err);
    notify("Export failed");
  });
  return true;
}

export function installCapacitorBridge() {
  if (!Capacitor || !Capacitor.isNativePlatform()) {
    console.log(LOG, "not native — bridge inactive");
    return;
  }
  console.log(LOG, "installing native export bridge");

  // (1) Primary: override the exact call browser-fs-access makes (`a.click()`).
  const proto = HTMLAnchorElement.prototype;
  const originalClick = proto.click;
  proto.click = function patchedClick() {
    if (isDownloadAnchor(this)) {
      console.log(LOG, "intercepted a.click() download");
      if (handleAnchor(this)) return;
    }
    return originalClick.apply(this, arguments);
  };

  // (2) Backup: catch programmatic dispatchEvent(new MouseEvent('click')).
  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      const anchor =
        target && target.closest ? target.closest("a[download]") : null;
      if (!isDownloadAnchor(anchor)) return;
      console.log(LOG, "intercepted click event download");
      event.preventDefault();
      event.stopPropagation();
      handleAnchor(anchor);
    },
    true
  );
}
