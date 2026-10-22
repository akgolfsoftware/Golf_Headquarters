import { hentTnSpillerIup, medTnSpillerData } from "@/lib/domain/tn-arbeidsflate";
import { notFound } from "next/navigation";
import Link from "next/link";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnSpillerTilgang } from "@/lib/domain/tn-arbeidsflate";
import { TnIupLaastSkjerm } from "@/components/team-norway/skjermer/tn-iup-laast-skjerm";
import { hentTnWorkbenchKontekst } from "@/lib/domain/tn-workbench";
import { krevFullForEgenTekniskPlan } from "@/lib/domain/tn-teknisk-plan";
import { hentTnEvalueringGrunnlag } from "@/lib/domain/tn-evaluering";
import { TN } from "@/lib/v2/team-norway";
import { TnIupTopp } from "@/components/team-norway/tn-iup-topp";
import { TnShell, TnSeksjon } from "@/components/team-norway/tn-shell";
import { TnKort, TnPille } from "@/components/team-norway/core";
import { LeverteIupProfil } from "@/components/iup/LeverteIupProfil";

export const dynamic = "force-dynamic";

const PLAN_STATUS_LABEL: Record<string, string> = { DRAFT: "Utkast", ACTIVE: "Aktiv", ARCHIVED: "Arkivert" };

export default async function TeamNorwaySpillerEvalueringPage({ params }: { params: Promise<{ spillerId: string }> }) {
  const { spillerId } = await params;
  const bruker = await requirePortalUser({ tillatDemo: true, kreverTilgang: "INGEN" });
  if (!(await hentTnSpillerTilgang(bruker, spillerId))) return <TnIupLaastSkjerm bruker={bruker} spillerId={spillerId} aktiv="evaluering" />;
  const kontekst = await hentTnWorkbenchKontekst(bruker);
  if (!kontekst) notFound();
  if (bruker.role === "PLAYER" && bruker.id !== spillerId) notFound();

  const spillerNavn = kontekst.spillere.find((s) => s.id === spillerId)?.navn ?? (bruker.id === spillerId ? bruker.name : null);
  if (!spillerNavn) notFound();
  krevFullForEgenTekniskPlan(bruker, spillerId);

  const [grunnlag, iup] = await Promise.all([
    medTnSpillerData(bruker, spillerId, () => hentTnEvalueringGrunnlag(spillerId)),
    hentTnSpillerIup(bruker, spillerId),
  ]);
  if (!grunnlag) notFound();
  const harTilgang = true;

  return (
    <TnShell
      aktiv="spillere"
      brukerNavn={bruker.name ?? "Ukjent"}
      rolle={kontekst.erSpiller ? "Spiller" : "Trener"}
      groupId={kontekst.gruppeId}
      visTrenerflater={kontekst.erTrener}
      kanAdministrere={kontekst.kanAdministrere}
      tilbake={{ href: "/team-norway/spillere", label: "Spillere" }}
    >
      <TnIupTopp spillerId={spillerId} spillerNavn={spillerNavn} aktiv="evaluering" kanAdministrere={!kontekst.erSpiller} overlinje={`IUP · ${spillerNavn}`} tittel="Fireukerssjekk" ingress="Det spilleren har levert fra PlayerHQ, og grunnlaget for neste tiltak: nyeste tester og status på den tekniske planen.">

      <TnKort>
        <LeverteIupProfil rader={iup ?? []} tittel="Levert fra PlayerHQ" />
      </TnKort>

      {!harTilgang ? (
        <TnKort><p style={{ margin: 0, color: TN.ink700 }}>Du er trener i Team Norway, men ikke {spillerNavn}s personlige coach — TN-rollen alene gir ikke tilgang her.</p></TnKort>
      ) : (
        <>
          <TnSeksjon tittel="Nyeste tester">
            {grunnlag && grunnlag.tester.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {grunnlag.tester.map((t) => (
                  <TnKort key={t.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
                      <span><strong style={{ fontSize: 15 }}>{t.name}</strong><br /><span style={{ fontSize: 12.5, color: TN.ink500 }}>{t.latestDate}</span></span>
                      <span style={{ fontFamily: TN.font.mono, fontWeight: 500, fontSize: 18, color: TN.navy900 }}>{t.latest}</span>
                    </div>
                  </TnKort>
                ))}
              </div>
            ) : (
              <TnKort><p style={{ margin: 0, color: TN.ink700 }}>Ingen registrerte testresultater ennå.</p></TnKort>
            )}
          </TnSeksjon>

          <TnSeksjon tittel="Teknisk plan-status">
            {grunnlag?.aktivPlan ? (
              <TnKort>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700 }}>{grunnlag.aktivPlan.navn}</p>
                    <p style={{ margin: "4px 0 0", color: TN.ink700, fontSize: TN.text.sm }}>{grunnlag.aktivPlan.antallFullfort} av {grunnlag.aktivPlan.antallOppgaver} oppgaver fullført</p>
                  </div>
                  <TnPille tone={grunnlag.aktivPlan.status === "ACTIVE" ? "green" : "nøytral"}>{PLAN_STATUS_LABEL[grunnlag.aktivPlan.status] ?? grunnlag.aktivPlan.status}</TnPille>
                </div>
              </TnKort>
            ) : (
              <TnKort><p style={{ margin: 0, color: TN.ink700 }}>Ingen teknisk plan opprettet ennå.</p></TnKort>
            )}
          </TnSeksjon>

          <TnSeksjon tittel="Neste tiltak" forklaring="Spilleren bestemmer planen. Du kan foreslå en endring, og spilleren godtar eller avviser den.">
            {grunnlag?.nesteTiltak ? (
              <Link href={`/team-norway/spiller/${spillerId}/teknisk-plan/${grunnlag.nesteTiltak.planId}`} style={{ textDecoration: "none" }}>
                <TnKort>
                  <p style={{ margin: 0, fontWeight: 700 }}>{grunnlag.nesteTiltak.tittel}</p>
                  <p style={{ margin: "4px 0 0", color: TN.ink700, fontSize: TN.text.sm }}>{grunnlag.nesteTiltak.posisjon} → Åpne i teknisk plan</p>
                </TnKort>
              </Link>
            ) : (
              <TnKort><p style={{ margin: 0, color: TN.ink700 }}>Ingen åpne oppgaver funnet i en aktiv plan.</p></TnKort>
            )}
          </TnSeksjon>
        </>
      )}
    </TnIupTopp>
    </TnShell>
  );
}
