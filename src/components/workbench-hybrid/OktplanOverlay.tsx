"use client";

import type { ReactElement } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, Flag, Gauge, Pencil, Play, Plus, Timer } from "lucide-react";
import { CAT_COLORS, FONT, WB } from "./theme";
import { durLabel, fysExercises, formulaLine, planBlocks } from "./helpers";
import { dimLabel } from "./taxonomy";
import type { WbSession } from "./types";

export type PlanMode = "BANE" | "RANGE";

const DAY_NAMES: Record<string, string> = {
  man: "Man 9. juni", tir: "Tir 10. juni", ons: "Ons 11. juni", tor: "Tor 12. juni",
  fre: "Fre 13. juni", lor: "Lør 14. juni", son: "Søn 15. juni",
};

const QUICK_ACTIONS = [
  { Icon: Timer, label: "Varighet" },
  { Icon: Gauge, label: "Intensitet" },
  { Icon: Flag, label: "Mål" },
  { Icon: Pencil, label: "Notat" },
] as const;

type OktplanOverlayProps = {
  session: WbSession;
  /** ukedag-nøkkel ("ons") for dato-chip */
  dayKey: string;
  mode: PlanMode;
  onMode: (mode: PlanMode) => void;
  onClose: () => void;
  onStart: () => void;
};

/**
 * Øktplan-overlay — full sesjonsplan (fasit "bilde 2"). Bane/Range-faner,
 * nummererte steg-blokker (golf) eller FYS-øvelsesliste, "Generert fra formel"
 * og Start økt. Innholdet avledes fra øktens AK-formel via helpers (porten av
 * fasitens buildPlan). FYS sett/reps er plassholder (formel ikke låst).
 */
