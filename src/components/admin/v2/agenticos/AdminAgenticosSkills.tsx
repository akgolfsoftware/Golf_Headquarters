"use client";

/**
 * AO-09 Skills — hva agenten får lov til. Ingen hvit primær (ingen kjøre-handling).
 * Publisere økter og sende e-post er av og låst.
 */

import { TL } from "@/lib/v2/train-lock";
import { AGENTICOS_SKILLS } from "@/lib/agencyos/agenticos-ia";
import { AoToggle, AoTittel } from "./tl-agenticos";

export function AdminAgenticosSkills() {
  return (
    <div data-screen-label="AO-09 Skills" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <AoTittel size={20}>Skills</AoTittel>
        <span style={{ fontSize: 12, color: TL.mute }}>Hva agenten får lov til — alt annet er stengt</span>
      </div>
      <div>
        {AGENTICOS_SKILLS.map((s, i) => (
          <div
            key={s.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 0",
              borderTop: `1px solid ${TL.hair}`,
              borderBottom: i === AGENTICOS_SKILLS.length - 1 ? `1px solid ${TL.hair}` : undefined,
              opacity: s.paa ? 1 : 0.45,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: TL.text }}>{s.tittel}</div>
              <div style={{ fontSize: 11, color: TL.mute }}>{s.meta}</div>
            </div>
            <AoToggle paa={s.paa} />
          </div>
        ))}
      </div>
      <p style={{ margin: 0, fontSize: 11, color: TL.mute, lineHeight: 1.6 }}>
        «Publisere økter» kan ikke skrus på. Skjerm uten kjøre-handling — derfor ingen hvit primær her.
      </p>
    </div>
  );
}
