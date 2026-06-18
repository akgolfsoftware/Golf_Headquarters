"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import Link from "next/link";
import { ChevronDown, Plus, Sparkles } from "lucide-react";
import { FONT, WB } from "./theme";
import type { WorkbenchRole, ZoomLevel } from "./types";

const LEVELS: { key: ZoomLevel; label: string }[] = [
  { key: "arsplan", label: "Årsplan" },
  { key: "ar", label: "År" },
  { key: "maned", label: "Måned" },
  { key: "uke", label: "Uke" },
  { key: "dag", label: "Dag" },
];

/** En spiller i coach-velgeren. */
export type RosterPlayer = { id: string; name: string; initials: string };

type TopbarProps = {
  level: ZoomLevel;
  onLevel: (l: ZoomLevel) => void;
  playerName: string;
  initials: string;
  onAddSession: () => void;
  role: WorkbenchRole;
  /** Coach-modus: spiller-roster for velgeren. */
  players?: RosterPlayer[];
  /** Coach-modus: id på spilleren som vises nå (uthevet i menyen). */
  currentPlayerId?: string;
  /** Coach-modus: åpne Coach-Skill-veiviseren. */
  onOpenCoachSkill?: () => void;
};

export function Topbar({
  level,
  onLevel,
  playerName,
  initials,
  onAddSession,
  role,
  players,
  currentPlayerId,
  onOpenCoachSkill,
}: TopbarProps): ReactElement {
  const isCoach = role === "coach";

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

      {/* avatar pill / player-selector */}
      {isCoach ? (
        <PlayerSelector
          playerName={playerName}
          initials={initials}
          players={players ?? []}
          currentPlayerId={currentPlayerId}
        />
      ) : (
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
      )}

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
        {isCoach && onOpenCoachSkill && (
          <button
            type="button"
            onClick={onOpenCoachSkill}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: WB.cardBg,
              color: WB.text,
              border: `1px solid ${WB.panelBorder}`,
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
            <Sparkles size={15} strokeWidth={2.2} color={WB.lime} />
            Coach-Skill
          </button>
        )}
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

type PlayerSelectorProps = {
  playerName: string;
  initials: string;
  players: RosterPlayer[];
  currentPlayerId?: string;
};

/**
 * Coach-modus: spiller-velger. Pillen viser nåværende spiller; menyen lar
 * coachen bytte spiller — valg navigerer til den spillerens Workbench-rute.
 */
function PlayerSelector({ playerName, initials, players, currentPlayerId }: PlayerSelectorProps): ReactElement {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: WB.cardBg,
          border: `1px solid ${WB.panelBorder}`,
          borderRadius: 9999,
          padding: "5px 10px 5px 5px",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: WB.forest,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: WB.lime,
            fontFamily: FONT.mono,
            fontWeight: 700,
            fontSize: 9.5,
          }}
        >
          {initials}
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: WB.text }}>{playerName}</span>
        <ChevronDown size={13} color={WB.muted} strokeWidth={2} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 60,
            width: 264,
            maxHeight: 360,
            overflowY: "auto",
            background: WB.panelBg,
            border: `1px solid ${WB.panelBorder}`,
            borderRadius: 12,
            boxShadow: "0 24px 48px -18px rgba(0,0,0,0.6)",
            padding: 6,
          }}
        >
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: WB.muted3,
              padding: "8px 10px 6px",
            }}
          >
            Bytt spiller
          </div>
          {players.length === 0 && (
            <div style={{ fontSize: 12.5, color: WB.muted, padding: "8px 10px 12px" }}>Ingen spillere funnet.</div>
          )}
          {players.map((p) => {
            const active = p.id === currentPlayerId;
            return (
              <Link
                key={p.id}
                href={`/admin/spillere/${p.id}/workbench`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 9,
                  textDecoration: "none",
                  background: active ? "rgba(209,248,67,0.08)" : "transparent",
                  border: `1px solid ${active ? WB.lime : "transparent"}`,
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: active ? WB.forest : WB.railBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: WB.lime,
                    fontFamily: FONT.mono,
                    fontWeight: 700,
                    fontSize: 9.5,
                  }}
                >
                  {p.initials}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: WB.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.name}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
