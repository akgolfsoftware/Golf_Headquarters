"use client";

import type { ReactElement } from "react";
import { Minus, Plus, X } from "lucide-react";
import { FONT, WB } from "./theme";
import { recurSummary } from "./helpers";
import type { Recur, RecurEnd, RecurFreq, WeekKey } from "./types";

const FREQ_OPTS: { value: RecurFreq; label: string }[] = [
  { value: "none", label: "Aldri" },
  { value: "daily", label: "Daglig" },
  { value: "weekly", label: "Ukentlig" },
  { value: "monthly", label: "Månedlig" },
];

const DAYS: { key: WeekKey; label: string }[] = [
  { key: "man", label: "M" }, { key: "tir", label: "T" }, { key: "ons", label: "O" },
  { key: "tor", label: "T" }, { key: "fre", label: "F" }, { key: "lor", label: "L" }, { key: "son", label: "S" },
];

const END_OPTS: { value: RecurEnd; label: string }[] = [
  { value: "never", label: "Aldri" },
  { value: "count", label: "Etter antall ganger" },
  { value: "date", label: "På dato" },
];

const SECTION_LABEL: React.CSSProperties = {
  fontFamily: FONT.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em",
  textTransform: "uppercase", color: WB.muted3, marginBottom: 9,
};

type RecurrenceEditorProps = {
  draft: Recur;
  onPatch: (patch: Partial<Recur>) => void;
  onSave: () => void;
  onClose: () => void;
};

/**
 * Gjentakelse-editor (Google-kalender-stil, fasit `recurEditorVals`). Frekvens,
 * intervall, ukedager (kun ukentlig), slutt-betingelse. Drafter lever i shell-
 * state; lagring skriver tilbake til den valgte økten (komponent-state, ikke DB).
 */
