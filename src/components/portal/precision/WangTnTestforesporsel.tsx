"use client";

/**
 * D-13 (05.10.2026): forespørselen «Del testene med Team Norway» for WANG-elever.
 * Omfanget er bare testresultater. Ingenting deles før eleven har sagt ja, og
 * under 16 år må forelder også godkjenne. Trekk virker med en gang.
 *
 * `bareNyForesporsel`: I dag viser kortet bare når eleven ikke har svart.
 * Personvern og foreldreportalen viser alltid status og handling.
 */

import { useState, useTransition } from "react";
import { Knapp, StatusPille } from "@/components/precision/pa";
import type { WangTnTestdelingStatus } from "@/lib/deling/samtykke-regler";
import { svarWangTnTestforesporsel } from "@/app/portal/meg/innstillinger/personvern/wang-tn-testdeling-actions";
import { svarWangTnTestforesporselForBarn } from "@/app/forelder/samtykke/actions";

export type WangTnTestforesporselProps = {
  status: WangTnTestdelingStatus;
  kreverForesatt: boolean;
  modus: { type: "spiller" } | { type: "foresatt"; childId: string; barnNavn: string };
  bareNyForesporsel?: boolean;
};

const STATUS_PILLE: Record<WangTnTestdelingStatus, { tone: "neutral" | "ok" | "warn"; tekst: string }> = {
  DELT: { tone: "ok", tekst: "Deler nå" },
  VENTER_PA_FORELDER: { tone: "warn", tekst: "Venter på forelder" },
  IKKE_DELT: { tone: "neutral", tekst: "Deler ikke" },
  IKKE_SVART: { tone: "neutral", tekst: "Ikke svart" },
};

export function WangTnTestforesporsel({ status: start, kreverForesatt, modus, bareNyForesporsel = false }: WangTnTestforesporselProps) {
  const [status, setStatus] = useState(start);
  const [skjult, setSkjult] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (skjult || (bareNyForesporsel && start !== "IKKE_SVART")) return null;

  const foresatt = modus.type === "foresatt";
  const kanDele = status === "IKKE_SVART" || status === "IKKE_DELT" || (foresatt && status === "VENTER_PA_FORELDER");
  const kanTrekke = status === "DELT" || (!foresatt && status === "VENTER_PA_FORELDER");

  function svar(gitt: boolean) {
    if (pending) return;
    setFeil(null);
    startTransition(async () => {
      const res = foresatt
        ? await svarWangTnTestforesporselForBarn(modus.childId, gitt)
        : await svarWangTnTestforesporsel(gitt);
      if (!res.ok) {
        setFeil(res.feil);
        return;
      }
      setStatus(res.status);
      if (bareNyForesporsel) setSkjult(true);
    });
  }

  const pille = STATUS_PILLE[status];
  const hvem = foresatt ? `${modus.barnNavn.split(" ")[0]}s` : "dine";

  return (
    <section className="pa-card" style={{ padding: 16, gap: 12 }} aria-label="Del testene med Team Norway">
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", minWidth: 0 }}>
        <h2 style={{ flex: 1, minWidth: 0, margin: 0 }}>Del testene med Team Norway</h2>
        {status !== "IKKE_SVART" && <StatusPille tone={pille.tone}>{pille.tekst}</StatusPille>}
      </div>
      <p style={{ margin: 0 }}>
        Team Norway får se testresultatene {hvem}: hvilke tester, når, score og nivå. De ser ikke resten av profilen, planen,
        meldinger eller helsedata. Delingen kan trekkes når som helst, og stopper med en gang.
      </p>
      {status === "VENTER_PA_FORELDER" && (
        <p style={{ margin: 0 }}>
          {foresatt
            ? `${modus.barnNavn.split(" ")[0]} har sagt ja. Team Norway får ikke se testene før du godkjenner.`
            : "Du har sagt ja. En forelder må godkjenne i foreldreportalen før Team Norway får se testene."}
        </p>
      )}
      {!foresatt && kreverForesatt && status !== "VENTER_PA_FORELDER" && status !== "DELT" && (
        <p style={{ margin: 0 }}>Du er under 16 år, så en forelder må også godkjenne.</p>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {kanDele && (
          <Knapp onClick={() => svar(true)} loading={pending}>Del med Team Norway</Knapp>
        )}
        {kanDele && status !== "IKKE_DELT" && (
          <Knapp variant="secondary" onClick={() => svar(false)} disabled={pending}>Ikke nå</Knapp>
        )}
        {kanTrekke && (
          <Knapp variant="signal" onClick={() => svar(false)} loading={pending}>Trekk delingen</Knapp>
        )}
      </div>
      {feil && <p role="alert" style={{ margin: 0 }}>{feil}</p>}
    </section>
  );
}
