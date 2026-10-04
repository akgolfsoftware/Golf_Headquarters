import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TnDataTable } from "@/components/team-norway/tn-data-table";
import { TnShell, TnSidehode, TnSeksjon, TnTomtilstand } from "@/components/team-norway/tn-shell";
import { hentTnGruppeanalyseValg } from "@/lib/domain/tn-arbeidsflate";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { formaterLagretTestResultat } from "@/lib/portal-tester/resultat-visning";
import { hentWangTestresultatSkolerForTeamNorway } from "@/lib/portal-tester/wang-resultat-tilgang";
import { prisma } from "@/lib/prisma";
import { TN } from "@/lib/v2/team-norway";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "WANG-testresultater — Team Norway",
  robots: { index: false, follow: false },
};

const PER_SIDE = 50;
const dato = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Oslo",
});

export default async function WangTestresultaterForTnPage({
  searchParams,
}: {
  searchParams: Promise<{ side?: string }>;
}) {
  const bruker = await requirePortalUser({ kreverTilgang: "INGEN" });
  const valg = await hentTnGruppeanalyseValg(bruker);
  if (!valg || valg.kontekst.erSpiller) notFound();
  const skoler = await hentWangTestresultatSkolerForTeamNorway(bruker);
  if (skoler.length === 0) notFound();

  const { side: sideParam } = await searchParams;
  const ønsketSide = Math.max(1, Number.parseInt(sideParam ?? "1", 10) || 1);
  const spillerIder = [...new Set(skoler.flatMap((skole) => skole.playerIds))];
  const where = { userId: { in: spillerIder } };
  const antall = await prisma.testResult.count({ where });
  const sisteSide = Math.max(1, Math.ceil(antall / PER_SIDE));
  const side = Math.min(ønsketSide, sisteSide);
  const resultater = await prisma.testResult.findMany({
    where,
    orderBy: [{ takenAt: "desc" }, { id: "desc" }],
    skip: (side - 1) * PER_SIDE,
    take: PER_SIDE,
    select: {
      id: true,
      userId: true,
      testId: true,
      takenAt: true,
      score: true,
      details: true,
      user: { select: { name: true } },
      test: { select: { name: true, protocol: true } },
    },
  });

  const skolerForSpiller = new Map<string, string[]>();
  for (const skole of skoler) {
    for (const spillerId of skole.playerIds) {
      const navn = skolerForSpiller.get(spillerId) ?? [];
      navn.push(skole.schoolName);
      skolerForSpiller.set(spillerId, navn);
    }
  }

  return (
    <TnShell
      aktiv="analyse"
      brukerNavn={bruker.name ?? "Ukjent"}
      rolle={valg.kontekst.rolle === "COACH" ? "Trener" : valg.kontekst.rolle === "ASSISTANT" ? "Hjelpetrener" : "Administrator"}
      groupId={valg.kontekst.gruppe.id}
      visTrenerflater
      kanAdministrere={valg.kontekst.kanAdministrere}
    >
      <TnSidehode
        overlinje="Delte WANG-resultater"
        tittel="Testhistorikk på tvers av skoler"
        ingress="Alle fullførte testresultater for spillere i aktive WANG-grupper. Tilgangen gjelder testresultater, ikke øvrige spilleropplysninger."
      />

      <TnSeksjon tittel="WANG-skoler" forklaring="Resultatene følger spillernes aktive skolegruppetilknytning.">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {skoler.map((skole) => (
            <span
              key={skole.groupId}
              style={{ padding: "8px 12px", border: `1px solid ${TN.borderSubtle}`, borderRadius: 999, background: TN.white, color: TN.navy800, fontSize: 13, fontWeight: TN.weight.semibold }}
            >
              {skole.schoolName} · {skole.players.length} spillere
            </span>
          ))}
        </div>
      </TnSeksjon>

      <TnSeksjon tittel={`Resultathistorikk · ${antall}`}>
        {resultater.length ? (
          <TnDataTable
            caption="Fullførte WANG-testresultater"
            kolonner={[
              { key: "skole", label: "Skole" },
              { key: "spiller", label: "Spiller" },
              { key: "test", label: "Test" },
              { key: "resultat", label: "Resultat", align: "right" },
              { key: "dato", label: "Dato" },
            ]}
            rader={resultater.map((rad) => ({
              skole: (skolerForSpiller.get(rad.userId) ?? []).join(", "),
              spiller: <Link href={`/team-norway/spiller/${rad.userId}/oversikt`} style={{ color: TN.navy700, fontWeight: TN.weight.semibold }}>{rad.user.name ?? "Ukjent spiller"}</Link>,
              test: rad.test.name,
              resultat: formaterLagretTestResultat({ testId: rad.testId, score: rad.score, details: rad.details, protocol: rad.test.protocol }),
              dato: dato.format(rad.takenAt),
            }))}
            empty="Ingen fullførte WANG-resultater ennå."
          />
        ) : (
          <TnTomtilstand tittel="Ingen registrerte testresultater ennå" tekst="Fullførte tester fra aktive WANG-spillere vises her." />
        )}
        {sisteSide > 1 && (
          <nav aria-label="Resultatsider" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, color: TN.textSecondary, fontSize: TN.text.sm }}>
            {side > 1 ? <Link href={`/team-norway/wang-resultater?side=${side - 1}`} style={{ color: TN.navy700, fontWeight: TN.weight.semibold }}>Forrige</Link> : <span />}
            <span>Side {side} av {sisteSide}</span>
            {side < sisteSide ? <Link href={`/team-norway/wang-resultater?side=${side + 1}`} style={{ color: TN.navy700, fontWeight: TN.weight.semibold }}>Neste</Link> : <span />}
          </nav>
        )}
      </TnSeksjon>
    </TnShell>
  );
}
