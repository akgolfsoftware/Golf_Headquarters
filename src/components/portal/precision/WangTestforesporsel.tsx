"use client";

/**
 * D-55 (07.10.2026): testsamtykket en WANG-elev gir ved innmelding. Ett ja
 * deler testresultatene med WANG-skolen og Team Norway. Ingenting deles før
 * eleven har sagt ja, og under 16 år må forelder også godkjenne. D-69: trekk
 * virker med en gang og skjuler også eldre resultater.
 *
 * W1 (18.10.2026): `omfang` TRENINGSPLAN gir samme kort for planen. Planen deles
 * bare med WANG-skolen, aldri Team Norway, og bare tid mot plan og oppmøte.
 *
 * `bareNyForesporsel`: I dag viser kortet bare når eleven ikke har svart.
 * Personvern og foreldreportalen viser alltid status og handling.
 */

import { useState, useTransition } from "react";
import { Knapp, StatusPille } from "@/components/precision/pa";
import type { WangDelingsomfang, WangTestdelingStatus } from "@/lib/deling/samtykke-regler";
import { svarWangTestforesporsel } from "@/app/portal/meg/innstillinger/personvern/wang-testdeling-actions";
import { svarWangTestforesporselForBarn } from "@/app/forelder/samtykke/actions";

export type WangTestforesporselProps = {
  gruppeId: string;
  gruppeNavn: string;
  status: WangTestdelingStatus;
  kreverForesatt: boolean;
  modus: { type: "spiller" } | { type: "foresatt"; childId: string; barnNavn: string };
  bareNyForesporsel?: boolean;
  omfang?: WangDelingsomfang;
};

const TEKST: Record<WangDelingsomfang, { tittel: string; knapp: string; ting: string }> = {
  TEST_RESULTATER: {
    tittel: "Del testresultatene med WANG og Team Norway",
    knapp: "Del testresultatene",
    ting: "testene",
  },
  TRENINGSPLAN: {
    tittel: "Del planen med WANG",
    knapp: "Del planen",
    ting: "planen",
  },
};

const STATUS_PILLE: Record<WangTestdelingStatus, { tone: "neutral" | "ok" | "warn"; tekst: string }> = {
  DELT: { tone: "ok", tekst: "Deler nå" },
  VENTER_PA_FORELDER: { tone: "warn", tekst: "Venter på forelder" },
  IKKE_DELT: { tone: "neutral", tekst: "Samtykke mangler" },
  IKKE_SVART: { tone: "neutral", tekst: "Samtykke mangler" },
};

export function WangTestforesporsel({
  gruppeId,
  gruppeNavn,
  status: start,
  kreverForesatt,
  modus,
  bareNyForesporsel = false,
  omfang = "TEST_RESULTATER",
}: WangTestforesporselProps) {
  const tekst = TEKST[omfang];
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
        ? await svarWangTestforesporselForBarn(modus.childId, gruppeId, gitt, omfang)
        : await svarWangTestforesporsel(gruppeId, gitt, omfang);
      if (!res.ok) {
        setFeil(res.feil);
        return;
      }
      setStatus(res.status);
      if (bareNyForesporsel) setSkjult(true);
    });
  }

  const pille = STATUS_PILLE[status];
  const fornavn = foresatt ? modus.barnNavn.split(" ")[0] : "";
  const hvem = foresatt ? `${fornavn}s` : "dine";

  return (
    <section className="pa-card" style={{ padding: 16, gap: 12 }} aria-label={tekst.tittel}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", minWidth: 0 }}>
        <h2 style={{ flex: 1, minWidth: 0, margin: 0 }}>{tekst.tittel}</h2>
        {status !== "IKKE_SVART" && <StatusPille tone={pille.tone}>{pille.tekst}</StatusPille>}
      </div>
      {omfang === "TRENINGSPLAN" ? (
        <p style={{ margin: 0 }}>
          Med ett ja ser trenerne i {gruppeNavn} hvor mye av {foresatt ? `${fornavn}s plan` : "planen din"} som er gjennomført siste
          fire uker: tid mot plan per akse og oppmøte på gruppas økter. De ser ikke notater, meldinger, helsedata eller
          testene, og Team Norway ser ingenting av planen. Delingen kan trekkes når som helst, og da stopper den med en gang.
        </p>
      ) : (
        <p style={{ margin: 0 }}>
          Med ett ja ser {gruppeNavn} og Team Norway testresultatene {hvem}: hvilke tester, når, score og nivå. De ser ikke
          resten av profilen, planen, meldinger eller helsedata. Delingen kan trekkes når som helst, og da skjules også eldre
          resultater med en gang.
        </p>
      )}
      {status === "VENTER_PA_FORELDER" && (
        <p style={{ margin: 0 }}>
          {foresatt
            ? `${fornavn} har sagt ja. ${tekst.ting[0].toUpperCase()}${tekst.ting.slice(1)} deles ikke før du godkjenner.`
            : `Du har sagt ja. En forelder må godkjenne i foreldreportalen før ${tekst.ting} deles.`}
        </p>
      )}
      {!foresatt && kreverForesatt && status !== "VENTER_PA_FORELDER" && status !== "DELT" && (
        <p style={{ margin: 0 }}>Du er under 16 år, så en forelder må også godkjenne.</p>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {kanDele && (
          <Knapp onClick={() => svar(true)} loading={pending}>{tekst.knapp}</Knapp>
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
