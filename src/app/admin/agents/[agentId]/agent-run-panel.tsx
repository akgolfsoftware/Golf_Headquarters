"use client";

import { useState, useTransition, type ReactNode } from "react";
import { kjorPlanRevisjon, kjorPeaking } from "./run-actions";
import type { PlanRevisionForslag } from "@/lib/ai/agents/plan-revision";
import type { PeakingPlanResult } from "@/lib/ai/agents/performance-peaking";

type Valg = { id: string; label: string };

const TRIGGERE: Valg[] = [
  { id: "siste-runde", label: "Siste runde" },
  { id: "skade-flagg", label: "Skade / flagg" },
  { id: "turnering-prep", label: "Turneringsprep" },
];

const selectCls =
  "rounded-md border border-border bg-card px-3 py-2 text-sm";
const btnCls =
  "rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60";

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
    <section className="rounded-lg border border-accent/30 bg-accent/5 p-6">
      <h3 className="mb-1 font-display text-base font-semibold tracking-tight">
        Kjør på en spiller
      </h3>
      <p className="mb-4 text-sm text-muted-foreground">
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
        <p className="text-sm text-muted-foreground">
          Ingen treningsplaner å kjøre på ennå.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
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

      {feil && <p className="mt-3 text-sm text-destructive">{feil}</p>}

      {forslag && (
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <p className="mb-2 font-display text-sm font-semibold">
            {forslag.spillerNavn}
          </p>
          <ul className="space-y-2">
            {forslag.endringer.map((e, i) => (
              <li key={i} className="text-sm">
                <span className="font-medium text-foreground">{e.endring}</span>
                <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  {e.pyramideAkser.join(" · ")} · {e.varighet}
                </span>
                <p className="text-sm text-muted-foreground">{e.rasjonale}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">
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
        <p className="text-sm text-muted-foreground">
          Trenger minst én spiller og én kommende turnering.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
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

      {feil && <p className="mt-3 text-sm text-destructive">{feil}</p>}

      {plan && (
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <p className="mb-2 font-display text-sm font-semibold">
            {plan.spillerNavn} → {plan.tournamentNavn}
            <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              {plan.ukerTilTurnering} uker
            </span>
          </p>
          <ul className="space-y-1.5">
            {plan.fasePerUke.map((u) => (
              <li key={u.uke} className="text-sm">
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  Uke {u.uke} · {u.bompaFase} · vol {u.volum} · int{" "}
                  {u.intensitet}
                </span>
                <p className="text-sm text-muted-foreground">{u.rasjonale}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">
            {plan.generellRad}
          </p>
        </div>
      )}
    </PanelShell>
  );
}
