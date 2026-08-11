/**
 * PlayerHQ · Putte-lab (/portal/analysere/putting) — Paper-port W2 (fase2).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-putte-lab.html
 * (rute per manifest-w2-filter-varsler-putting.md).
 *
 * NY analyse-flate (Anders 11.08): bygges I TILLEGG TIL putte-simulatoren på
 * /portal/trening/putte-laboratoriet — simulatoren er urørt.
 *
 * KUN ekte datakilder, ingenting fabrikkeres:
 *  - KPI-er: Round.sgPutt + HoleScore.putts (siste 90 dager).
 *  - Treff % per avstand: Shot-kjeden (PUTT-slag) mot HoleScore.strokes —
 *    samme ærlighetsregel som shots-til-sg.ts (kun komplette hull).
 *  - SG per avstand: Round.sgPutt0_3 … sgPutt40plus (fot-buckets).
 *  - Distansekontroll: TestResult.details (perSlag) fra speed-testene,
 *    validert med zod (ScoringDetailsSchema) — aldri `as unknown as`.
 *  - Fokuslinje: derivePuttingFocus over loadPuttingSignalsForUser.
 * Domeneberegningene bor i src/lib/domain/putte-lab.ts.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { PutteAnalyseV2, type PutteAnalyseOktRad } from "@/components/portal/v2/PutteAnalyseV2";
import {
  beregnDistansekontroll,
  beregnPutteKpi,
  beregnSgPerAvstand,
  beregnTreffPerAvstand,
  type SpeedOkt,
} from "@/lib/domain/putte-lab";
import { ScoringDetailsSchema } from "@/lib/portal-tester/test-scoring";
import { loadPuttingSignalsForUser } from "@/lib/masterbrain/load-putting-signals";
import { derivePuttingFocus } from "@/lib/masterbrain/putting-signals";

export const dynamic = "force-dynamic";

const OSLO_DATO = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
  timeZone: "Europe/Oslo",
});

function fmtTall(n: number): string {
  return n.toLocaleString("nb-NO", { maximumFractionDigits: 2 });
}

export default async function PutteLabPage() {
  const user = await requirePortalUser();
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const nitti = new Date();
  nitti.setDate(nitti.getDate() - 90);

  const [runder, shots, testResultater, planOkter, signals] = await Promise.all([
    prisma.round.findMany({
      where: { userId: user.id, playedAt: { gte: nitti } },
      orderBy: { playedAt: "desc" },
      select: {
        id: true,
        sgPutt: true,
        sgPutt0_3: true,
        sgPutt3_5: true,
        sgPutt5_10: true,
        sgPutt10_15: true,
        sgPutt15_25: true,
        sgPutt25_40: true,
        sgPutt40plus: true,
        holeScores: { select: { roundId: true, holeNumber: true, strokes: true, putts: true } },
      },
    }),
    // ALLE slag (ikke bare putter) trengs for ærlighetsregelen: et hull teller
    // kun når slag-kjeden stemmer med HoleScore.strokes.
    prisma.shot.findMany({
      where: { round: { userId: user.id, playedAt: { gte: nitti } } },
      select: {
        roundId: true,
        holeNumber: true,
        shotNumber: true,
        shotType: true,
        distanceToPin: true,
        isPenalty: true,
      },
    }),
    // Putte-tester (navnefilter — protokollnavnene i testbatteriet inneholder
    // «putt»: TN Putt Gate, Putt 1-3m, Putt Speed 1x5/3x3).
    prisma.testResult.findMany({
      where: { userId: user.id, test: { name: { contains: "putt", mode: "insensitive" } } },
      orderBy: { takenAt: "desc" },
      take: 30,
      select: {
        id: true,
        testId: true,
        takenAt: true,
        score: true,
        details: true,
        test: { select: { name: true } },
      },
    }),
    // Gjennomførte putte-økter fra planen (siste 90 dager).
    prisma.trainingPlanSession.findMany({
      where: {
        plan: { userId: user.id },
        skillArea: "PUTTING",
        status: "COMPLETED",
        scheduledAt: { gte: nitti },
      },
      orderBy: { scheduledAt: "desc" },
      take: 30,
      select: { id: true, title: true, scheduledAt: true, durationMin: true },
    }),
    loadPuttingSignalsForUser(user.id),
  ]);

  // KPI-er + SG per avstand fra rundene.
  const kpi = beregnPutteKpi(
    runder.map((r) => ({ sgPutt: r.sgPutt, putts: r.holeScores.map((h) => h.putts) })),
  );
  const sgPerAvstand = beregnSgPerAvstand(runder);

  // Treff % per avstand fra slag-kjeden (kun komplette hull).
  const treff = beregnTreffPerAvstand(
    shots,
    runder.flatMap((r) => r.holeScores.map((h) => ({ roundId: h.roundId, holeNumber: h.holeNumber, strokes: h.strokes }))),
  );

  // Test-detaljer valideres med zod før bruk — rader uten gyldig v2-details
  // bidrar ikke (aldri `as unknown as`).
  const speedOkter: SpeedOkt[] = [];
  const okter: PutteAnalyseOktRad[] = [];
  for (const t of testResultater) {
    const parsed = ScoringDetailsSchema.safeParse(t.details);
    const detaljer = parsed.success ? parsed.data : null;
    if (detaljer && detaljer.scoring === "distance_average" && t.takenAt >= nitti) {
      speedOkter.push({ perSlag: detaljer.perSlag });
    }
    okter.push({
      id: `test-${t.id}`,
      dato: OSLO_DATO.format(t.takenAt).replace(".", ""),
      navn: t.test.name,
      putter: detaljer ? detaljer.perSlag.length : null,
      resultat: `${fmtTall(t.score)}${detaljer?.unit ? ` ${detaljer.unit}` : ""}`,
      href: `/portal/tren/tester/${t.testId}`,
      // sortnøkkel via takenAt — flettes under
    });
  }
  const distanse = beregnDistansekontroll(speedOkter);

  // Flett plan-økter inn i økt-lista og sorter nyeste først.
  type MedDato = PutteAnalyseOktRad & { _dato: number };
  const alleOkter: MedDato[] = [
    ...okter.map((o, i) => ({ ...o, _dato: testResultater[i].takenAt.getTime() })),
    ...planOkter.map((s) => ({
      id: `okt-${s.id}`,
      dato: OSLO_DATO.format(s.scheduledAt).replace(".", ""),
      navn: s.title,
      putter: null,
      resultat: `${s.durationMin} min`,
      // Bevisst uten lenke: kjent id-mismatch mellom økt-detaljruten og
      // plan-øktene (samme ærlige valg som Historikk-flaten).
      href: null,
      _dato: s.scheduledAt.getTime(),
    })),
  ];
  alleOkter.sort((a, b) => b._dato - a._dato);

  // Fokuslinje fra putte-hjernen — kun når den faktisk har et grunnlag.
  const fokus = derivePuttingFocus(signals);
  const fokusLinje = fokus.primary === "unknown" ? null : fokus.coachLineNb;

  return (
    <V2Shell bredde="kolonne" aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/analysere">Analyse</TilbakeLenke>
      <PutteAnalyseV2
        data={{
          navn: user.name ?? "",
          runder: runder.length,
          kpi,
          treff,
          sgPerAvstand,
          distanse,
          fokusLinje,
          okter: alleOkter.map(({ _dato: _ignorert, ...o }) => o),
        }}
      />
    </V2Shell>
  );
}
