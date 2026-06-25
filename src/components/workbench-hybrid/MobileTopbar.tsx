"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import Link from "next/link";
import { Bot, ChevronDown, LayoutGrid, Plus, Send, Sparkles } from "lucide-react";
import type { PlanStatus } from "@/generated/prisma/client";
import { FONT, WB } from "./theme";
import type { WorkbenchRole, ZoomLevel } from "./types";
import type { RosterPlayer } from "./Topbar";

const LEVELS: { key: ZoomLevel; label: string }[] = [
  { key: "arsplan", label: "Årsplan" },
  { key: "ar", label: "År" },
  { key: "maned", label: "Måned" },
  { key: "uke", label: "Uke" },
  { key: "dag", label: "Dag" },
];

const PLAN_STATUS_LABEL: Record<PlanStatus, string> = {
  DRAFT: "Utkast",
  PENDING_PLAYER: "Venter",
  ACCEPTED: "Godtatt",
  REJECTED: "Endring",
  ACTIVE: "Aktiv",
  PAUSED: "Pause",
  ARCHIVED: "Arkiv",
};

type MobileTopbarProps = {
  playerName: string;
  initials: string;
  onAddSession: () => void;
  onOpenPalette: () => void;
  role: WorkbenchRole;
  players?: RosterPlayer[];
  currentPlayerId?: string;
  onOpenCoachSkill?: () => void;
  onOpenAiPlan?: () => void;
  onOpenAiPeriodiser?: () => void;
  planStatus?: PlanStatus | null;
  onPublish?: () => void;
  publishPending?: boolean;
};

/**
 * Kompakt mobil-topbar: WORKBENCH-ordmerke + spiller/spiller-velger + handlinger
 * (palette-knapp, Coach-Skill i coach-modus, Ny økt). Erstatter den brede
 * desktop-Topbar-en med logo + 5 faner + 2 knapper på én linje.
 */
