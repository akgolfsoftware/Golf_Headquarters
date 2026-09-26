import { notFound } from "next/navigation";
import Link from "next/link";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnWorkbenchKontekst } from "@/lib/domain/tn-workbench";
import { harTnTekniskPlanLesetilgang, hentTnTekniskPlaner, krevFullForEgenTekniskPlan } from "@/lib/domain/tn-teknisk-plan";
import { TN } from "@/lib/v2/team-norway";
import { TnShell, TnSidehode, TnSeksjon, TnSpillerFaner } from "@/components/team-norway/tn-shell";
import { TnKort, TnPille } from "@/components/team-norway/core";

export const dynamic = "force-dynamic";

const PLAN_STATUS_LABEL: Record<string, string> = { DRAFT: "Utkast", ACTIVE: "Aktiv", ARCHIVED: "Arkivert" };

/**
 * TN-23 Teknisk plan — planoversikt for én TN-spiller.
 * Tilgang: spilleren selv, eller en trener med PERSONLIG coach-tilgang til
 * akkurat denne spilleren OG som faktisk er et aktivt TN-medlem (samme
 * rolle-/roster-port som Workbench) — TN-medlemskap alene gir IKKE dette.
 */
export default async function TeamNorwaySpillerTekniskPlanPage({ params }: { params: Promise<{ spillerId: string }> }) {
  const { spillerId } = await params;
  const bruker = await requirePortalUser({ kreverTilgang: "INGEN" });
  const kontekst = await hentTnWorkbenchKontekst(bruker);
  if (!kontekst) notFound();
  if (bruker.role === "PLAYER" && bruker.id !== spillerId) notFound();

  const spillerNavn = kontekst.spillere.find((s) => s.id === spillerId)?.navn ?? (bruker.id === spillerId ? bruker.name : null);
  if (!spillerNavn) notFound();
  krevFullForEgenTekniskPlan(bruker, spillerId);

  const harTilgang = await harTnTekniskPlanLesetilgang(bruker, kontekst, spillerId);
  const planer = harTilgang ? await hentTnTekniskPlaner(spillerId) : [];

  return (
    <TnShell
      aktiv="spillere"
      brukerNavn={bruker.name ?? "Ukjent"}
      rolle={kontekst.erSpiller ? "Spiller" : "Trener"}
      groupId={kontekst.gruppeId}
      visTrenerflater={kontekst.erTrener}
      kanAdministrere={kontekst.kanAdministrere}
    >
      <TnSpillerFaner spillerId={spillerId} spillerNavn={spillerNavn} aktiv="teknisk-plan" kanAdministrere={!kontekst.erSpiller} />
      <TnSidehode
        overlinje="TN-23 · Teknisk plan"
        tittel={spillerNavn}
        ingress="P-posisjoner, arbeidsoppgaver og rep-mål."
      />

      {!harTilgang ? (
        <TnKort>
          <p style={{ margin: 0, color: TN.textSecondary }}>
            Du er trener i Team Norway, men ikke {spillerNavn}s personlige coach — TN-rollen alene gir
            ikke tilgang til den individuelle tekniske planen.
          </p>
        </TnKort>
      ) : planer.length === 0 ? (
        <TnKort><p style={{ margin: 0, color: TN.textSecondary }}>Ingen teknisk plan opprettet for {spillerNavn} ennå.</p></TnKort>
      ) : (
        <TnSeksjon tittel="Planer">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {planer.map((p) => (
              <Link key={p.id} href={`/team-norway/spiller/${spillerId}/teknisk-plan/${p.id}`} style={{ textDecoration: "none" }}>
                <TnKort>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: TN.weight.semibold }}>{p.navn}</p>
                      <p style={{ margin: "4px 0 0", color: TN.textSecondary, fontSize: TN.text.sm, fontFamily: TN.font.mono }}>
                        {p.startDato.toISOString().slice(0, 10)}{p.sluttDato ? ` – ${p.sluttDato.toISOString().slice(0, 10)}` : ""} · {p.antallFullfort} av {p.antallOppgaver} oppgaver fullført
                      </p>
                    </div>
                    <TnPille tone={p.status === "ACTIVE" ? "green" : p.status === "ARCHIVED" ? "nøytral" : "amber"}>{PLAN_STATUS_LABEL[p.status] ?? p.status}</TnPille>
                  </div>
                </TnKort>
              </Link>
            ))}
          </div>
        </TnSeksjon>
      )}
    </TnShell>
  );
}
