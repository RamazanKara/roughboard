import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { installCapacitorBridge } from "./capacitor-bridge.js";
import "./index.css";

// Route web-style file downloads (export/save) to the native share sheet.
installCapacitorBridge();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
