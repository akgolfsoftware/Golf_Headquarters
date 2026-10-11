import type { Metadata } from "next";
import Link from "next/link";

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
  // Gamle lenker uten tilgang viser «Ingen tilgang», aldri data.
  if (!valg || valg.kontekst.erSpiller) return <IngenTilgang />;
  // D-55: bare elever med gyldig testsamtykke mot WANG-gruppa (D-69: trukket = borte).
  const skoler = await hentWangTestresultatSkolerForTeamNorway(bruker);
  if (skoler.length === 0) return <IngenTilgang />;

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
        ingress="Fullførte testresultater fra WANG-elever som har samtykket til å dele testene med WANG-skolen og Team Norway. Under 16 år har også forelder godkjent. Tilgangen gjelder bare testresultater."
      />

      <TnSeksjon tittel="WANG-skoler" forklaring="Tallet er elever som deler testene sine nå. Trekker en elev delingen, forsvinner resultatene med en gang.">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {skoler.map((skole) => (
            <span
              key={skole.groupId}
              style={{ padding: "8px 12px", border: `1px solid ${TN.borderSubtle}`, borderRadius: TN.radius.full, background: TN.white, color: TN.navy800, fontSize: 13, fontWeight: TN.weight.semibold }}
            >
              {skole.schoolName} · {skole.players.length} deler
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
              // Bare testene er delt: ingen lenke til profilen.
              spiller: rad.user.name ?? "Ukjent spiller",
              test: rad.test.name,
              resultat: formaterLagretTestResultat({ testId: rad.testId, score: rad.score, details: rad.details, protocol: rad.test.protocol }),
              dato: dato.format(rad.takenAt),
            }))}
            empty="Ingen delte WANG-resultater ennå."
          />
        ) : (
          <TnTomtilstand tittel="Ingen delte testresultater ennå" tekst="Testene vises her når en WANG-elev har samtykket til å dele dem." />
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

function IngenTilgang() {
  return (
    <main style={{ maxWidth: 560, margin: "64px auto", padding: "0 16px", color: TN.navy800 }}>
      <h1 style={{ fontSize: 24, fontWeight: TN.weight.semibold, margin: 0 }}>Ingen tilgang</h1>
      <p style={{ marginTop: 12, color: TN.textSecondary }}>Du har ikke tilgang til disse testresultatene.</p>
    </main>
  );
}
