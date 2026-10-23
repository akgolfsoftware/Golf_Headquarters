"use client";

/**
 * Fasit: docs/design-system/utkast-playerhq/meg.html, PH-27 Deling.
 * Avvik:
 *   - Eget formål for coachingprofil bruker eksisterende samtykkekort og Knapp.
 * Dette kortet styrer Caddies profiloppslag, ikke andre delingsvalg.
 */
import { useState, useTransition } from "react";
import { Knapp, StatusPille } from "@/components/precision/pa";
import { AK_PROFIL_TEKST, AK_PROFIL_VERSJON } from "@/lib/deling/ak-profil-regler";
import type { AkProfilValg } from "@/lib/deling/ak-profil-valg";
import { svarAkProfil, svarAkProfilForBarn } from "@/app/portal/meg/innstillinger/personvern/ak-profil-actions";

export function AkProfilDeling({ valg, childId }: { valg: AkProfilValg; childId?: string }) {
  const [deler, setDeler] = useState(valg.deler);
  const [harLagretJa, setHarLagretJa] = useState(valg.harLagretJa ?? valg.deler);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const kanGi = valg.kanGi && (childId ? valg.forelderKanEndre : !valg.kreverForesatt);
  const kanTrekke = (deler || harLagretJa) && (!childId || valg.forelderKanEndre);
  function svar(gitt: boolean) {
    if (pending) return;
    setFeil(null);
    start(async () => {
      try {
        const input = { gruppeId: valg.gruppeId, gitt, tekstVersjon: AK_PROFIL_VERSJON };
        const res = childId ? await svarAkProfilForBarn(childId, input) : await svarAkProfil(input);
        if (!res.ok) { setFeil(res.feil); return; }
        setDeler(gitt);
        setHarLagretJa(gitt);
      } catch { setFeil("Kunne ikke lagre valget. Prøv igjen."); }
    });
  }
  return <section className="pa-card" style={{ padding: 16, gap: 12 }} aria-label={`${AK_PROFIL_TEKST.tittel}: ${valg.gruppeNavn}`}>
    <h2 style={{ margin: 0 }}>{AK_PROFIL_TEKST.tittel}</h2>
    <p style={{ margin: 0 }}>{valg.gruppeNavn}</p>
    <div><StatusPille tone="neutral">{deler && valg.kanGi ? "Deler coachingprofil" : harLagretJa ? "Lagret, ikke aktiv" : "Deler ikke"}</StatusPille></div>
    <p style={{ margin: 0 }}>{AK_PROFIL_TEKST.forklaring}</p>
    <p style={{ margin: 0 }}>{AK_PROFIL_TEKST.trekk}</p>
    {!deler && harLagretJa && <p>Et tidligere ja gir ikke tilgang nå. Du kan erstatte valget eller trekke det.</p>}
    {!valg.kanGi && <p style={{ margin: 0 }}>Medlemskapet er ikke aktivt for denne profildelingen. Et lagret ja gir ikke tilgang nå.</p>}
    {!childId && valg.kreverForesatt && <p>En godkjent forelder må gi tillatelsen. Du kan selv trekke delingen.</p>}
    {childId && !valg.forelderKanEndre && <p>Foreldre kan ikke endre dette valget nå. Spilleren kan selv trekke delingen.</p>}
    <div>
    {!deler && kanGi && <Knapp onClick={() => svar(true)} loading={pending}>Del coachingprofilen</Knapp>}
    {kanTrekke && <Knapp variant="secondary" onClick={() => svar(false)} loading={pending}>Trekk delingen</Knapp>}
    </div>
    {feil && <p role="alert">{feil}</p>}
  </section>;
}
