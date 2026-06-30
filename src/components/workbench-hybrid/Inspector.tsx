"use client";

import type { ReactElement } from "react";
import { Clock, Play, List, Minus, Plus, Repeat, Trash2, X } from "lucide-react";
import { CAT_COLORS, FONT, WB } from "./theme";
import type { DimField } from "./taxonomy";
import { buildDimensions, durLabel, recurSummary, type DimRow } from "./helpers";
import type { PaletteItem, WbSession } from "./types";
import type { BruddRad } from "@/lib/canon/valider-plan";
import { BruddPanel } from "./CanonValidering";

const chipBase = (color: string): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  fontFamily: FONT.mono,
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: "0.02em",
  background: WB.cardBg,
  border: `1px solid ${WB.panelBorder}`,
  borderRadius: 9999,
  padding: "5px 11px",
  cursor: "pointer",
  color,
});

function DimensionRows({
  dims,
  cat,
  onDimClick,
  onRemoveMulti,
  readOnly = false,
  bruddFelt,
}: {
  dims: DimRow[];
  cat: string;
  onDimClick: (field: DimField) => void;
  onRemoveMulti: (field: DimField, value: string) => void;
  /** Spiller får lese-visning (ingen klikkbare chips). */
  readOnly?: boolean;
  /** Felt med aktivt invariant-brudd → rød (hard) / amber (myk) kant. */
  bruddFelt?: Partial<Record<DimField, "hard" | "myk">>;
}): ReactElement {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
      {dims.map((dim) => {
        const chipColor =
          dim.field === "cat" ? CAT_COLORS[cat as keyof typeof CAT_COLORS] ?? WB.lime : WB.lime;
        const bf = bruddFelt?.[dim.field];
        const bdr = bf ? (bf === "hard" ? WB.err : WB.warn) : WB.panelBorder;
        return (
        <div key={dim.field} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <span style={{ fontSize: 11.5, color: WB.muted, paddingTop: 5 }}>{dim.label}</span>
          {dim.single &&
            (readOnly ? (
              <span style={{ ...chipBase(chipColor), cursor: "default", border: `1px solid ${bdr}` }}>{dim.value}</span>
            ) : (
              <button type="button" onClick={() => onDimClick(dim.field)} style={{ ...chipBase(chipColor), border: `1px solid ${bdr}` }}>
                {dim.value}
              </button>
            ))}
          {dim.multi && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "flex-end", maxWidth: "66%" }}>
              {dim.chips.map((ch) => (
                <span
                  key={ch.value}
                  onClick={readOnly ? undefined : () => onRemoveMulti(dim.field, ch.value)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontFamily: FONT.mono,
                    fontSize: 10,
                    fontWeight: 700,
                    background: WB.cardBg,
                    border: `1px solid ${WB.panelBorder}`,
                    borderRadius: 9999,
                    padding: "5px 9px",
                    cursor: readOnly ? "default" : "pointer",
                    color: CAT_COLORS.SLAG,
                  }}
                >
                  {ch.label}
                  {!readOnly && <span style={{ opacity: 0.6 }}>×</span>}
                </span>
              ))}
              {!readOnly && (
              <button
                type="button"
                onClick={() => onDimClick(dim.field)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 26,
                  height: 26,
                  borderRadius: 9999,
                  background: WB.railBg,
                  border: `1px dashed ${WB.panelBorder}`,
                  color: WB.lime,
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                +
              </button>
              )}
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
}

const formelHeader = (label: string, readOnly = false): ReactElement => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
    <span style={{ fontFamily: FONT.mono, fontSize: 9.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: WB.muted3 }}>
      {label}
    </span>
    <span style={{ fontFamily: FONT.mono, fontSize: 9, color: "#3f6354" }}>{readOnly ? "lese-visning" : "klikk for å endre"}</span>
  </div>
);

const tag = (cat: string, label: string): ReactElement => {
  const c = CAT_COLORS[cat as keyof typeof CAT_COLORS] ?? WB.lime;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        background: `${c}29`,
        color: c,
        fontFamily: FONT.mono,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        borderRadius: 9999,
        padding: "4px 10px",
      }}
    >
      {label}
    </span>
  );
};

type InspectorMode =
  | { kind: "empty" }
  | { kind: "palette"; item: PaletteItem }
  | { kind: "session"; session: WbSession; dayLabel: string };

