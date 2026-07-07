"use client";

import type { ReactElement } from "react";
import { Calendar, ChevronLeft, Clock, Flag, Gauge, Pencil, Play, Timer } from "lucide-react";
import { CAT_COLORS, FONT, WB } from "./theme";
import { durLabel, formulaLine } from "./helpers";
import { dimLabel } from "./taxonomy";
import type { PlanMode } from "./OktplanOverlay";
import type { WbSession, WeekKey } from "./types";
import { DrillProgram } from "./DrillProgram";

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
  /** Coach-only: hurtighandlinger, modus-valg, legg til øvelse, notat/SG-paneler. */
  isCoach?: boolean;
};

/** Inline økt-detalj for hub-fanen «Økt» (fasit wb-10, ikke dag-tidslinje). */
export function OktDetailTab({
  session: s,
  dayKey,
  mode,
  onMode,
  onBackToWeek,
  onStart,
  isCoach = false,
}: OktDetailTabProps): ReactElement {
  const isFys = s.cat === "FYS";
  const catColor = CAT_COLORS[s.cat] ?? WB.lime;
  const dayLabel = DAY_NAMES[dayKey] ?? "Ukedag";
  const subLabel =
    (isFys ? dimLabel("fysType", s.fysType || "STYRKE") : omrSub(s)) +
    ` · ${s.cat} · ${dayLabel}`;
  const dur = durLabel(s.dur) + (s.time && s.time !== "—" ? ` · fra ${s.time}` : "");

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
            background: "linear-gradient(155deg, var(--forest-800), var(--forest-700))",
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
                background: WB.limeSoft,
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
              color: "var(--sand-0)",
              margin: "0 0 6px",
            }}
          >
            {s.title}
          </h2>
          <div style={{ fontSize: 13, color: "color-mix(in srgb, var(--sand-0) 78%, transparent)", marginBottom: 12 }}>{subLabel}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--sand-0)" }}>
            <Clock size={16} strokeWidth={1.8} />
            <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 16 }}>{dur}</span>
          </div>
        </div>

        {isCoach && (
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
        )}

        <div style={{ padding: "16px 16px 20px" }}>
          {!isFys && isCoach && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
              <ModeTabs mode={mode} onMode={onMode} />
            </div>
          )}

          <DrillProgram
            sessionId={s.id}
            defaults={{
              pyramidArea: s.cat,
              lfase: s.lfase,
              m: s.m,
              pr: s.pr,
              cs: s.cs,
              ppos: s.ppos,
            }}
            isCoach={isCoach}
          />

          {isCoach && (
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
          )}

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              background: WB.cardBgAlt,
              border: `1px solid ${WB.hairlineSoft}`,
              borderRadius: 10,
              padding: "10px 12px",
              marginTop: 14,
            }}
          >
            <Flag size={12} strokeWidth={1.9} style={{ color: WB.lime, flexShrink: 0, marginTop: 1 }} />
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
            <Play size={16} style={{ fill: WB.limeDark }} stroke="none" />
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