"use client";

import type { ReactElement } from "react";
import { CalendarRange } from "lucide-react";
import { FONT, WB } from "./theme";

type StubViewProps = {
  label: string;
};

/** Plassholder for zoom-nivåer som kommer i senere faser (Årsplan / År / Måned). */
export function StubView({ label }: StubViewProps): ReactElement {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: WB.cardBg,
          border: `1px solid ${WB.panelBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <CalendarRange size={26} color={WB.muted} strokeWidth={1.7} />
      </div>
      <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 22, color: WB.text, marginBottom: 6 }}>Kommer</div>
      <p style={{ fontSize: 13, lineHeight: 1.55, color: WB.muted, margin: 0, maxWidth: 360 }}>
        {label} bygges i en senere fase. Uke og Dag er aktive nå.
      </p>
    </div>
  );
}
