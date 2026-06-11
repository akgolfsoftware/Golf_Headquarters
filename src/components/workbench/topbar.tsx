"use client";

// ============================================================
// WBTopbar — ported fra v10 workbench-chrome.jsx (variant A).
//
// Tidligere var flere kontroller døde `type="button"` uten handler.
// Nå: PLAN A/B kobler til setActivePlanVariant (server action) via
// activePlanId/plans-props fra page.tsx. «Ny plan» og «Ny økt» åpner
// sheets via onNewPlan/onNewSession. Kontroller som ennå ikke har
// en client-handling (AI-chips, uke-nav, «Del plan», bjelle,
// ÅR/MND-zoom) er satt `disabled` med en «kommer»-tittel.
// ============================================================
import { useTransition } from "react";
import { PlusCircle, CalendarPlus } from "lucide-react";
import { Icon } from "./icon";
import { setActivePlanVariant } from "@/app/portal/planlegge/workbench/actions";
import type { Role, Mode, WorkbenchPlan } from "./workbench";

type TopbarProps = {
  role: Role;
  /** which mode-segment chip is lit */
  activeMode: "tidslinje" | "kanban" | "dashboard";
  /** which zoom-segment chip is lit */
  activeZoom: "ÅR" | "MND" | "UKE" | "DAG";
  onVis?: (v: "A" | "B") => void;
  onMode?: (m: Mode) => void;
  /** Id på aktiv TrainingPlan. Null = ingen plan ennå. */
  activePlanId?: string | null;
  /** Brukerens planer (maks 10) — brukes for å finne plan-B-id. */
  plans?: WorkbenchPlan[];
  /** Åpne sheet for ny treningsplan. */
  onNewPlan?: () => void;
  /** Åpne sheet for ny treningsøkt. */
  onNewSession?: () => void;
};

const ZOOMS: ("ÅR" | "MND" | "UKE" | "DAG")[] = ["ÅR", "MND", "UKE", "DAG"];