export function OktplanOverlay({ session: s, dayKey, mode, onMode, onClose, onStart }: OktplanOverlayProps): ReactElement {
  const isFys = s.cat === "FYS";
  const catColor = CAT_COLORS[s.cat] ?? WB.lime;
  const dayLabel = DAY_NAMES[dayKey] ?? "Ons 11. juni";
  const blocks = planBlocks(s, catColor);
  const exercises = fysExercises(s);
  const subLabel = (isFys ? dimLabel("fysType", s.fysType || "STYRKE") : omrSub(s)) + ` · ${s.cat} · ${dayLabel}`;
  const dur = durLabel(s.dur) + (s.time && s.time !== "—" ? ` · fra ${s.time}` : "");
  const fysHead = `${dimLabel("fysType", s.fysType || "STYRKE")} · ${dimLabel("sone", s.sone || "SONE_3")}`;

  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 64,
        background: "rgba(7,16,12,0.74)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "36px 20px",
        overflowY: "auto",
      }}
      className="wb-scroll"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 580,
          maxWidth: "100%",
          background: WB.panelBg,
          border: `1px solid ${WB.panelBorder}`,
          borderRadius: 22,
          overflow: "hidden",
          boxShadow: "0 40px 90px -30px rgba(0,0,0,0.65)",
        }}
      >
        {/* HEADER */}
        <div style={{ padding: 24, background: `linear-gradient(155deg,#17362a,${WB.railBg})`, borderBottom: `3px solid ${catColor}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <button
              type="button"
              onClick={onClose}
              title="Tilbake"
              style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <ChevronLeft size={18} color={WB.limeDark} strokeWidth={2.2} />
            </button>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: FONT.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: WB.lime }}>
              <Calendar size={14} color={WB.lime} strokeWidth={2} />
              {dayLabel}
            </span>
          </div>
          <h2 style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 30, lineHeight: 1.04, letterSpacing: "-0.02em", color: "#fff", margin: "0 0 6px" }}>
            {s.title}
          </h2>
          <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.78)", marginBottom: 16 }}>{subLabel}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, color: "#fff" }}>
            <Clock size={18} color="#fff" strokeWidth={1.8} />
            <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 18 }}>{dur}</span>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: `1px solid ${WB.panelBorder}` }}>
          {QUICK_ACTIONS.map(({ Icon, label }, i) => (
            <div
              key={label}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, padding: "16px 6px", borderRight: i < 3 ? `1px solid ${WB.hairlineSoft}` : "none" }}
            >
              <span style={{ width: 38, height: 38, borderRadius: "50%", background: WB.cardBg, border: `1px solid ${WB.panelBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: WB.muted }}>
                <Icon size={16} strokeWidth={1.9} />
              </span>
              <span style={{ fontFamily: FONT.mono, fontSize: 8.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: WB.muted, textAlign: "center", lineHeight: 1.3 }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* BODY */}
        <div style={{ padding: "18px 20px 22px" }}>
          {!isFys && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 16, color: WB.text }}>Beskrivelse</span>
                <div style={{ display: "flex", alignItems: "center", gap: 2, background: WB.railBg, border: `1px solid ${WB.panelBorder}`, borderRadius: 9999, padding: 3 }}>
                  <TabSpan active={mode === "BANE"} onClick={() => onMode("BANE")}>Bane</TabSpan>
                  <TabSpan active={mode === "RANGE"} onClick={() => onMode("RANGE")}>Range</TabSpan>
                </div>
              </div>
              {blocks.map((b) => (
                <div key={b.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: b.color, borderRadius: "12px 12px 0 0", padding: "9px 13px" }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap", color: WB.limeDark }}>{b.label}</span>
                    {b.hasRepeat && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: FONT.mono, fontSize: 10, fontWeight: 700, color: WB.limeDark }}>
                        <ChevronRight size={12} color={WB.limeDark} strokeWidth={2.4} />
                        {b.repeatLabel}
                      </span>
                    )}
                  </div>
                  <div style={{ background: WB.cardBg, border: `1px solid ${WB.panelBorder}`, borderTop: "none", borderRadius: "0 0 12px 12px", overflow: "hidden" }}>
                    {b.steps.map((st) => (
                      <div key={st.n} style={{ display: "flex", alignItems: "stretch", borderTop: `1px solid ${WB.hairlineSoft}` }}>
                        <div style={{ width: 46, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.display, fontWeight: 700, fontSize: 15, color: WB.muted3, borderRight: `1px solid ${WB.hairlineSoft}` }}>
                          {st.n}
                        </div>
                        <div style={{ flex: 1, padding: "11px 13px" }}>
                          <div style={{ fontSize: 13, color: WB.text, lineHeight: 1.35 }}>{st.title}</div>
                          <div style={{ fontSize: 11, color: WB.muted, marginTop: 2 }}>{st.detail}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", padding: "0 13px" }}>
                          <span style={{ fontFamily: FONT.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.04em", borderRadius: 6, padding: "3px 7px", color: WB.limeDark, background: WB.lime }}>
                            {st.tag}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {isFys && (
            <div>
              <div style={{ fontFamily: FONT.mono, fontSize: 9.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: WB.muted3, marginBottom: 12 }}>
                {fysHead}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {exercises.map((ex, i) => (
                  <div key={ex.name} style={{ display: "flex", alignItems: "center", gap: 13, padding: "4px 0" }}>
                    <span style={{ width: 44, height: 44, borderRadius: "50%", background: WB.cardBg, border: `1px solid ${WB.panelBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.display, fontWeight: 700, fontSize: 16, color: WB.lime, flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: WB.text }}>{ex.name}</div>
                      <div style={{ fontSize: 12, color: WB.muted, marginTop: 1 }}>{ex.meta}</div>
                    </div>
                    <ChevronRight size={18} color={WB.muted3} strokeWidth={2} />
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "4px 0" }}>
                  <span style={{ width: 44, height: 44, borderRadius: "50%", background: WB.cardBg, border: `1px solid ${WB.panelBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: WB.lime }}>
                    <Plus size={20} strokeWidth={2.2} />
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: WB.muted }}>Legg til øvelse</span>
                </div>
              </div>
            </div>
          )}

          {/* FORMEL */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "#0d241c", border: `1px solid ${WB.hairlineSoft}`, borderRadius: 10, padding: "11px 13px", marginTop: 16 }}>
            <Flag size={13} color={WB.lime} strokeWidth={1.9} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontFamily: FONT.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: WB.muted3, marginBottom: 3 }}>
                Generert fra formel
              </div>
              <div style={{ fontFamily: FONT.mono, fontSize: 11, color: WB.lime, lineHeight: 1.5 }}>{formulaLine(s)}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onStart}
            style={{ width: "100%", marginTop: 16, border: "none", background: WB.lime, color: WB.limeDark, borderRadius: 9999, padding: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}
          >
            <Play size={18} fill={WB.limeDark} stroke="none" />
            <span style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>Start økt</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function omrSub(s: WbSession): string {
  const v = s.omr;
  const arr = Array.isArray(v) ? v : v ? [v] : ["TEE"];
  return arr.map((x) => dimLabel("omr", x)).join(", ");
}

function TabSpan({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }): ReactElement {
  return (
    <span
      onClick={onClick}
      style={{
        fontSize: 11,
        padding: "5px 13px",
        borderRadius: 9999,
        cursor: "pointer",
        fontWeight: active ? 700 : 400,
        color: active ? WB.limeDark : WB.muted,
        background: active ? WB.lime : "transparent",
      }}
    >
      {children}
    </span>
  );
}
