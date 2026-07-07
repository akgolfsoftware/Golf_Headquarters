"use client";

import type { ReactElement } from "react";
import { GripVertical, Plus, Target, X } from "lucide-react";
import { CAT_COLORS, FONT, WB } from "./theme";
import { durLabel } from "./helpers";
import type { PaletteItem, WbGoal, WeekKey } from "./types";

const DAY_PICKS: { key: WeekKey; label: string }[] = [
  { key: "man", label: "Man" },
  { key: "tir", label: "Tir" },
  { key: "ons", label: "Ons" },
  { key: "tor", label: "Tor" },
  { key: "fre", label: "Fre" },
  { key: "lor", label: "Lør" },
  { key: "son", label: "Søn" },
];

type MobilePaletteSheetProps = {
  open: boolean;
  onClose: () => void;
  palette: PaletteItem[];
  goals: WbGoal[];
  sideTests: string[];
  testCount: string;
  /** Hvilken dag tap-to-add treffer (kun relevant i Uke/Måned/År). */
  targetDay: WeekKey;
  onTargetDay: (day: WeekKey) => void;
  /** Tap-to-add — touch-fallback for drag-and-drop. */
  onAddToDay: (pid: string) => void;
  /** Behold desktop-DnD: dra fra arket. */
  onPaletteDragStart: (pid: string) => void;
  onAddPalette: () => void;
};

/**
 * Mobil palette som bunn-ark (drawer). Erstatter den alltid-på 230px-sidekolonnen
 * på små skjermer. Drag-and-drop er vanskelig på touch → tap-to-add-fallback:
 * trykk en standardøkt for å legge den på valgt dag. Desktop-DnD beholdes (draggable),
 * så det fungerer på touch-enheter med pekeenhet også.
 */
export function MobilePaletteSheet({
  open,
  onClose,
  palette,
  goals,
  sideTests,
  testCount,
  targetDay,
  onTargetDay,
  onAddToDay,
  onPaletteDragStart,
  onAddPalette,
}: MobilePaletteSheetProps): ReactElement | null {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 75,
        background: WB.scrim,
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="wb-scroll"
        style={{
          width: "100%",
          maxHeight: "86vh",
          display: "flex",
          flexDirection: "column",
          background: WB.panelBg,
          borderTop: `1px solid ${WB.panelBorder}`,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: "hidden",
          boxShadow: "0 -24px 60px -20px rgba(0,0,0,0.35)",
        }}
      >
        {/* drag handle + header */}
        <div style={{ flexShrink: 0, padding: "10px 16px 12px", borderBottom: `1px solid ${WB.panelBorder}` }}>
          <div style={{ width: 38, height: 4, borderRadius: 9999, background: WB.panelBorder, margin: "0 auto 12px" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 17, color: WB.text }}>Standardøkter</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Lukk"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: `1px solid ${WB.panelBorder}`,
                background: WB.cardBg,
                color: WB.muted,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* dag-velger for tap-to-add */}
          <div style={{ marginTop: 12 }}>
            <span style={{ fontFamily: FONT.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: WB.muted3 }}>
              Legg til på dag
            </span>
            <div className="wb-scroll" style={{ display: "flex", gap: 6, marginTop: 7, overflowX: "auto" }}>
              {DAY_PICKS.map((d) => {
                const on = targetDay === d.key;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => onTargetDay(d.key)}
                    style={{
                      flexShrink: 0,
                      minHeight: 40,
                      padding: "0 16px",
                      borderRadius: 9999,
                      border: `1px solid ${on ? WB.lime : WB.panelBorder}`,
                      background: on ? WB.lime : WB.cardBg,
                      color: on ? WB.limeDark : WB.muted2,
                      fontFamily: FONT.mono,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* innhold */}
        <div className="wb-scroll" style={{ flex: 1, overflowY: "auto", padding: "14px 16px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
          {palette.map((p) => (
            <div
              key={p.pid}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "copy";
                e.dataTransfer.setData("text/plain", p.pid);
                onPaletteDragStart(p.pid);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                minHeight: 56,
                background: WB.cardBg,
                borderTop: `1px solid ${WB.panelBorder}`,
                borderRight: `1px solid ${WB.panelBorder}`,
                borderBottom: `1px solid ${WB.panelBorder}`,
                borderLeft: `3px solid ${CAT_COLORS[p.cat]}`,
                borderRadius: 12,
                padding: "10px 12px",
              }}
            >
              <GripVertical size={15} style={{ color: WB.muted3 }} strokeWidth={2} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: WB.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.title}
                </div>
                <div style={{ fontSize: 11, color: WB.muted }}>
                  {durLabel(p.dur)} · {p.cat}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onAddToDay(p.pid)}
                aria-label={`Legg ${p.title} til ${targetDay}`}
                style={{
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  minHeight: 44,
                  padding: "0 14px",
                  borderRadius: 9999,
                  border: "none",
                  background: WB.lime,
                  color: WB.limeDark,
                  fontFamily: FONT.mono,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                <Plus size={15} strokeWidth={2.4} />
                Legg til
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={onAddPalette}
            style={{
              width: "100%",
              minHeight: 48,
              border: `1px dashed ${WB.panelBorder}`,
              background: "transparent",
              color: WB.muted,
              borderRadius: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <Plus size={15} style={{ color: WB.lime }} strokeWidth={2.2} />
            Ny standardøkt
          </button>

          {/* Sesongmål */}
          {goals.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontFamily: FONT.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: WB.muted3, marginBottom: 8 }}>
                Sesongmål · {goals.length}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {goals.map((g, i) => (
                  <div
                    key={`${g.gn}-${i}`}
                    style={{
                      background: WB.cardBgAlt,
                      borderTop: `1px solid ${WB.innerBorderSoft}`,
                      borderRight: `1px solid ${WB.innerBorderSoft}`,
                      borderBottom: `1px solid ${WB.innerBorderSoft}`,
                      borderLeft: `3px solid ${CAT_COLORS[g.ax]}`,
                      borderRadius: 10,
                      padding: "10px 12px",
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: WB.text }}>{g.gn}</div>
                    <div style={{ fontFamily: FONT.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: WB.muted3, marginTop: 2 }}>
                      {g.gm}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Testbatteri */}
          {sideTests.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontFamily: FONT.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: WB.muted3, marginBottom: 8 }}>
                Testbatteri · {testCount}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {sideTests.map((t) => (
                  <span
                    key={t}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      background: WB.cardBgAlt,
                      border: `1px solid ${WB.innerBorderSoft}`,
                      borderRadius: 9999,
                      padding: "8px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      color: WB.text,
                    }}
                  >
                    <Target size={13} style={{ color: CAT_COLORS.SLAG }} strokeWidth={2} />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
