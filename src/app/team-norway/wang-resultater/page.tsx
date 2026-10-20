import type { Metadata } from "next";

import { tnRolleNavn } from "@/components/team-norway/tn-shell";
import { TnWangResultaterVisning } from "@/components/team-norway/skjermer/tn-nettverk-visning";
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
  const bruker = await requirePortalUser({ tillatDemo: true, kreverTilgang: "INGEN" });
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
    <TnWangResultaterVisning
      brukerNavn={bruker.name ?? "Ukjent"}
      rolle={valg.kontekst.rolle === "COACH" || valg.kontekst.rolle === "ASSISTANT" ? tnRolleNavn(valg.kontekst.rolle) : "Administrator"}
      groupId={valg.kontekst.gruppe.id}
      kanAdministrere={valg.kontekst.kanAdministrere}
      skoler={skoler.map((skole) => ({ groupId: skole.groupId, schoolName: skole.schoolName, antall: skole.players.length }))}
      antall={antall}
      side={side}
      sisteSide={sisteSide}
      rader={resultater.map((rad) => ({
        id: rad.id,
        skole: (skolerForSpiller.get(rad.userId) ?? []).join(", "),
        // Bare testene er delt: ingen lenke til profilen.
        spiller: rad.user.name ?? "Ukjent spiller",
        test: rad.test.name,
        resultat: formaterLagretTestResultat({ testId: rad.testId, score: rad.score, details: rad.details, protocol: rad.test.protocol }),
        dato: dato.format(rad.takenAt),
      }))}
    />
  );
}

function IngenTilgang() {
  return (
    <main style={{ maxWidth: 560, margin: "64px auto", padding: "0 16px", color: TN.ink900, fontFamily: TN.font.body }}>
      <h1 style={{ fontFamily: TN.font.display, fontWeight: 400, fontSize: 30, letterSpacing: "0.03em", color: TN.navy900, margin: 0 }}>Ingen tilgang</h1>
      <p style={{ marginTop: 12, color: TN.textSecondary }}>Du har ikke tilgang til disse testresultatene.</p>
    </main>
  );
}
