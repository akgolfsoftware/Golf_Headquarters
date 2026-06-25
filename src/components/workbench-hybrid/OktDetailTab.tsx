"use client";

import type { ReactElement } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, Flag, Gauge, Pencil, Play, Plus, Timer } from "lucide-react";
import { CAT_COLORS, FONT, WB } from "./theme";
import { durLabel, fysExercises, formulaLine, planBlocks } from "./helpers";
import { dimLabel } from "./taxonomy";
import type { PlanMode } from "./OktplanOverlay";
import type { WbSession, WeekKey } from "./types";

const DAY_NAMES: Record<WeekKey, string> = {
  man: "Mandag",
  tir: "Tirsdag",
  ons: "Onsdag",
  tor: "Torsdag",
  fre: "Fredag",
  lor: "Lørdag",
  son: "Søndag",
};

const QUICK_ACTIONS = [
  { Icon: Timer, label: "Varighet" },
  { Icon: Gauge, label: "Intensitet" },
  { Icon: Flag, label: "Mål" },
  { Icon: Pencil, label: "Notat" },
] as const;

type OktDetailTabProps = {
  session: WbSession;
  dayKey: WeekKey;
  mode: PlanMode;
  onMode: (mode: PlanMode) => void;
  onBackToWeek: () => void;
  onStart: () => void;
};

