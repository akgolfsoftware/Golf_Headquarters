import type { Metadata } from "next";
import Link from "next/link";

import { TnDataTable } from "@/components/team-norway/tn-data-table";
import { TnShell, TnSidehode, TnSeksjon, TnTomtilstand } from "@/components/team-norway/tn-shell";
import { hentTnGruppeanalyseValg } from "@/lib/domain/tn-arbeidsflate";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { formaterLagretTestResultat } from "@/lib/portal-tester/resultat-visning";
import { hentWangTestresultatSkolerForTeamNorway } from "@/lib/portal-tester/wang-resultat-tilgang";
import { oppsummerTestlevering, testleveringStatus, type Testlevering } from "@/components/team-norway/tn-testlevering";
import { osloInstant } from "@/lib/jarvis/dagen";
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

// Tildelinger har dato, ikke klokkeslett: forfall er slutten av Oslo-dagen.
function sluttPaOsloDag(d: Date): Date {
  const [aar, maned, dag] = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(d).split("-").map(Number);
  return new Date(osloInstant(aar, maned, dag + 1, 0, 0).getTime() - 1);
}

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

  // Vis kun testdata for elevene den eksisterende samtykkeporten slipper inn.
  // Notater, plan, helse og coachens fritekst hentes ikke.
  const naa = new Date();
  const aar = Number(new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo", year: "numeric" }).format(naa));
  const fra = osloInstant(aar, 1, 1, 0, 0);
  const til = osloInstant(aar + 1, 1, 1, 0, 0);
  const [tildelinger, testdager] = spillerIder.length ? await Promise.all([
    prisma.testAssignment.findMany({
      where: { playerId: { in: spillerIder }, status: { not: "CANCELLED" }, OR: [{ dueDate: { gte: fra, lt: til } }, { dueDate: null, createdAt: { gte: fra, lt: til } }] },
      select: { id: true, playerId: true, testId: true, dueDate: true, status: true, completedResultId: true, test: { select: { name: true } } },
    }),
    prisma.testDayParticipant.findMany({
      where: { OR: skoler.map(skole => ({ playerId: { in: skole.playerIds }, testDay: { groupId: skole.groupId, status: { not: "CANCELLED" as const }, scheduledAt: { gte: fra, lt: til } } })) },
      select: { id: true, playerId: true, status: true, resultId: true, result: { select: { id: true, userId: true, testId: true } }, testDay: { select: { testDefinitionId: true, scheduledAt: true, status: true, testDefinition: { select: { name: true } } } } },
    }),
  ]) : [[], []] as const;
  const resultatIder = tildelinger.flatMap(t => t.completedResultId ? [t.completedResultId] : []);
  const koblede = resultatIder.length ? await prisma.testResult.findMany({ where: { id: { in: resultatIder }, userId: { in: spillerIder } }, select: { id: true, userId: true, testId: true } }) : [];
  const leveringer: Testlevering[] = [
    ...tildelinger.map(t => ({ id: t.id, playerId: t.playerId, testId: t.testId, testName: t.test.name, scheduledAt: t.dueDate, source: "Tildeling" as const,
      status: testleveringStatus({ fullfort: t.status === "COMPLETED", harResultat: koblede.some(r => r.id === t.completedResultId && r.userId === t.playerId && r.testId === t.testId), frist: t.dueDate ? sluttPaOsloDag(t.dueDate) : null, naa }) })),
    ...testdager.map(t => ({ id: t.id, playerId: t.playerId, testId: t.testDay.testDefinitionId, testName: t.testDay.testDefinition.name, scheduledAt: t.testDay.scheduledAt, source: "Testdag" as const,
      status: testleveringStatus({ fullfort: t.status === "DONE", harResultat: !!t.result && t.result.userId === t.playerId && t.result.testId === t.testDay.testDefinitionId, frist: t.testDay.status === "ACTIVE" ? null : sluttPaOsloDag(t.testDay.scheduledAt), avsluttet: t.testDay.status === "COMPLETED", fravaerende: t.status === "ABSENT" || t.status === "SKIPPED", naa }) })),
  ];
  const sammendrag = oppsummerTestlevering(leveringer);

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
      aktiv="wang-resultater"
      brukerNavn={bruker.name ?? "Ukjent"}
      rolle={valg.kontekst.rolle === "COACH" ? "Trener" : valg.kontekst.rolle === "ASSISTANT" ? "Hjelpetrener" : "Administrator"}
      groupId={valg.kontekst.gruppe.id}
      visTrenerflater
      kanAdministrere={valg.kontekst.kanAdministrere}
    >
      <TnSidehode
        overlinje="Delte WANG-resultater"
        tittel="Nasjonal testoversikt"
        ingress="Fullførte testresultater fra WANG-elever som har samtykket til å dele testene med WANG-skolen og Team Norway. Under 16 år har også forelder godkjent. Tilgangen gjelder bare testresultater."
      />

      <TnSeksjon tittel={`Testlevering ${aar}`} forklaring="Faktiske tildelinger og testdagplasser for elever som deler testene. Mangler betyr passert frist eller avsluttet testdag uten koblet resultat. Resultater uten tildeling inngår bare i historikken.">
        <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 16, margin: 0 }}>
          {[ ["Tildelt", sammendrag.tildelt], ["Fullført", sammendrag.fullfort], ["Planlagt", sammendrag.planlagt], ["Mangler", sammendrag.mangler], ["Leveringsgrad", sammendrag.leveringsgrad === null ? "—" : `${Math.round(sammendrag.leveringsgrad * 100)} %`] ].map(([navn, verdi]) => <div key={String(navn)}><dt style={{ color: TN.textSecondary }}>{navn}</dt><dd style={{ margin: "8px 0 0", fontFamily: TN.font.mono, fontSize: TN.text.h1 }}>{verdi}</dd></div>)}
        </dl>
      </TnSeksjon>
      <TnSeksjon tittel="Skoler og leveringsgrad" forklaring="Tallene gjelder gyldig testdeling nå. Trekking skjuler også tidligere resultater og tildelinger.">
        <TnDataTable caption={`Testlevering per skole i ${aar}`} kolonner={[{ key: "skole", label: "Skole" }, { key: "elever", label: "Deler", align: "right" }, { key: "tildelt", label: "Tildelt", align: "right" }, { key: "fullfort", label: "Fullført", align: "right" }, { key: "planlagt", label: "Planlagt", align: "right" }, { key: "mangler", label: "Mangler", align: "right" }]} rader={skoler.map(skole => { const tall = oppsummerTestlevering(leveringer.filter(l => skole.playerIds.includes(l.playerId))); return { skole: skole.schoolName, elever: skole.playerIds.length, tildelt: tall.tildelt, fullfort: tall.fullfort, planlagt: tall.planlagt, mangler: tall.mangler }; })} empty="Ingen skoler tilgjengelig." />
      </TnSeksjon>
      <TnSeksjon tittel="Fra skole til spiller og test">
        {skoler.map(skole => <details key={skole.groupId} style={{ background: TN.surfaceCard, padding: 16 }}><summary style={{ minHeight: 44, cursor: "pointer", fontFamily: TN.font.display }}>{skole.schoolName} · {skole.playerIds.length} deler</summary>
          <TnDataTable caption={`Testlevering · ${skole.schoolName}`} kolonner={[{ key: "spiller", label: "Spiller" }, { key: "test", label: "Test / protokoll" }, { key: "status", label: "Status" }, { key: "dato", label: "Frist / testdag" }, { key: "kilde", label: "Grunnlag" }]} rader={leveringer.filter(l => skole.playerIds.includes(l.playerId)).map(l => ({ spiller: skole.players.find(p => p.id === l.playerId)?.name ?? "Ukjent spiller", test: l.testName, status: l.status, dato: l.scheduledAt ? dato.format(l.scheduledAt) : "Ingen frist", kilde: l.source }))} empty="Ingen tildelinger eller testdagplasser i dette året. Leveringsgrad er ukjent." />
        </details>)}
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
