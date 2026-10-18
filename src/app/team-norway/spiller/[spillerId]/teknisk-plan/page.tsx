import { medTnSpillerData } from "@/lib/domain/tn-arbeidsflate";
import { notFound } from "next/navigation";
import Link from "next/link";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentTnWorkbenchKontekst } from "@/lib/domain/tn-workbench";
import { hentTnTekniskPlaner, krevFullForEgenTekniskPlan } from "@/lib/domain/tn-teknisk-plan";
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
  const bruker = await requirePortalUser({ tillatDemo: true, kreverTilgang: "INGEN" });
  const kontekst = await hentTnWorkbenchKontekst(bruker);
  if (!kontekst) notFound();
  if (bruker.role === "PLAYER" && bruker.id !== spillerId) notFound();

  const spillerNavn = kontekst.spillere.find((s) => s.id === spillerId)?.navn ?? (bruker.id === spillerId ? bruker.name : null);
  if (!spillerNavn) notFound();
  krevFullForEgenTekniskPlan(bruker, spillerId);

  const planer = await medTnSpillerData(bruker, spillerId, () => hentTnTekniskPlaner(spillerId));
  if (!planer) notFound();
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
      <TnSidehode
        overlinje={`IUP · ${spillerNavn}`}
        tittel="Teknisk plan"
        ingress="P-posisjoner, arbeidsoppgaver og rep-mål. Kvalitetssjekken vises bare; den sperrer aldri neste læringssteg."
      />
      <TnSpillerFaner spillerId={spillerId} spillerNavn={spillerNavn} aktiv="teknisk-plan" kanAdministrere={!kontekst.erSpiller} kompakt />

      {!harTilgang ? (
        <TnKort>
          <p style={{ margin: 0, color: TN.ink700 }}>
            Du er trener i Team Norway, men ikke {spillerNavn}s personlige coach — TN-rollen alene gir
            ikke tilgang til den individuelle tekniske planen.
          </p>
        </TnKort>
      ) : planer.length === 0 ? (
        <TnKort><p style={{ margin: 0, color: TN.ink700 }}>Ingen teknisk plan opprettet for {spillerNavn} ennå.</p></TnKort>
      ) : (
        <TnSeksjon tittel="Planer">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {planer.map((p) => (
              <Link key={p.id} href={`/team-norway/spiller/${spillerId}/teknisk-plan/${p.id}`} style={{ textDecoration: "none" }}>
                <TnKort>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ minWidth: 0, flex: "1 1 220px" }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: TN.ink900 }}>{p.navn}</p>
                      <div aria-hidden="true" style={{ height: 10, background: TN.ink100, marginTop: 8 }}><span style={{ display: "block", height: "100%", width: `${p.antallOppgaver ? (p.antallFullfort / p.antallOppgaver) * 100 : 0}%`, background: TN.akse.TEK.fyll }} /></div>
                      <p style={{ margin: "6px 0 0", color: TN.ink500, fontSize: 12.5, fontFamily: TN.font.mono }}>
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