/** Inline økt-detalj for hub-fanen «Økt» (fasit wb-10, ikke dag-tidslinje). */
export function OktDetailTab({
  session: s,
  dayKey,
  mode,
  onMode,
  onBackToWeek,
  onStart,
}: OktDetailTabProps): ReactElement {
  const isFys = s.cat === "FYS";
  const catColor = CAT_COLORS[s.cat] ?? WB.lime;
  const dayLabel = DAY_NAMES[dayKey] ?? "Ukedag";
  const blocks = planBlocks(s, catColor);
  const exercises = fysExercises(s);
  const subLabel =
    (isFys ? dimLabel("fysType", s.fysType || "STYRKE") : omrSub(s)) +
    ` · ${s.cat} · ${dayLabel}`;
  const dur = durLabel(s.dur) + (s.time && s.time !== "—" ? ` · fra ${s.time}` : "");
  const fysHead = `${dimLabel("fysType", s.fysType || "STYRKE")} · ${dimLabel("sone", s.sone || "SONE_3")}`;

  return (
    <div className="wb-scroll" style={{ flex: 1, overflow: "auto" }}>
      <div style={{ padding: "14px 16px 0" }}>
        <button
          type="button"
          onClick={onBackToWeek}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            border: "none",
            background: "transparent",
            fontFamily: FONT.mono,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: WB.muted,
            cursor: "pointer",
            padding: 0,
            marginBottom: 12,
          }}
        >
          <ChevronLeft size={14} />
          Tilbake til uke
        </button>
      </div>

      <div
        style={{
          margin: "0 16px 16px",
          background: WB.panelBg,
          border: `1px solid ${WB.panelBorder}`,
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: 20,
            background: `linear-gradient(155deg,#17362a,${WB.railBg})`,
            borderBottom: `3px solid ${catColor}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontFamily: FONT.mono,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: WB.lime,
                background: `${WB.lime}22`,
                borderRadius: 999,
                padding: "4px 10px",
              }}
            >
              Kommende
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: FONT.mono, fontSize: 10, color: WB.lime }}>
              <Calendar size={13} strokeWidth={2} />
              {dayLabel}
            </span>
          </div>
          <h2
            style={{
              fontFamily: FONT.display,
              fontWeight: 800,
              fontSize: 24,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              color: "#fff",
              margin: "0 0 6px",
            }}
          >
            {s.title}
          </h2>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", marginBottom: 12 }}>{subLabel}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#fff" }}>
            <Clock size={16} strokeWidth={1.8} />
            <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 16 }}>{dur}</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: `1px solid ${WB.panelBorder}` }}>
          {QUICK_ACTIONS.map(({ Icon, label }, i) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: "12px 4px",
                borderRight: i < 3 ? `1px solid ${WB.hairlineSoft}` : "none",
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: WB.cardBg,
                  border: `1px solid ${WB.panelBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: WB.muted,
                }}
              >
                <Icon size={15} strokeWidth={1.9} />
              </span>
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 8,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: WB.muted,
                  textAlign: "center",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <div style={{ padding: "16px 16px 20px" }}>
          {!isFys && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 15, color: WB.text }}>
                  Drill-program
                </span>
                <ModeTabs mode={mode} onMode={onMode} />
              </div>
              {blocks.map((b) => (
                <div key={b.label} style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: b.color,
                      borderRadius: "10px 10px 0 0",
                      padding: "8px 12px",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 700, color: WB.limeDark }}>{b.label}</span>
                    {b.hasRepeat && (
                      <span style={{ fontFamily: FONT.mono, fontSize: 9, fontWeight: 700, color: WB.limeDark }}>
                        {b.repeatLabel}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      background: WB.cardBg,
                      border: `1px solid ${WB.panelBorder}`,
                      borderTop: "none",
                      borderRadius: "0 0 10px 10px",
                      overflow: "hidden",
                    }}
                  >
                    {b.steps.map((st) => (
                      <div
                        key={st.n}
                        style={{
                          display: "flex",
                          alignItems: "stretch",
                          borderTop: `1px solid ${WB.hairlineSoft}`,
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: FONT.display,
                            fontWeight: 700,
                            fontSize: 14,
                            color: WB.muted3,
                            borderRight: `1px solid ${WB.hairlineSoft}`,
                          }}
                        >
                          {st.n}
                        </div>
                        <div style={{ flex: 1, padding: "10px 12px" }}>
                          <div style={{ fontSize: 13, color: WB.text }}>{st.title}</div>
                          <div style={{ fontSize: 11, color: WB.muted, marginTop: 2 }}>{st.detail}</div>
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
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: WB.muted3,
                  marginBottom: 10,
                }}
              >
                {fysHead}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {exercises.map((ex, i) => (
                  <div key={ex.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: WB.cardBg,
                        border: `1px solid ${WB.panelBorder}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: FONT.display,
                        fontWeight: 700,
                        fontSize: 15,
                        color: WB.lime,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: WB.text }}>{ex.name}</div>
                      <div style={{ fontSize: 11, color: WB.muted }}>{ex.meta}</div>
                    </div>
                    <ChevronRight size={16} color={WB.muted3} />
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: WB.cardBg,
                      border: `1px solid ${WB.panelBorder}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: WB.lime,
                    }}
                  >
                    <Plus size={18} />
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: WB.muted }}>Legg til øvelse</span>
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 10,
              marginTop: 14,
            }}
          >
            <InsightPanel
              eyebrow="Coach-notat · før økt"
              body="Coach legger inn notat i Workbench når notat-feltet er koblet til planen. Ingen notat lagret for denne økten ennå."
            />
            <InsightPanel
              eyebrow="SG-kobling · denne økten"
              body="Forventet SG-gevinst vises når FYS-formelen og økt-SG er låst. —"
              mono
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              background: "#0d241c",
              border: `1px solid ${WB.hairlineSoft}`,
              borderRadius: 10,
              padding: "10px 12px",
              marginTop: 14,
            }}
          >
            <Flag size={12} color={WB.lime} strokeWidth={1.9} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: WB.muted3,
                  marginBottom: 2,
                }}
              >
                Generert fra formel
              </div>
              <div style={{ fontFamily: FONT.mono, fontSize: 10, color: WB.lime, lineHeight: 1.45 }}>
                {formulaLine(s)}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onStart}
            style={{
              width: "100%",
              marginTop: 14,
              border: "none",
              background: WB.lime,
              color: WB.limeDark,
              borderRadius: 9999,
              padding: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Play size={16} fill={WB.limeDark} stroke="none" />
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Start økt nå
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function InsightPanel({
  eyebrow,
  body,
  mono,
}: {
  eyebrow: string;
  body: string;
  mono?: boolean;
}): ReactElement {
  return (
    <div
      style={{
        background: WB.cardBg,
        border: `1px solid ${WB.panelBorder}`,
        borderRadius: 10,
        padding: "12px 14px",
      }}
    >
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: WB.muted3,
          marginBottom: 6,
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          fontSize: mono ? 10 : 12,
          fontFamily: mono ? FONT.mono : undefined,
          color: mono ? WB.lime : WB.muted,
          lineHeight: 1.45,
        }}
      >
        {body}
      </div>
    </div>
  );
}

function omrSub(s: WbSession): string {
  const v = s.omr;
  const arr = Array.isArray(v) ? v : v ? [v] : ["TEE"];
  return arr.map((x) => dimLabel("omr", x)).join(", ");
}

function ModeTabs({
  mode,
  onMode,
}: {
  mode: PlanMode;
  onMode: (m: PlanMode) => void;
}): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        background: WB.railBg,
        border: `1px solid ${WB.panelBorder}`,
        borderRadius: 9999,
        padding: 3,
      }}
    >
      <TabSpan active={mode === "BANE"} onClick={() => onMode("BANE")}>
        Bane
      </TabSpan>
      <TabSpan active={mode === "RANGE"} onClick={() => onMode("RANGE")}>
        Range
      </TabSpan>
    </div>
  );
}

function TabSpan({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}): ReactElement {
  return (
    <span
      onClick={onClick}
      style={{
        fontSize: 10,
        padding: "4px 11px",
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