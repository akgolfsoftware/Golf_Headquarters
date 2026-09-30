"use client";

import { useState, useTransition, type ReactNode } from "react";
import { kjorPlanRevisjon, kjorPeaking } from "./run-actions";
import { Meta } from "@/components/precision/pa";
import { InlineVarsel } from "@/components/precision/pa-a5";
import type { PlanRevisionForslag } from "@/lib/ai/agents/plan-revision";
import type { PeakingPlanResult } from "@/lib/ai/agents/performance-peaking";

type Valg = { id: string; label: string };

const TRIGGERE: Valg[] = [
  { id: "siste-runde", label: "Siste runde" },
  { id: "skade-flagg", label: "Skade / flagg" },
  { id: "turnering-prep", label: "Turneringsprep" },
];

// Precision Athletics (AG-19): pa-/a4-klasser i stedet for Tailwind-tokens.
const selectCls = "a4-input";
const btnCls = "pa-btn pa-btn--primary";

export function AgentRunPanel(props: {
  agentId: string;
  plans?: Valg[];
  players?: Valg[];
  tournaments?: Valg[];
}) {
  if (props.agentId === "plan-revisjon") {
    return <PlanRevisjonPanel plans={props.plans ?? []} />;
  }
  if (props.agentId === "peaking") {
    return (
      <PeakingPanel
        players={props.players ?? []}
        tournaments={props.tournaments ?? []}
      />
    );
  }
  return null;
}

function PanelShell({ children }: { children: ReactNode }) {
  return (
    <section className="pa-card" style={{ padding: 16, gap: 8, minWidth: 0 }}>
      <h3 style={{ margin: 0, font: "600 15px/1.3 var(--font-sans)" }}>
        Kjør på en spiller
      </h3>
      <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
        Velg under og kjør. Forslaget vises her og logges i kjøringene.
      </p>
      {children}
    </section>
  );
}

function PlanRevisjonPanel({ plans }: { plans: Valg[] }) {
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [trigger, setTrigger] = useState(TRIGGERE[0].id);
  const [pending, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [forslag, setForslag] = useState<PlanRevisionForslag | null>(null);

  function run() {
    setFeil(null);
    setForslag(null);
    start(async () => {
      const res = await kjorPlanRevisjon(planId, trigger);
      if (res.ok) setForslag(res.forslag);
      else setFeil(res.melding);
    });
  }

  return (
    <PanelShell>
      {plans.length === 0 ? (
        <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
          Ingen treningsplaner å kjøre på ennå.
        </p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, minWidth: 0 }}>
          <select
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            disabled={pending}
            className={selectCls}
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <select
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            disabled={pending}
            className={selectCls}
          >
            {TRIGGERE.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={run}
            disabled={pending || !planId}
            className={btnCls}
          >
            {pending ? "Kjører…" : "Kjør"}
          </button>
        </div>
      )}

      {feil && <InlineVarsel tone="warn" tittel="Kjøringen feilet.">{feil}</InlineVarsel>}

      {forslag && (
        <div className="pa-card" style={{ padding: 16, gap: 8, minWidth: 0 }}>
          <p style={{ margin: 0, font: "600 14px/1.3 var(--font-sans)", overflowWrap: "anywhere" }}>
            {forslag.spillerNavn}
          </p>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {forslag.endringer.map((e, i) => (
              <li key={i} style={{ font: "var(--type-body-s)", minWidth: 0, overflowWrap: "anywhere" }}>
                <span style={{ fontWeight: 500 }}>{e.endring}</span>
                {" "}<Meta>{`${e.pyramideAkser.join(" · ")} · ${e.varighet}`.toUpperCase()}</Meta>
                <p style={{ margin: 0, color: "var(--text-secondary)" }}>{e.rasjonale}</p>
              </li>
            ))}
          </ul>
          <p style={{ margin: 0, paddingTop: 8, borderTop: "1px solid var(--border-hairline)", font: "var(--type-body-s)", overflowWrap: "anywhere" }}>
            {forslag.samletAnbefaling}
          </p>
        </div>
      )}
    </PanelShell>
  );
}

function PeakingPanel({
  players,
  tournaments,
}: {
  players: Valg[];
  tournaments: Valg[];
}) {
  const [spillerId, setSpillerId] = useState(players[0]?.id ?? "");
  const [tournamentId, setTournamentId] = useState(tournaments[0]?.id ?? "");
  const [pending, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [plan, setPlan] = useState<PeakingPlanResult | null>(null);

  function run() {
    setFeil(null);
    setPlan(null);
    start(async () => {
      const res = await kjorPeaking(spillerId, tournamentId);
      if (res.ok) setPlan(res.plan);
      else setFeil(res.melding);
    });
  }

  const mangler = players.length === 0 || tournaments.length === 0;

  return (
    <PanelShell>
      {mangler ? (
        <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
          Trenger minst én spiller og én kommende turnering.
        </p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, minWidth: 0 }}>
          <select
            value={spillerId}
            onChange={(e) => setSpillerId(e.target.value)}
            disabled={pending}
            className={selectCls}
          >
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <select
            value={tournamentId}
            onChange={(e) => setTournamentId(e.target.value)}
            disabled={pending}
            className={selectCls}
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={run}
            disabled={pending || !spillerId || !tournamentId}
            className={btnCls}
          >
            {pending ? "Kjører…" : "Kjør"}
          </button>
        </div>
      )}

      {feil && <InlineVarsel tone="warn" tittel="Kjøringen feilet.">{feil}</InlineVarsel>}

      {plan && (
        <div className="pa-card" style={{ padding: 16, gap: 8, minWidth: 0 }}>
          <p style={{ margin: 0, font: "600 14px/1.3 var(--font-sans)", overflowWrap: "anywhere" }}>
            {plan.spillerNavn} → {plan.tournamentNavn}
            {" "}<Meta>{`${plan.ukerTilTurnering} uker`.toUpperCase()}</Meta>
          </p>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {plan.fasePerUke.map((u) => (
              <li key={u.uke} style={{ font: "var(--type-body-s)", minWidth: 0, overflowWrap: "anywhere" }}>
                <Meta>{`Uke ${u.uke} · ${u.bompaFase} · vol ${u.volum} · int ${u.intensitet}`.toUpperCase()}</Meta>
                <p style={{ margin: 0, color: "var(--text-secondary)" }}>{u.rasjonale}</p>
              </li>
            ))}
          </ul>
          <p style={{ margin: 0, paddingTop: 8, borderTop: "1px solid var(--border-hairline)", font: "var(--type-body-s)", overflowWrap: "anywhere" }}>
            {plan.generellRad}
          </p>
        </div>
      )}
    </PanelShell>
  );
}
