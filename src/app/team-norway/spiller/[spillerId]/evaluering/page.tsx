import { notFound } from "next/navigation";
import Link from "next/link";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnWorkbenchKontekst } from "@/lib/domain/tn-workbench";
import { harTnTekniskPlanLesetilgang, krevFullForEgenTekniskPlan } from "@/lib/domain/tn-teknisk-plan";
import { hentTnEvalueringGrunnlag } from "@/lib/domain/tn-evaluering";
import { TN } from "@/lib/v2/team-norway";
import { TnShell, TnSidehode, TnSeksjon, TnSpillerFaner } from "@/components/team-norway/tn-shell";
import { TnKort, TnPille } from "@/components/team-norway/core";

export const dynamic = "force-dynamic";

const PLAN_STATUS_LABEL: Record<string, string> = { DRAFT: "Utkast", ACTIVE: "Aktiv", ARCHIVED: "Arkivert" };

export default async function TeamNorwaySpillerEvalueringPage({ params }: { params: Promise<{ spillerId: string }> }) {
  const { spillerId } = await params;
  const bruker = await requirePortalUser({ kreverTilgang: "INGEN" });
  const kontekst = await hentTnWorkbenchKontekst(bruker);
  if (!kontekst) notFound();
  if (bruker.role === "PLAYER" && bruker.id !== spillerId) notFound();

  const spillerNavn = kontekst.spillere.find((s) => s.id === spillerId)?.navn ?? (bruker.id === spillerId ? bruker.name : null);
  if (!spillerNavn) notFound();
  krevFullForEgenTekniskPlan(bruker, spillerId);

  const harTilgang = await harTnTekniskPlanLesetilgang(bruker, kontekst, spillerId);
  const grunnlag = harTilgang ? await hentTnEvalueringGrunnlag(spillerId) : null;

  return (
    <TnShell
      aktiv="spillere"
      brukerNavn={bruker.name ?? "Ukjent"}
      rolle={kontekst.erSpiller ? "Spiller" : "Trener"}
      groupId={kontekst.gruppeId}
      visTrenerflater={kontekst.erTrener}
      kanAdministrere={kontekst.kanAdministrere}
    >
      <TnSpillerFaner spillerId={spillerId} spillerNavn={spillerNavn} aktiv="evaluering" kanAdministrere={!kontekst.erSpiller} />
      <TnSidehode
        overlinje="TN-24 · Evaluering"
        tittel={spillerNavn}
        ingress="Grunnlaget for en evaluering: nyeste tester og status på den tekniske planen."
      />

      {!harTilgang ? (
        <TnKort><p style={{ margin: 0, color: TN.textSecondary }}>Du er trener i Team Norway, men ikke {spillerNavn}s personlige coach — TN-rollen alene gir ikke tilgang her.</p></TnKort>
      ) : (
        <>
          <TnSeksjon tittel="Nyeste tester">
            {grunnlag && grunnlag.tester.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {grunnlag.tester.map((t) => (
                  <TnKort key={t.id}>
                    <p style={{ margin: 0, fontSize: TN.text.sm }}>
                      <strong>{t.name}</strong> · {t.latestDate} · <span style={{ fontFamily: TN.font.mono }}>{t.latest}</span>
                    </p>
                  </TnKort>
                ))}
              </div>
            ) : (
              <TnKort><p style={{ margin: 0, color: TN.textSecondary }}>Ingen registrerte testresultater ennå.</p></TnKort>
            )}
          </TnSeksjon>

          <TnSeksjon tittel="Teknisk plan-status">
            {grunnlag?.aktivPlan ? (
              <TnKort>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: TN.weight.semibold }}>{grunnlag.aktivPlan.navn}</p>
                    <p style={{ margin: "4px 0 0", color: TN.textSecondary, fontSize: TN.text.sm }}>{grunnlag.aktivPlan.antallFullfort} av {grunnlag.aktivPlan.antallOppgaver} oppgaver fullført</p>
                  </div>
                  <TnPille tone={grunnlag.aktivPlan.status === "ACTIVE" ? "green" : "nøytral"}>{PLAN_STATUS_LABEL[grunnlag.aktivPlan.status] ?? grunnlag.aktivPlan.status}</TnPille>
                </div>
              </TnKort>
            ) : (
              <TnKort><p style={{ margin: 0, color: TN.textSecondary }}>Ingen teknisk plan opprettet ennå.</p></TnKort>
            )}
          </TnSeksjon>

          <TnSeksjon tittel="Neste tiltak" forklaring="Se grunnlaget over og velg neste oppgave i den tekniske planen.">
            {grunnlag?.nesteTiltak ? (
              <Link href={`/team-norway/spiller/${spillerId}/teknisk-plan/${grunnlag.nesteTiltak.planId}`} style={{ textDecoration: "none" }}>
                <TnKort>
                  <p style={{ margin: 0, fontWeight: TN.weight.semibold }}>{grunnlag.nesteTiltak.tittel}</p>
                  <p style={{ margin: "4px 0 0", color: TN.textSecondary, fontSize: TN.text.sm }}>{grunnlag.nesteTiltak.posisjon} → Åpne i teknisk plan</p>
                </TnKort>
              </Link>
            ) : (
              <TnKort><p style={{ margin: 0, color: TN.textSecondary }}>Ingen åpne oppgaver funnet i en aktiv plan.</p></TnKort>
            )}
          </TnSeksjon>
        </>
      )}
    </TnShell>
  );
}
