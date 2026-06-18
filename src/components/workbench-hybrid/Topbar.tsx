"use client";

import type { ReactElement } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { FONT, WB } from "./theme";
import type { ZoomLevel } from "./types";

const LEVELS: { key: ZoomLevel; label: string }[] = [
  { key: "arsplan", label: "Årsplan" },
  { key: "ar", label: "År" },
  { key: "maned", label: "Måned" },
  { key: "uke", label: "Uke" },
  { key: "dag", label: "Dag" },
];

type TopbarProps = {
  level: ZoomLevel;
  onLevel: (l: ZoomLevel) => void;
  playerName: string;
  initials: string;
  onAddSession: () => void;
};

export function Topbar({ level, onLevel, playerName, initials, onAddSession }: TopbarProps): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "0 18px",
        height: 56,
        borderBottom: `1px solid ${WB.panelBorder}`,
        flexShrink: 0,
      }}
    >
      {/* logo square */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          paddingRight: 14,
          borderRight: `1px solid ${WB.panelBorder}`,
        }}
      >
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: WB.lime,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 12px -2px rgba(209,248,67,0.55)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={WB.limeDark} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 22V4" />
            <path d="M6 4l11 2.6a1 1 0 0 1 .1 1.9L6 11.5" />
            <circle cx="6" cy="22" r="1.5" fill={WB.limeDark} />
          </svg>
        </span>
      </div>

      <span style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", color: WB.lime }}>
        WORKBENCH
      </span>

      {/* avatar pill */}
      <button
        type="button"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: WB.cardBg,
          border: `1px solid ${WB.panelBorder}`,
          borderRadius: 9999,
          padding: "5px 6px 5px 5px",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: WB.railBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: WB.lime,
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 10,
          }}
        >
          {initials}
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: WB.text }}>{playerName}</span>
        <ChevronDown size={13} color={WB.muted} strokeWidth={2} />
      </button>

      {/* zoom tabs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          background: WB.railBg,
          border: `1px solid ${WB.panelBorder}`,
          borderRadius: 9999,
          padding: 3,
          marginLeft: 6,
        }}
      >
        {LEVELS.map((lv) => {
          const active = level === lv.key;
          return (
            <button
              key={lv.key}
              type="button"
              onClick={() => onLevel(lv.key)}
              style={{
                fontSize: 12,
                padding: "6px 13px",
                borderRadius: 9999,
                cursor: "pointer",
                border: "none",
                fontWeight: active ? 700 : 400,
                color: active ? WB.limeDark : WB.muted,
                background: active ? WB.lime : "transparent",
              }}
            >
              {lv.label}
            </button>
          );
        })}
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <button
          type="button"
          onClick={onAddSession}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            background: WB.lime,
            color: WB.limeDark,
            border: "none",
            borderRadius: 9999,
            padding: "8px 14px",
            cursor: "pointer",
            fontFamily: FONT.mono,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          <Plus size={15} strokeWidth={2.4} />
          Ny økt
        </button>
      </div>
    </div>
  );
}