export function MobileTopbar({
  playerName,
  initials,
  onAddSession,
  onOpenPalette,
  role,
  players,
  currentPlayerId,
  onOpenCoachSkill,
  onOpenAiPlan,
  onOpenAiPeriodiser,
  planStatus,
  onPublish,
  publishPending,
}: MobileTopbarProps): ReactElement {
  const isCoach = role === "coach";
  const canPublish =
    onPublish && planStatus && (planStatus === "DRAFT" || planStatus === "REJECTED");

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 12px",
        minHeight: 54,
        borderBottom: `1px solid ${WB.panelBorder}`,
        flexShrink: 0,
      }}
    >
      <span style={{ fontFamily: FONT.mono, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.12em", color: WB.lime, flexShrink: 0 }}>
        WORKBENCH
      </span>

      {isCoach ? (
        <MobilePlayerSelector playerName={playerName} initials={initials} players={players ?? []} currentPlayerId={currentPlayerId} />
      ) : (
        <button
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            minWidth: 0,
            background: WB.cardBg,
            border: `1px solid ${WB.panelBorder}`,
            borderRadius: 9999,
            padding: "4px 6px 4px 5px",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              width: 24,
              height: 24,
              flexShrink: 0,
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
          <span style={{ fontSize: 12, fontWeight: 600, color: WB.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {playerName}
          </span>
          <ChevronDown size={12} color={WB.muted} strokeWidth={2} style={{ flexShrink: 0 }} />
        </button>
      )}

      {planStatus && (
        <span
          data-testid="plan-status-pill"
          style={{
            fontFamily: FONT.mono,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "4px 8px",
            borderRadius: 999,
            background: `${WB.lime}18`,
            color: WB.lime,
            flexShrink: 0,
          }}
        >
          {PLAN_STATUS_LABEL[planStatus]}
        </span>
      )}

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
        {canPublish && (
          <button
            type="button"
            onClick={onPublish}
            disabled={publishPending}
            aria-label="Publiser plan"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              border: "none",
              background: WB.lime,
              color: WB.limeDark,
              cursor: publishPending ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: publishPending ? 0.7 : 1,
            }}
          >
            <Send size={17} strokeWidth={2.2} />
          </button>
        )}
        {(onOpenAiPlan || onOpenAiPeriodiser) && (
          <button
            type="button"
            onClick={isCoach ? onOpenAiPlan : onOpenAiPeriodiser}
            aria-label={isCoach ? "Generer plan" : "AI-periodiser"}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              border: `1px solid ${WB.panelBorder}`,
              background: WB.cardBg,
              color: WB.lime,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bot size={18} strokeWidth={2} />
          </button>
        )}
        <button
          type="button"
          onClick={onOpenPalette}
          aria-label="Standardøkter"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            border: `1px solid ${WB.panelBorder}`,
            background: WB.cardBg,
            color: WB.lime,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LayoutGrid size={18} strokeWidth={2} />
        </button>
        {isCoach && onOpenCoachSkill && (
          <button
            type="button"
            onClick={onOpenCoachSkill}
            aria-label="Coach-Skill"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              border: `1px solid ${WB.panelBorder}`,
              background: WB.cardBg,
              color: WB.lime,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={18} strokeWidth={2.2} />
          </button>
        )}
        <button
          type="button"
          onClick={onAddSession}
          aria-label="Ny økt"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            border: "none",
            background: WB.lime,
            color: WB.limeDark,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Plus size={20} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}

type MobileZoomRailProps = {
  level: ZoomLevel;
  onLevel: (l: ZoomLevel) => void;
};

/**
 * Zoom-nivå-rail (Årsplan/År/Måned/Uke/Dag) som horisontalt-scrollbar pill-rad.
 * Gjenbruker level-state fra reduceren.
 */
export function MobileZoomRail({ level, onLevel }: MobileZoomRailProps): ReactElement {
  return (
    <div
      className="wb-scroll"
      style={{
        display: "flex",
        gap: 7,
        padding: "10px 12px",
        overflowX: "auto",
        borderBottom: `1px solid ${WB.panelBorder}`,
        flexShrink: 0,
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
              flexShrink: 0,
              minHeight: 40,
              padding: "0 18px",
              borderRadius: 9999,
              border: `1px solid ${active ? WB.lime : WB.panelBorder}`,
              cursor: "pointer",
              fontFamily: FONT.mono,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: active ? WB.limeDark : WB.muted2,
              background: active ? WB.lime : WB.cardBg,
            }}
          >
            {lv.label}
          </button>
        );
      })}
    </div>
  );
}

/** Mobil-versjon av coach-spiller-velgeren (samme oppførsel, kompakt). */
function MobilePlayerSelector({ playerName, initials, players, currentPlayerId }: { playerName: string; initials: string; players: RosterPlayer[]; currentPlayerId?: string }): ReactElement {
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
    <div ref={ref} style={{ position: "relative", minWidth: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          minWidth: 0,
          background: WB.cardBg,
          border: `1px solid ${WB.panelBorder}`,
          borderRadius: 9999,
          padding: "4px 9px 4px 5px",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            width: 24,
            height: 24,
            flexShrink: 0,
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
        <span style={{ fontSize: 12, fontWeight: 600, color: WB.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {playerName}
        </span>
        <ChevronDown size={12} color={WB.muted} strokeWidth={2} style={{ flexShrink: 0 }} />
      </button>

      {open && (
        <div
          className="wb-scroll"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 60,
            width: 244,
            maxHeight: 340,
            overflowY: "auto",
            background: WB.panelBg,
            border: `1px solid ${WB.panelBorder}`,
            borderRadius: 12,
            boxShadow: "0 24px 48px -18px rgba(0,0,0,0.6)",
            padding: 6,
          }}
        >
          <div style={{ fontFamily: FONT.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: WB.muted3, padding: "8px 10px 6px" }}>
            Bytt spiller
          </div>
          {players.length === 0 && <div style={{ fontSize: 12.5, color: WB.muted, padding: "8px 10px 12px" }}>Ingen spillere funnet.</div>}
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
                  minHeight: 44,
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
