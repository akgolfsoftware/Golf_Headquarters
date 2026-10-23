"use client";

/**
 * Fasit: docs/design-system/utkast-playerhq/meg.html, PH-27 Deling.
 * Avvik: eget formål for gruppeanalyse bruker eksisterende samtykkekort og Knapp.
 * Dette kortet endrer bare treningsgrunnlaget i gruppeanalysen, ikke annen trenerdeling.
 */
import { useState, useTransition } from "react";
import { Knapp, StatusPille } from "@/components/precision/pa";
import { AK_ANALYSE_TEKST, AK_ANALYSE_VERSJON } from "@/lib/deling/ak-analyse-regler";
import type { AkAnalyseValg } from "@/lib/deling/ak-gruppeanalyse";
import { svarAkAnalyse, svarAkAnalyseForBarn } from "@/app/portal/meg/innstillinger/personvern/ak-analyse-actions";

export function AkAnalyseDeling({ valg, childId }: { valg: AkAnalyseValg; childId?: string }) {
  const [deler, setDeler] = useState(valg.deler);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const kanGi = valg.kanGi && (childId ? valg.forelderKanEndre : !valg.kreverForesatt);
  const kanTrekke = deler && (!childId || valg.forelderKanEndre);
  function svar(gitt: boolean) {
    if (pending) return;
    setFeil(null);
    start(async () => {
      try {
        const input = { gruppeId: valg.gruppeId, gitt, tekstVersjon: AK_ANALYSE_VERSJON };
        const res = childId ? await svarAkAnalyseForBarn(childId, input) : await svarAkAnalyse(input);
        if (!res.ok) { setFeil(res.feil); return; }
        setDeler(gitt);
      } catch { setFeil("Kunne ikke lagre valget. Prøv igjen."); }
    });
  }
  return <section className="pa-card" style={{ padding: 16, gap: 12 }} aria-label={`${AK_ANALYSE_TEKST.tittel}: ${valg.gruppeNavn}`}>
    <h2 style={{ margin: 0 }}>{AK_ANALYSE_TEKST.tittel}</h2>
    <p style={{ margin: 0 }}>{valg.gruppeNavn}</p>
    <div><StatusPille tone="neutral">{deler ? valg.kanGi ? "Deler treningsgrunnlag" : "Lagret, ikke aktiv" : "Deler ikke"}</StatusPille></div>
    <p style={{ margin: 0 }}>{AK_ANALYSE_TEKST.forklaring}</p>
    <p style={{ margin: 0 }}>{AK_ANALYSE_TEKST.trekk}</p>
    {!valg.kanGi && <p style={{ margin: 0 }}>Medlemskapet er ikke aktivt for denne analysen. Et lagret ja gir ikke tilgang nå.</p>}
    {!childId && valg.kreverForesatt && <p>En godkjent forelder må gi tillatelsen. Du kan selv trekke delingen.</p>}
    {childId && !valg.forelderKanEndre && <p>Foreldre kan ikke endre dette valget nå. Spilleren kan selv trekke delingen.</p>}
    <div>
    {!deler && kanGi && <Knapp onClick={() => svar(true)} loading={pending}>Del treningsgrunnlaget</Knapp>}
    {kanTrekke && <Knapp variant="secondary" onClick={() => svar(false)} loading={pending}>Trekk delingen</Knapp>}
    </div>
    {feil && <p role="alert">{feil}</p>}
  </section>;
}
