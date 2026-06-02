// ============================================================
// DirBDrillOverlay — ported 1:1 from v10 workbench-dir-b.jsx
// (DrillOverlay). The B → A·DAG escalation: a modal (backdrop +
// centred panel) that renders A's DayView on top of B's tidslinje
// without leaving the list context. Triggered by the slide-over
// "Åpne drill-modus" CTA or ⌘D; closed by the back-button, the
// close-X, Esc, or a backdrop click (all wired via `onClose`).
// ============================================================
"use client";

import { useEffect } from "react";
import { Icon } from "./icon";
import { DayView } from "./day-view";

type DirBDrillOverlayProps = {
  /** Close the overlay — wired to back/close/Esc/backdrop + ⌘D toggle. */
  onClose: () => void;
};

export function DirBDrillOverlay({ onClose }: DirBDrillOverlayProps) {
  // Esc closes; ⌘D toggles (here: closes, since the overlay is open).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === "d" || e.key === "D")) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="drill-overlay">
      <div className="dr-backdrop" onClick={onClose} />
      <div className="dr-modal" role="dialog" aria-modal="true" aria-label="Drill-modus">
        <header className="dr-head">
          <button type="button" className="dr-back" onClick={onClose}>
            <Icon n="chevron-left" w={14} h={14} />
            <span>LISTE</span>
          </button>
          <div className="dr-crumb">
            <span className="ax-dot slag" />
            <span className="eb">ONS 28 MAI · SLAG · 14:00</span>
            <span className="sep">·</span>
            <span className="ttl">Innspill 50–80 m · presisjon</span>
          </div>
          <div className="dr-keys">
            <span className="kbd">⌘</span>
            <span className="kbd">D</span>
            <span className="kbd-lbl">eller</span>
            <span className="kbd">Esc</span>
            <span className="kbd-lbl">for å lukke</span>
          </div>
          <button type="button" className="dr-close" aria-label="Lukk drill-modus" onClick={onClose}>
            <Icon n="x" w={16} h={16} />
          </button>
        </header>
        <div className="dr-body">
          <DayView />
        </div>
      </div>
    </div>
  );
}
