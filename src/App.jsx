import { useCallback, useRef, useState } from "react";
import {
  Excalidraw,
  MainMenu,
  WelcomeScreen,
  serializeAsJSON,
} from "@excalidraw/excalidraw";
import { AboutOverlay } from "./about.jsx";
// NOTE: Excalidraw 0.17.x ships its styles inside the JS bundle (auto-injected),
// so there is no separate "index.css" to import.

const SCENE_KEY = "excalidraw-android:scene";
const LIBRARY_KEY = "excalidraw-android:library";
const THEME_KEY = "excalidraw-android:theme";

function loadScene() {
  try {
    const raw = localStorage.getItem(SCENE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      elements: data.elements || [],
      appState: data.appState || {},
      files: data.files || {},
    };
  } catch (e) {
    console.error("Failed to load saved scene:", e);
    return null;
  }
}

function loadLibrary() {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function buildInitialData() {
  const scene = loadScene() || { elements: [], appState: {}, files: {} };
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  return {
    elements: scene.elements,
    files: scene.files,
    appState: {
      ...scene.appState,
      theme: scene.appState.theme || savedTheme,
      // Don't restore a stale "collaborators" map etc.; let restore() handle it.
    },
    libraryItems: loadLibrary(),
    scrollToContent: true,
  };
}

function RoughboardLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
        <rect width="48" height="48" rx="11" fill="#0CA678" />
        <g transform="translate(11.5,11.5) scale(1.04)">
          <path
            fill="#fff"
            d="M3,17.25V21h3.75L17.81,9.94l-3.75,-3.75L3,17.25zM20.71,7.04c0.39,-0.39 0.39,-1.02 0,-1.41l-2.34,-2.34c-0.39,-0.39 -1.02,-0.39 -1.41,0l-1.83,1.83 3.75,3.75 1.83,-1.83z"
          />
        </g>
      </svg>
      <span
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          color: "#0ca678",
          letterSpacing: "0.5px",
        }}
      >
        Roughboard
      </span>
    </div>
  );
}

export default function App() {
  const [, setExcalidrawAPI] = useState(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const saveTimer = useRef(null);
  const initialDataRef = useRef(null);
  if (initialDataRef.current === null) {
    initialDataRef.current = buildInitialData();
  }

  const persistScene = useCallback((elements, appState, files) => {
    try {
      localStorage.setItem(
        SCENE_KEY,
        serializeAsJSON(elements, appState, files, "local")
      );
      if (appState && appState.theme) {
        localStorage.setItem(THEME_KEY, appState.theme);
      }
    } catch (e) {
      console.error("Failed to save scene:", e);
    }
  }, []);

  const onChange = useCallback(
    (elements, appState, files) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        persistScene(elements, appState, files);
      }, 350);
    },
    [persistScene]
  );

  const onLibraryChange = useCallback((items) => {
    try {
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save library:", e);
    }
  }, []);

  return (
    <div className="excalidraw-android-root">
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={initialDataRef.current}
        onChange={onChange}
        onLibraryChange={onLibraryChange}
        autoFocus
        UIOptions={{
          canvasActions: {
            loadScene: true,
            export: { saveFileToDisk: true },
            saveToActiveFile: false,
            toggleTheme: true,
            clearCanvas: true,
            changeViewBackgroundColor: true,
          },
        }}
      >
        <WelcomeScreen>
          <WelcomeScreen.Center>
            <WelcomeScreen.Center.Logo>
              <RoughboardLogo />
            </WelcomeScreen.Center.Logo>
            <WelcomeScreen.Center.Heading>
              An offline hand-drawn whiteboard
            </WelcomeScreen.Center.Heading>
            <WelcomeScreen.Center.Menu>
              <WelcomeScreen.Center.MenuItemLoadScene />
              <WelcomeScreen.Center.MenuItemHelp />
            </WelcomeScreen.Center.Menu>
          </WelcomeScreen.Center>
          <WelcomeScreen.Hints.ToolbarHint />
          <WelcomeScreen.Hints.MenuHint />
          <WelcomeScreen.Hints.HelpHint />
        </WelcomeScreen>
        <MainMenu>
          <MainMenu.DefaultItems.LoadScene />
          <MainMenu.DefaultItems.Export />
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.Separator />
          <MainMenu.DefaultItems.ToggleTheme />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
          <MainMenu.Separator />
          <MainMenu.DefaultItems.Help />
          <MainMenu.Item
            onSelect={() => setAboutOpen(true)}
            icon={
              <svg
                viewBox="0 0 24 24"
                width="1em"
                height="1em"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="9" />
                <line x1="12" y1="11" x2="12" y2="16" />
                <circle cx="12" cy="8" r="0.6" fill="currentColor" />
              </svg>
            }
          >
            About Roughboard
          </MainMenu.Item>
        </MainMenu>
      </Excalidraw>
      {aboutOpen && <AboutOverlay onClose={() => setAboutOpen(false)} />}
    </div>
  );
}
