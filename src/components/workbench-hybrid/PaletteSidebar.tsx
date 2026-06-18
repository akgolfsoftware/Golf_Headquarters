"use client";

import type { ReactElement } from "react";
import { ChevronRight, GripVertical, Plus, CheckSquare } from "lucide-react";
import { CAT_COLORS, FONT, WB } from "./theme";
import { durLabel } from "./helpers";
import type { PaletteItem, WbGoal } from "./types";

type PanelKey = "palette" | "goals" | "tests" | "tech";

type PaletteSidebarProps = {
  open: Record<PanelKey, boolean>;
  onToggle: (k: PanelKey) => void;
  palette: PaletteItem[];
  selectedPaletteId: string | null;
  goals: WbGoal[];
  sideTests: string[];
  testCount: string;
  onPaletteClick: (pid: string) => void;
  onPaletteDragStart: (pid: string) => void;
  onAddPalette: () => void;
};

const groupHeader = (
  label: string,
  count: string | number,
  open: boolean,
  onClick: () => void,
): ReactElement => (
  <div
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 9,
      padding: "10px 11px",
      borderRadius: 10,
      background: WB.cardBgAlt,
      border: `1px solid ${WB.innerBorderSoft}`,
      cursor: "pointer",
    }}
  >
    <ChevronRight
      size={13}
      color={WB.muted}
      strokeWidth={2.2}
      style={{ transform: `rotate(${open ? 90 : 0}deg)`, transition: "transform .15s" }}
    />
    <span
      style={{
        flex: 1,
        fontFamily: FONT.mono,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: WB.muted2,
      }}
    >
      {label}
    </span>
    <span style={{ fontSize: 10, fontWeight: 700, color: WB.muted3 }}>{count}</span>
  </div>
);

export function PaletteSidebar({
  open,
  onToggle,
  palette,
  selectedPaletteId,
  goals,
  sideTests,
  testCount,
  onPaletteClick,
  onPaletteDragStart,
  onAddPalette,
}: PaletteSidebarProps): ReactElement {
  return (
    <div
      className="wb-scroll"
      style={{
        width: 230,
        borderRight: `1px solid ${WB.panelBorder}`,
        background: WB.railBg,
        padding: "16px 14px",
        flexShrink: 0,
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {/* STANDARDØKTER */}
        <div>
          {groupHeader("Standardøkter", palette.length, open.palette, () => onToggle("palette"))}
          {open.palette && (
            <div style={{ padding: "8px 2px 4px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {palette.map((p) => {
                  const active = selectedPaletteId === p.pid;
                  return (
                    <div
                      key={p.pid}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "copy";
                        e.dataTransfer.setData("text/plain", p.pid);
                        onPaletteDragStart(p.pid);
                      }}
                      onClick={() => onPaletteClick(p.pid)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        background: active ? "#1d3a2e" : WB.cardBg,
                        borderTop: `1px solid ${active ? WB.lime : WB.panelBorder}`,
                        borderRight: `1px solid ${active ? WB.lime : WB.panelBorder}`,
                        borderBottom: `1px solid ${active ? WB.lime : WB.panelBorder}`,
                        borderLeft: `3px solid ${CAT_COLORS[p.cat]}`,
                        borderRadius: 10,
                        padding: "10px 11px",
                        cursor: "grab",
                        boxShadow: active ? "0 0 0 3px rgba(209,248,67,0.1)" : undefined,
                      }}
                    >
                      <GripVertical size={13} color={WB.muted3} strokeWidth={2} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: WB.text,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {p.title}
                        </div>
                        <div style={{ fontSize: 10.5, color: WB.muted }}>
                          {durLabel(p.dur)} · {p.cat}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={onAddPalette}
                  style={{
                    width: "100%",
                    border: `1px dashed ${WB.panelBorder}`,
                    background: "transparent",
                    color: WB.muted,
                    borderRadius: 10,
                    padding: 9,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <Plus size={14} color={WB.lime} strokeWidth={2.2} />
                  Ny standardøkt
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SESONGMÅL */}
        <div>
          {groupHeader("Sesongmål", goals.length || "", open.goals, () => onToggle("goals"))}
          {open.goals && (
            <div style={{ padding: "8px 2px 4px", display: "flex", flexDirection: "column", gap: 6 }}>
              {goals.map((g, i) => (
                <div
                  key={`${g.gn}-${i}`}
                  style={{
                    background: WB.cardBgAlt,
                    borderTop: `1px solid ${WB.innerBorderSoft}`,
                    borderRight: `1px solid ${WB.innerBorderSoft}`,
                    borderBottom: `1px solid ${WB.innerBorderSoft}`,
                    borderLeft: `3px solid ${CAT_COLORS[g.ax]}`,
                    borderRadius: 9,
                    padding: "9px 10px",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: WB.text }}>{g.gn}</div>
                  <div
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: 8.5,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      color: WB.muted3,
                      marginTop: 2,
                    }}
                  >
                    {g.gm}
                  </div>
                </div>
              ))}
              <button
                type="button"
                style={{
                  width: "100%",
                  border: `1px dashed ${WB.panelBorder}`,
                  background: "transparent",
                  color: WB.muted,
                  borderRadius: 10,
                  padding: 9,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <Plus size={14} color={WB.lime} strokeWidth={2.2} />
                Opprett nytt mål
              </button>
            </div>
          )}
        </div>

        {/* TESTER */}
        <div>
          {groupHeader("Testbatteri", testCount, open.tests, () => onToggle("tests"))}
          {open.tests && (
            <div style={{ padding: "8px 2px 4px", display: "flex", flexDirection: "column", gap: 6 }}>
              {sideTests.map((t) => (
                <div
                  key={t}
                  draggable
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    background: WB.cardBgAlt,
                    border: `1px solid ${WB.innerBorderSoft}`,
                    borderRadius: 9,
                    padding: "9px 10px",
                    cursor: "grab",
                  }}
                >
                  <CheckSquare size={13} color={CAT_COLORS.SLAG} strokeWidth={2} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: WB.text }}>{t}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TEKNISK PLAN */}
        <div>
          {groupHeader("Teknisk plan", "", open.tech, () => onToggle("tech"))}
          {open.tech && (
            <div style={{ padding: "8px 2px 4px" }}>
              <div style={{ fontSize: 11.5, lineHeight: 1.5, color: "#7c8a82", padding: "2px 4px" }}>
                Driver, jern, wedge, putt — åpne teknisk plan for å redigere posisjoner og arbeidsoppgaver.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