export function RecurrenceEditor({ draft: d, onPatch, onSave, onClose }: RecurrenceEditorProps): ReactElement {
  const showInterval = d.freq !== "none";
  const showDays = d.freq === "weekly";
  const intervalUnit = d.freq === "monthly" ? "måned" : d.freq === "daily" ? "dag" : "uke";

  const toggleDay = (k: WeekKey) => {
    const set = new Set(d.days);
    if (set.has(k)) set.delete(k);
    else set.add(k);
    onPatch({ days: [...set] });
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 70, background: "rgba(7,16,12,0.74)",
        backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 420, maxWidth: "100%", maxHeight: "84%", display: "flex", flexDirection: "column",
          background: WB.panelBg, border: `1px solid ${WB.panelBorder}`, borderRadius: 18, overflow: "hidden",
          boxShadow: "0 40px 90px -30px rgba(0,0,0,0.65)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: `1px solid ${WB.panelBorder}` }}>
          <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 17, color: WB.text }}>Gjentakelse</span>
          <button type="button" onClick={onClose} style={iconBtn}>
            <X size={15} />
          </button>
        </div>

        <div className="wb-scroll" style={{ padding: 18, overflowY: "auto" }}>
          <div style={SECTION_LABEL}>Gjentas</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 18 }}>
            {FREQ_OPTS.map((f) => (
              <Chip key={f.value} active={d.freq === f.value} onClick={() => onPatch({ freq: f.value })}>
                {f.label}
              </Chip>
            ))}
          </div>

          {showInterval && (
            <div style={{ marginBottom: 18 }}>
              <div style={SECTION_LABEL}>Hyppighet</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 13.5, color: WB.muted2 }}>Hver</span>
                <div style={{ display: "flex", alignItems: "center", gap: 2, background: WB.railBg, border: `1px solid ${WB.panelBorder}`, borderRadius: 9999, padding: 3 }}>
                  <button type="button" onClick={() => onPatch({ interval: Math.max(1, d.interval - 1) })} style={roundBtn(28)}>
                    <Minus size={15} />
                  </button>
                  <span style={{ minWidth: 30, textAlign: "center", fontFamily: FONT.display, fontWeight: 700, fontSize: 16, color: WB.text }}>{d.interval}</span>
                  <button type="button" onClick={() => onPatch({ interval: Math.min(12, d.interval + 1) })} style={roundBtn(28)}>
                    <Plus size={15} />
                  </button>
                </div>
                <span style={{ fontSize: 13.5, color: WB.muted2 }}>{intervalUnit}</span>
              </div>
            </div>
          )}

          {showDays && (
            <div style={{ marginBottom: 18 }}>
              <div style={SECTION_LABEL}>På disse dagene</div>
              <div style={{ display: "flex", gap: 6 }}>
                {DAYS.map((day, i) => {
                  const active = d.days.includes(day.key);
                  return (
                    <span
                      key={`${day.key}-${i}`}
                      onClick={() => toggleDay(day.key)}
                      style={{
                        width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", fontSize: 13, fontWeight: 700, border: `1px solid ${active ? WB.lime : WB.panelBorder}`,
                        color: active ? WB.limeDark : WB.muted, background: active ? WB.lime : WB.cardBg,
                      }}
                    >
                      {day.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div style={SECTION_LABEL}>Slutter</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 6 }}>
            {END_OPTS.map((e) => {
              const active = d.endType === e.value;
              return (
                <div
                  key={e.value}
                  onClick={() => onPatch({ endType: e.value })}
                  style={{
                    display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                    border: `1px solid ${active ? WB.lime : WB.panelBorder}`, background: active ? "rgba(209,248,67,0.1)" : WB.cardBg,
                  }}
                >
                  <span style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, border: `2px solid ${active ? WB.lime : WB.muted3}`, background: active ? "radial-gradient(circle, #D1F843 0 5px, transparent 6px)" : "transparent" }} />
                  <span style={{ fontSize: 13.5, color: WB.text, flex: 1 }}>{e.label}</span>
                  {e.value === "count" && active && (
                    <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <button type="button" onClick={(ev) => { ev.stopPropagation(); onPatch({ endCount: Math.max(1, d.endCount - 1) }); }} style={roundBtn(26, WB.railBg)}>
                        <Minus size={14} />
                      </button>
                      <span style={{ minWidth: 26, textAlign: "center", fontFamily: FONT.display, fontWeight: 700, fontSize: 15, color: WB.lime }}>{d.endCount}</span>
                      <button type="button" onClick={(ev) => { ev.stopPropagation(); onPatch({ endCount: Math.min(52, d.endCount + 1) }); }} style={roundBtn(26, WB.railBg)}>
                        <Plus size={14} />
                      </button>
                    </span>
                  )}
                  {e.value === "date" && active && (
                    <span style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 600, color: WB.lime }}>{d.endDate}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderTop: `1px solid ${WB.panelBorder}` }}>
          <span style={{ flex: 1, fontSize: 12, color: WB.muted, lineHeight: 1.4 }}>{recurSummary(d)}</span>
          <button type="button" onClick={onClose} style={{ border: `1px solid ${WB.panelBorder}`, background: WB.cardBg, color: WB.text, borderRadius: 9999, padding: "9px 16px", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
            Avbryt
          </button>
          <button type="button" onClick={onSave} style={{ border: "none", background: WB.lime, color: WB.limeDark, borderRadius: 9999, padding: "9px 18px", cursor: "pointer", fontFamily: FONT.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Lagre
          </button>
        </div>
      </div>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 9, border: "none", background: WB.cardBg, color: WB.muted,
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
};

const roundBtn = (size: number, bg: string = WB.cardBg): React.CSSProperties => ({
  width: size, height: size, borderRadius: "50%", border: "none", background: bg, color: WB.text,
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
});

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }): ReactElement {
  return (
    <span
      onClick={onClick}
      style={{
        fontSize: 12.5, padding: "7px 14px", borderRadius: 9999, cursor: "pointer",
        border: `1px solid ${active ? WB.lime : WB.panelBorder}`,
        fontWeight: active ? 700 : 400, color: active ? WB.limeDark : WB.muted,
        background: active ? WB.lime : WB.cardBg,
      }}
    >
      {children}
    </span>
  );
}