type InspectorProps = {
  mode: InspectorMode;
  onClose: () => void;
  onDimClick: (field: DimField) => void;
  onRemoveMulti: (field: DimField, value: string) => void;
  /** Spiller får lese-visning av AK-formel-chips (coach kan redigere). */
  readOnly?: boolean;
  /** "rail" (desktop høyre-kolonne) | "sheet" (mobil bunn-ark). */
  variant?: "rail" | "sheet";
  // CANON-validering (Lag A)
  bruddFelt?: Partial<Record<DimField, "hard" | "myk">>;
  brudd?: BruddRad[];
  isCoach?: boolean;
  overrides?: Set<string>;
  onOverstyr?: (invariantId: string, begrunnelse: string) => void;
  // palette editor
  onPaletteTitle?: (title: string) => void;
  onPaletteDur?: (delta: number) => void;
  // session
  onRemoveSession?: () => void;
  onStart?: () => void;
  onOpenPlan?: () => void;
  onOpenRecur?: () => void;
  onOpenBank?: () => void;
};

export function Inspector({
  mode,
  onClose,
  onDimClick,
  onRemoveMulti,
  readOnly = false,
  variant = "rail",
  bruddFelt,
  brudd = [],
  isCoach = false,
  overrides,
  onOverstyr,
  onPaletteTitle,
  onPaletteDur,
  onRemoveSession,
  onStart,
  onOpenPlan,
  onOpenRecur,
  onOpenBank,
}: InspectorProps): ReactElement {
  const overrideSet = overrides ?? new Set<string>();
  // Mobil bunn-ark: full bredde, ingen venstre-kant, runde topp-hjørner.
  const containerStyle: React.CSSProperties =
    variant === "sheet"
      ? {
          width: "100%",
          background: WB.railBg,
          padding: 18,
          overflowY: "auto",
          position: "relative",
          maxHeight: "100%",
        }
      : {
          width: 300,
          borderLeft: `1px solid ${WB.panelBorder}`,
          background: WB.railBg,
          padding: 18,
          flexShrink: 0,
          overflowY: "auto",
          position: "relative",
        };

  return (
    <div className="wb-scroll" style={containerStyle}>
      <button
        type="button"
        onClick={onClose}
        title="Lukk"
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 5,
          width: 28,
          height: 28,
          borderRadius: 8,
          border: `1px solid ${WB.panelBorder}`,
          background: WB.cardBg,
          color: WB.muted,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <X size={14} />
      </button>

      {mode.kind === "empty" && (
        <div style={{ paddingTop: 40, textAlign: "center", color: WB.muted3 }}>
          <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 16, color: WB.muted2, marginBottom: 6 }}>
            Ingenting valgt
          </div>
          <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0 }}>
            Klikk en økt i kalenderen eller en standardøkt i panelet for å redigere AK-formelen.
          </p>
        </div>
      )}

      {mode.kind === "palette" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            {tag(mode.item.cat, "Standardøkt · mal")}
          </div>
          <input
            value={mode.item.title}
            onChange={(e) => onPaletteTitle?.(e.target.value)}
            style={{
              width: "100%",
              background: WB.railBg,
              border: `1px solid ${WB.panelBorder}`,
              borderRadius: 9,
              padding: "10px 12px",
              color: WB.text,
              fontFamily: FONT.display,
              fontWeight: 700,
              fontSize: 18,
              marginBottom: 14,
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: WB.cardBg,
              border: `1px solid ${WB.panelBorder}`,
              borderRadius: 10,
              padding: "10px 12px",
              marginBottom: 18,
            }}
          >
            <span style={{ fontSize: 12.5, color: WB.muted }}>Standard varighet</span>
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <button type="button" onClick={() => onPaletteDur?.(-15)} style={stepBtn}>
                <Minus size={14} />
              </button>
              <span style={{ minWidth: 58, textAlign: "center", fontFamily: FONT.display, fontWeight: 700, fontSize: 15, color: WB.text }}>
                {durLabel(mode.item.dur)}
              </span>
              <button type="button" onClick={() => onPaletteDur?.(15)} style={stepBtn}>
                <Plus size={14} />
              </button>
            </div>
          </div>

          {formelHeader("AK-formel · mal", readOnly)}
          <DimensionRows dims={buildDimensions(mode.item)} cat={mode.item.cat} onDimClick={onDimClick} onRemoveMulti={onRemoveMulti} readOnly={readOnly} />
          <p
            style={{
              margin: 0,
              fontSize: 11.5,
              lineHeight: 1.5,
              color: WB.muted3,
              background: "#0d241c",
              border: `1px solid ${WB.hairlineSoft}`,
              borderRadius: 9,
              padding: "10px 12px",
            }}
          >
            Dette er en mal. Dra den inn i uka eller dagen — den arver formelen du setter her.
          </p>
        </div>
      )}

      {mode.kind === "session" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            {tag(mode.session.cat, mode.session.cat)}
            <button
              type="button"
              onClick={onRemoveSession}
              title="Fjern økt"
              style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: WB.cardBg, color: WB.err, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Trash2 size={15} />
            </button>
          </div>
          <h3 style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 21, color: WB.text, margin: "0 0 6px", lineHeight: 1.1 }}>
            {mode.session.title}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: WB.muted, marginBottom: 18 }}>
            <Clock size={14} color={WB.muted} strokeWidth={1.8} />
            {mode.dayLabel} · {durLabel(mode.session.dur)}
          </div>

          {formelHeader("AK-formel · kodet", readOnly)}
          <DimensionRows dims={buildDimensions(mode.session)} cat={mode.session.cat} onDimClick={onDimClick} onRemoveMulti={onRemoveMulti} readOnly={readOnly} bruddFelt={bruddFelt} />

          <BruddPanel brudd={brudd} isCoach={isCoach} overrides={overrideSet} onOverstyr={onOverstyr} />

          {/* GJENTA UKENTLIG */}
          {(() => {
            const on = !!mode.session.recur && mode.session.recur.freq !== "none";
            return (
              <div
                onClick={onOpenRecur}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  background: WB.cardBg,
                  border: `1px solid ${WB.panelBorder}`,
                  borderRadius: 10,
                  padding: "11px 12px",
                  marginBottom: 12,
                  cursor: onOpenRecur ? "pointer" : "default",
                }}
              >
                <Repeat size={16} color={on ? WB.lime : WB.muted3} strokeWidth={1.9} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: WB.text }}>Gjenta ukentlig</div>
                  <div style={{ fontSize: 10.5, color: WB.muted }}>{recurSummary(mode.session.recur)}</div>
                </div>
                <span
                  style={{
                    width: 38,
                    height: 22,
                    borderRadius: 9999,
                    padding: 2,
                    display: "flex",
                    alignItems: "center",
                    background: on ? WB.lime : WB.panelBorder,
                    justifyContent: on ? "flex-end" : "flex-start",
                  }}
                >
                  <span style={{ width: 18, height: 18, borderRadius: "50%", background: on ? WB.limeDark : WB.muted }} />
                </span>
              </div>
            );
          })()}

          {/* ØVELSESBANK */}
          <button
            type="button"
            onClick={onOpenBank}
            disabled={!onOpenBank}
            style={{
              width: "100%",
              marginBottom: 9,
              border: `1px solid ${WB.panelBorder}`,
              background: WB.cardBg,
              color: WB.muted2,
              borderRadius: 10,
              padding: 11,
              cursor: onOpenBank ? "pointer" : "not-allowed",
              opacity: onOpenBank ? 1 : 0.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            <Plus size={15} color={WB.lime} strokeWidth={2} />
            {mode.session.cat === "FYS" ? "Legg til øvelse" : "Legg til drill"}
          </button>

          <div style={{ display: "flex", gap: 9 }}>
            <button
              type="button"
              onClick={onOpenPlan}
              disabled={!onOpenPlan}
              style={{
                flex: 1,
                border: `1px solid ${WB.panelBorder}`,
                background: WB.cardBg,
                color: WB.text,
                borderRadius: 9999,
                padding: 13,
                cursor: onOpenPlan ? "pointer" : "not-allowed",
                opacity: onOpenPlan ? 1 : 0.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <List size={16} color={WB.lime} strokeWidth={1.9} />
              <span style={{ fontFamily: FONT.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase" }}>Øktplan</span>
            </button>
            <button
              type="button"
              onClick={onStart}
              style={{
                flex: 1,
                border: "none",
                background: WB.lime,
                color: WB.limeDark,
                borderRadius: 9999,
                padding: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Play size={16} fill={WB.limeDark} stroke="none" />
              <span style={{ fontFamily: FONT.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase" }}>Start</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const stepBtn: React.CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: "50%",
  border: "none",
  background: WB.railBg,
  color: WB.text,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export type { InspectorMode };
