"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { settTestdagDeltakerStatus, avsluttTestdag } from "@/app/team-norway/tn-testdag-actions";
import { TnKnapp, TnPille } from "./core";
import { TN } from "@/lib/v2/team-norway";
import type { TnTestdag } from "@/lib/domain/tn-arbeidsflate";

const STATUS_TONE = { PENDING: "amber", DONE: "green", SKIPPED: "nøytral", ABSENT: "info" } as const;
const STATUS_LABEL = { PENDING: "I kø", DONE: "Ført", SKIPPED: "Hoppet over", ABSENT: "Ikke møtt" } as const;

/**
 * TN-03 — kø for én testdag. «Før og neste» skjer på deltakerens egen
 * scorecard-side, ikke her. `kanSkrive` kommer fra serveren (platform-rolle
 * COACH/ADMIN) — en hjelpetrener (ASSISTANT, kun innsyn) ser køen, men ALDRI
 * handlingsknappene, siden de bare ville avvises av serveren.
 */
export function TnTestdagKo({ dag, kanSkrive }: { dag: TnTestdag; kanSkrive: boolean }) {
  const router = useRouter();
  const [venter, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const alleFerdig = dag.deltakere.every((d) => d.status !== "PENDING");
  const dagAktiv = dag.status === "ACTIVE";
  const visSkriveknapper = kanSkrive && dagAktiv;

  function settStatus(testDayParticipantId: string, status: "PENDING" | "SKIPPED" | "ABSENT") {
    setFeil(null);
    start(async () => {
      try {
        const svar = await settTestdagDeltakerStatus({ testDayParticipantId, status });
        if (!svar.ok) {
          setFeil(svar.error);
          return;
        }
        router.refresh();
      } catch {
        setFeil("Kunne ikke endre status (nettverksfeil). Prøv igjen.");
      }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {feil && <p role="alert" style={{ margin: 0, color: TN.red600, fontSize: TN.text.sm }}>{feil}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {dag.deltakere.map((deltaker) => (
          <div
            key={deltaker.id}
            data-testid={`tn-deltaker-rad-${deltaker.id}`}
            data-spiller-id={deltaker.spillerId}
            style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "12px 14px", borderRadius: TN.radius.md, border: `1px solid ${TN.borderSubtle}`, background: TN.white }}
          >
            <span style={{ flex: 1, minWidth: 0, fontFamily: TN.font.body, fontSize: TN.text.sm, fontWeight: TN.weight.semibold, color: TN.navy900 }}>{deltaker.spillerNavn}</span>
            <TnPille tone={STATUS_TONE[deltaker.status]}>{STATUS_LABEL[deltaker.status]}</TnPille>
            {deltaker.scoreTekst && <span style={{ fontFamily: TN.font.mono, fontSize: TN.text.sm, color: TN.navy700 }}>{deltaker.scoreTekst}</span>}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {deltaker.status === "PENDING" && (
                <TnKnapp variant="primaer" size="sm" onClick={() => router.push(`/team-norway/fellestesting/${deltaker.id}`)}>{visSkriveknapper ? "Før test" : "Se test"}</TnKnapp>
              )}
              {deltaker.status === "PENDING" && visSkriveknapper && (
                <>
                  <TnKnapp variant="sekundaer" size="sm" disabled={venter} onClick={() => settStatus(deltaker.id, "SKIPPED")}>Hopp over</TnKnapp>
                  <TnKnapp variant="sekundaer" size="sm" disabled={venter} onClick={() => settStatus(deltaker.id, "ABSENT")}>Ikke møtt</TnKnapp>
                </>
              )}
              {(deltaker.status === "SKIPPED" || deltaker.status === "ABSENT") && visSkriveknapper && (
                <TnKnapp variant="tekst" size="sm" disabled={venter} onClick={() => settStatus(deltaker.id, "PENDING")}>Tilbake til køen</TnKnapp>
              )}
              {deltaker.status === "DONE" && (
                <TnKnapp variant="tekst" size="sm" onClick={() => router.push(`/team-norway/fellestesting/${deltaker.id}`)}>Se resultat</TnKnapp>
              )}
            </div>
          </div>
        ))}
      </div>
      {visSkriveknapper && (
        <TnKnapp
          variant={alleFerdig ? "primaer" : "sekundaer"}
          disabled={!alleFerdig || venter}
          onClick={() =>
            start(async () => {
              setFeil(null);
              try {
                const svar = await avsluttTestdag(dag.id);
                if (!svar.ok) {
                  setFeil(svar.error);
                  return;
                }
                router.refresh();
              } catch {
                setFeil("Kunne ikke avslutte testdagen (nettverksfeil). Prøv igjen.");
              }
            })
          }
        >
          {alleFerdig ? "Avslutt testdag" : "Alle må være ført, hoppet over eller ikke møtt før avslutning"}
        </TnKnapp>
      )}
    </div>
  );
}