export function WBTopbar({ role, activeMode, activeZoom, onVis, onMode, activePlanId, plans = [], onNewPlan, onNewSession }: TopbarProps) {
  const [isPending, startTransition] = useTransition();

  // Finn plan B = første plan som IKKE er aktiv (om den finnes).
  const activePlan = plans.find((p) => p.id === activePlanId) ?? plans[0] ?? null;
  const otherPlan = plans.find((p) => p.id !== activePlan?.id) ?? null;

  function handlePlanSwitch(targetId: string | null) {
    if (!targetId || targetId === activePlanId || isPending) return;
    startTransition(async () => {
      await setActivePlanVariant(targetId);
    });
  }
  return (
    <div className="wb-top">
      {/* Left */}
      <div className="grp-l">
        <div className="wb-mono">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/workbench/logo-mark.svg" alt="AK Golf" />
        </div>
        <div className="wb-crumb">
          WORKBENCH · <span className="cur">PLANLEGGING</span> · PRO
        </div>
        <div
          className="wb-plan-toggle"
          role="tablist"
          aria-label="Plan"
          style={isPending ? { opacity: 0.6, pointerEvents: "none" } : undefined}
        >
          <button
            type="button"
            className={"seg" + (activePlan !== null ? " is-active" : "")}
            aria-pressed={activePlan !== null}
            title={activePlan?.name ?? "Ingen aktiv plan"}
            onClick={() => handlePlanSwitch(activePlan?.id ?? null)}
          >
            <span className="dot" />
            PLAN A
          </button>
          <button
            type="button"
            className={"seg" + (activePlanId === otherPlan?.id ? " is-active" : "")}
            aria-pressed={activePlanId === otherPlan?.id}
            title={otherPlan?.name ?? "Ingen plan B — opprett en ny plan"}
            disabled={!otherPlan}
            onClick={() => handlePlanSwitch(otherPlan?.id ?? null)}
          >
            <span className="dot" />
            PLAN B
          </button>
        </div>
        <div className="wb-vis-toggle" role="tablist" aria-label="Visning">
          <button
            type="button"
            className="seg"
            title="Liste-visning (B)"
            onClick={() => onVis?.("B")}
          >
            <Icon n="list" w={11} h={11} />
            Liste
          </button>
          <button
            type="button"
            className="seg is-active"
            title="Kalender-visning (A)"
            onClick={() => onVis?.("A")}
          >
            <Icon n="calendar-days" w={11} h={11} />
            Kalender
          </button>
        </div>
      </div>

      {/* Center — AI Command Bar */}
      <div className="grp-c">
        <div className="wb-ai">
          <div className="input-wrap">
            <span className="spk">
              <Icon n="sparkles" w={12} h={12} />
            </span>
            <input
              type="text"
              placeholder="Flytt mandags SLAG til onsdag og legg til en lett FYS …"
              defaultValue=""
            />
            <span className="kbd">⌘K</span>
          </div>
          <div className="chips">
            {/* AI-snarveier — kobles til generatoren senere. Disablet
                så de ikke ser klikkbare ut før de gjør noe. */}
            <button type="button" className="chip" disabled title="Kommer">
              Generér uke
            </button>
            <button type="button" className="chip" disabled title="Kommer">
              Balansér
            </button>
            <button type="button" className="chip" disabled title="Kommer">
              Foreslå taper
            </button>
            <button type="button" className="chip" disabled title="Kommer">
              Fyll standardøkter
            </button>
          </div>
        </div>
      </div>

      {/* Right — depending on role */}
      <div className="grp-r">
        {role === "coach" && (
          <>
            <div className="wb-search">
              <Icon n="search" w={14} h={14} />
              <input type="text" defaultValue="Øyvind R." />
            </div>
            <CoachBell />
          </>
        )}

        <div className="seg-group" role="tablist" aria-label="Zoom">
          {ZOOMS.map((z) => {
            // Kun UKE/DAG har en visning ennå; ÅR/MND disables til de finnes.
            const enabled = z === "UKE" || z === "DAG";
            return (
              <button
                key={z}
                type="button"
                className={"s" + (activeZoom === z ? " is-on" : "")}
                disabled={!enabled}
                title={enabled ? undefined : "Kommer"}
                onClick={enabled ? () => onMode?.(z) : undefined}
              >
                {z}
              </button>
            );
          })}
        </div>

        <div className="seg-group" role="tablist" aria-label="Visningsmodus">
          <button
            type="button"
            className={"s" + (activeMode === "tidslinje" ? " is-on" : "")}
            onClick={() => onMode?.("UKE")}
          >
            <Icon n="calendar-days" /> Tidslinje
          </button>
          <button
            type="button"
            className={"s" + (activeMode === "kanban" ? " is-on" : "")}
            onClick={() => onMode?.("KANBAN")}
          >
            <Icon n="columns-3" /> Kanban
          </button>
          <button
            type="button"
            className={"s" + (activeMode === "dashboard" ? " is-on" : "")}
            onClick={() => onMode?.("DASHBOARD")}
          >
            <Icon n="layout-grid" /> Dashboard
          </button>
        </div>

        {/* Uke-nav — krever uke-til-uke-data (ikke koblet ennå) → disabled. */}
        <div className="wb-nav-btns">
          <button
            type="button"
            className="wb-nav-btn"
            aria-label="Forrige uke"
            disabled
            title="Kommer"
          >
            <Icon n="chevron-left" />
          </button>
          <button
            type="button"
            className="wb-nav-btn"
            aria-label="Neste uke"
            disabled
            title="Kommer"
          >
            <Icon n="chevron-right" />
          </button>
        </div>

        <button
          type="button"
          className="wb-btn-ghost"
          title="Ny treningsøkt"
          onClick={onNewSession}
        >
          <CalendarPlus size={13} strokeWidth={1.5} />
          Ny økt
        </button>
        <button
          type="button"
          className="wb-btn-ghost"
          title="Ny treningsplan"
          onClick={onNewPlan}
        >
          <PlusCircle size={13} strokeWidth={1.5} />
          Ny plan
        </button>
        <button type="button" className="wb-btn-ghost" disabled title="Kommer">
          <Icon n="share-2" />
          Del plan
        </button>
      </div>
    </div>
  );
}

function CoachBell() {
  // Varsel-panel kommer senere — disabled så ikonet ikke er en død knapp.
  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        className="wb-bell"
        aria-label="Varsler (kommer)"
        disabled
        title="Varsler kommer"
      >
        <Icon n="bell" w={14} h={14} />
        <span className="badge">3</span>
      </button>
    </div>
  );
}
