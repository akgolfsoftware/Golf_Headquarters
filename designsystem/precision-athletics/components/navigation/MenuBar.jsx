import React from "react";

export function MenuBar({ brand, onMenu, open, actions }) {
  return (
    <header style={{ height: 56, flex: "none", display: "flex", alignItems: "center", gap: 8, padding: "0 8px 0 16px", background: "var(--surface-flat)", borderBottom: "1px solid var(--border-hairline)", position: "relative", zIndex: 5, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", minWidth: 0, flex: "0 1 auto", overflow: "hidden" }}>{brand}</div>
      <span style={{ flex: 1 }}></span>
      {actions}
      <button type="button" onClick={onMenu} aria-label="Åpne meny" aria-expanded={!!open} style={{ width: 44, height: 44, flex: "none", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <span style={{ width: 20, height: 2, borderRadius: 2, background: "var(--text-primary)" }}></span>
        <span style={{ width: 14, height: 2, borderRadius: 2, background: "var(--text-primary)", transform: "translateX(3px)" }}></span>
      </button>
    </header>
  );
}
