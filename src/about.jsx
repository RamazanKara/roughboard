// In-app attribution / open-source licenses screen. Satisfies the MIT + OFL
// notice requirements and states non-affiliation with Excalidraw.

export const APP_VERSION = "1.0";

const MIT_LICENSE = `MIT License

Copyright (c) 2020 Excalidraw
Copyright (c) 2017 Drifty Co. (Capacitor)
Copyright (c) Meta Platforms, Inc. and affiliates (React)
Copyright (c) 2019-present VoidZero Inc. & Vite contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

export function AboutOverlay({ onClose }) {
  return (
    <div className="rb-about-backdrop" onClick={onClose} role="presentation">
      <div
        className="rb-about"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="About Roughboard"
      >
        <button
          className="rb-about-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h1>Roughboard</h1>
        <p className="rb-ver">Version {APP_VERSION}</p>
        <p>
          Roughboard is an independent, native Android build of the open-source{" "}
          <strong>Excalidraw</strong> whiteboard editor — fully local, no account
          or network required.
        </p>
        <p className="rb-disclaimer">
          Not affiliated with, endorsed by, or sponsored by Excalidraw.
          “Excalidraw” is a trademark of its respective owner and is referenced
          here only to credit the upstream open-source project that powers this
          app.
        </p>

        <h2>Open-source licenses</h2>
        <ul>
          <li>
            <strong>Excalidraw</strong> editor — MIT — © Excalidraw contributors
          </li>
          <li>
            <strong>Capacitor</strong> — MIT — © Drifty Co.
          </li>
          <li>
            <strong>React</strong> — MIT — © Meta Platforms, Inc.
          </li>
          <li>
            <strong>Vite</strong> — MIT — © VoidZero Inc. &amp; contributors
          </li>
          <li>
            <strong>Virgil, Cascadia Code, Assistant</strong> fonts — SIL Open
            Font License 1.1
          </li>
        </ul>

        <pre className="rb-license">{MIT_LICENSE}</pre>

        <p className="rb-foot">
          The bundled fonts are licensed under the SIL Open Font License 1.1
          (OFL-1.1) and are used here under that license. Full license texts are
          included in the project’s THIRD_PARTY_LICENSES file.
        </p>
      </div>
    </div>
  );
}
