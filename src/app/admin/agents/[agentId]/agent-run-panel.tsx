"use client";

/**
 * Manuell kjøring av plan-revisjon og peaking. Vises inni AG19AgentDetalj
 * (.agn-s) og bruker klassene i nytt design (19.10.2026). Logikken er uendret.
 */

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

const btnCls = "knapp pri";
const RAD = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, alignItems: "end" } as const;

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
    <div className="kort" style={{ display: "grid", gap: 12 }}>
      <b className="undertittel">Kjør på en spiller</b>
      <p className="forklar">Velg under og kjør. Forslaget vises her og logges i kjøringene.</p>
      {children}
    </div>
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
        <p className="forklar">
          Ingen treningsplaner å kjøre på ennå.
        </p>
      ) : (
        <div style={RAD}>
          <label className="felt"><span className="etikett">Plan</span><select
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            disabled={pending}
          >
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select></label>
          <label className="felt"><span className="etikett">Utløser</span><select
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            disabled={pending}
          >
            {TRIGGERE.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select></label>
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

      {feil && <p className="feiltekst" role="alert">{feil}</p>}

      {forslag && (
        <div className="kort dempet" style={{ display: "grid", gap: 8 }}>
          <b className="undertittel">
            {forslag.spillerNavn}
          </b>
          <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8 }}>
            {forslag.endringer.map((e, i) => (
              <li key={i}>
                <b>{e.endring}</b>
                <span className="kilde mono"> 
                  {e.pyramideAkser.join(" · ")} · {e.varighet}
                </span>
                <p className="forklar">{e.rasjonale}</p>
              </li>
            ))}
          </ul>
          <p className="forklar" style={{ borderTop: "1px solid var(--sand-300)", paddingTop: 8 }}>
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
        <p className="forklar">
          Trenger minst én spiller og én kommende turnering.
        </p>
      ) : (
        <div style={RAD}>
          <label className="felt"><span className="etikett">Spiller</span><select
            value={spillerId}
            onChange={(e) => setSpillerId(e.target.value)}
            disabled={pending}
          >
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select></label>
          <label className="felt"><span className="etikett">Turnering</span><select
            value={tournamentId}
            onChange={(e) => setTournamentId(e.target.value)}
            disabled={pending}
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select></label>
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

      {feil && <p className="feiltekst" role="alert">{feil}</p>}

      {plan && (
        <div className="kort dempet" style={{ display: "grid", gap: 8 }}>
          <b className="undertittel">
            {plan.spillerNavn} → {plan.tournamentNavn}
            <span className="kilde mono"> 
              {plan.ukerTilTurnering} uker
            </span>
          </b>
          <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
            {plan.fasePerUke.map((u) => (
              <li key={u.uke}>
                <span className="kilde mono">
                  Uke {u.uke} · {u.bompaFase} · vol {u.volum} · int{" "}
                  {u.intensitet}
                </span>
                <p className="forklar">{u.rasjonale}</p>
              </li>
            ))}
          </ul>
          <p className="forklar" style={{ borderTop: "1px solid var(--sand-300)", paddingTop: 8 }}>
            {plan.generellRad}
          </p>
        </div>
      )}
    </PanelShell>
  );
}
