"use client";

/**
 * Kvittering (toast) for Precision-skjermene: tittel pluss meta i versaler,
 * vises i 2,6 s øverst (docs/design-handoff/README.md › Interactions).
 * Samme oppførsel som den godkjente PH-01 (PH01IDag.tsx).
 */

import { useEffect, useState } from "react";

export const PA_TOAST_MS = 2600;

export function usePaToast() {
  const [x, setX] = useState<{ t: string; m?: string; k: number } | null>(null);
  useEffect(() => {
    if (!x) return;
    const h = setTimeout(() => setX(null), PA_TOAST_MS);
    return () => clearTimeout(h);
  }, [x]);
  const vis = (t: string, m?: string) => setX({ t, m, k: Date.now() });
  const el = x && (
    <div style={{ position: "fixed", top: 16, left: 16, right: 16, display: "flex", justifyContent: "center", zIndex: 200, pointerEvents: "none" }}>
      <div key={x.k} role="status" className="pa-toast" style={{ pointerEvents: "auto", maxWidth: "100%" }}>
        <span>{x.t}</span>
        {x.m && <span className="pa-toast__meta">{x.m}</span>}
      </div>
    </div>
  );
  return { vis, el };
}
