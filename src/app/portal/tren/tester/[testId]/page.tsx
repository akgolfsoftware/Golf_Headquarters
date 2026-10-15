/**
 * PH-14 Én test i nytt design (pakke 6, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/stats-dybde.html, malen «test».
 * Avvik:
 *   - Avvikene mot utkastet står øverst i PH14Test.tsx.
 *   - Team Norway-testene får også en egen testside nå (før sendte adressen rett til scorekortet).
 *     «Ta testen» åpner gjeldende utgave av scorekortet.
 * Samme tilgang (testTilgangWhere), protokoll, historikk, siste forsøk, øvelsesforslag og startlenke som før.
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { prisma } from "@/lib/prisma";
import { testTilgangWhere } from "@/lib/portal-tester/test-tilgang";
import { FEATURES } from "@/lib/features";
import { parseProtocol, type ScorekortForsok } from "@/lib/portal-tester/protocol";
import { parseForScoring, lavereErBedre, ScoringDetailsSchema } from "@/lib/portal-tester/test-scoring";
import { formaterTestVerdi, formaterTestDelta } from "@/lib/portal-tester/format-verdi";
import { gateMaalFraProtokoll } from "@/lib/domain/tester-live";
import { hentGodkjenteOvelsesbankElementer } from "@/lib/masterbrain/drill-bank";
import { foreslaGodkjenteOvelser, ovelsesNavn, sammenlignMedForrige } from "@/lib/portal-tester/test-anbefaling";
import { tnComparableResult, tnFromDefinitionId } from "@/lib/portal-tester/tn-integration";
import { tnFormat } from "@/lib/portal-tester/tn-scoring";
import { tnProtocol } from "@/lib/portal-tester/tn-catalog";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH14Test, type PH14Maaling, type PH14TestData } from "@/components/portal/precision/PH14Test";
import type { SdAkse } from "@/components/portal/precision/PHStatsDybdeFelles";

export const dynamic = "force-dynamic";
export const metadata = { title: "Test · PlayerHQ" };

const OMRAADE: Record<string, { akse: SdAkse; navn: string }> = {
  FYS: { akse: "fys", navn: "Fysisk" }, TEK: { akse: "tek", navn: "Teknikk" }, SLAG: { akse: "slag", navn: "Golfslag" },
  SPILL: { akse: "spill", navn: "Spill" }, TURN: { akse: "turn", navn: "Turnering" },
};
const KORT = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short" });

function grupperSteg(forsok: ScorekortForsok[]) {
  const m = new Map<string, { label: string; antall: number; maal: string | null }>();
  for (const f of forsok) {
    const ex = m.get(f.label);
    if (ex) ex.antall += 1;
    else m.set(f.label, { label: f.label, antall: 1, maal: f.target != null ? String(f.target).replace(".", ",") : null });
  }
  return [...m.values()];
}

export default async function TestDetaljSpillerPage({
  params,
  searchParams,
}: {
  params: Promise<{ testId: string }>;
  searchParams: Promise<{ lagret?: string }>;
}) {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "PARENT") redirect("/forelder");
  const [{ testId }, sp, ulest] = await Promise.all([params, searchParams, getUnreadNotifications(user.id, 1)]);

  const tn = tnFromDefinitionId(testId);
  const test = await prisma.testDefinition.findFirst({ where: { id: testId, AND: [testTilgangWhere(user.id)] } });
  // Team Norway-testene kan mangle definisjonsrad til første resultat er lagret; da går vi rett til scorekortet som før.
  if (!test && tn) redirect(`/portal/tren/tester/team-norway?test=${tn.id}${tn.variableCount ? `&count=${tn.rows.length}` : ""}`);
  if (!test) notFound();

  const resultater = await prisma.testResult.findMany({
    where: { userId: user.id, testId },
    orderBy: { takenAt: "asc" },
    select: { id: true, score: true, takenAt: true, details: true, recordedBy: { select: { name: true } } },
  });

  const spec = parseProtocol(test.protocol);
  const scoringSpec = parseForScoring(test.protocol);
  const shots = scoringSpec.shots.length;
  const tnKanon = tn ? resultater.map((r) => tnComparableResult(testId, r.score, r.details)) : [];
  const vis = (score: number, i: number) => {
    if (!tn) return formaterTestVerdi({ kind: scoringSpec.kind, verdi: score, shotsCount: shots });
    const k = tnKanon[i];
    return k ? tnFormat({ value: score, unit: k.unit }) : "—";
  };

  const maalinger: PH14Maaling[] = resultater.map((r, i) => ({
    id: r.id, dato: KORT.format(r.takenAt), verdi: r.score, vis: vis(r.score, i), fortAv: r.recordedBy?.name ?? null,
  }));

  // Retning: TN fra det kanoniske resultatet, ellers fra scoringtypen.
  const tnRetning = tnKanon.findLast((k) => k != null)?.direction ?? null;
  const lavere = tn ? (tnRetning == null ? null : tnRetning === "lower") : scoringSpec.kind === "fallback" ? null : lavereErBedre(scoringSpec.kind);

  const siste = resultater[resultater.length - 1] ?? null;
  const nestSiste = resultater[resultater.length - 2] ?? null;
  let endring: string | null = null;
  if (siste && nestSiste) {
    const sammenlignbar = tn
      ? !!tnKanon[tnKanon.length - 1] && tnKanon[tnKanon.length - 1]?.comparisonKey === tnKanon[tnKanon.length - 2]?.comparisonKey
      : sammenlignMedForrige({ ...siste, testId }, resultater.map((r) => ({ ...r, testId }))) !== "IKKE_SAMMENLIGNBAR";
    if (sammenlignbar) {
      const diff = siste.score - nestSiste.score;
      endring = diff === 0 ? "±0 mot forrige" : tn
        ? `${diff > 0 ? "+" : "−"}${tnFormat({ value: Math.abs(diff), unit: tnKanon[tnKanon.length - 1]!.unit })} mot forrige`
        : `${formaterTestDelta({ kind: scoringSpec.kind, delta: diff })} mot forrige`;
    }
  }

  // Snitt og beste regnes bare over målinger med samme visning (ikke «—»).
  const tellende = maalinger.filter((x) => x.vis !== "—");
  const fmt = (v: number) => (tn ? tnFormat({ value: v, unit: tnKanon.findLast((k) => k != null)!.unit }) : formaterTestVerdi({ kind: scoringSpec.kind, verdi: v, shotsCount: shots }));
  const snitt = tellende.length ? fmt(tellende.reduce((a, x) => a + x.verdi, 0) / tellende.length) : null;
  const beste = tellende.length && lavere != null ? fmt(lavere ? Math.min(...tellende.map((x) => x.verdi)) : Math.max(...tellende.map((x) => x.verdi))) : null;

  // 8-ball: PEI per slagkategori fra siste måling.
  const sisteKanon = tnKanon[tnKanon.length - 1] ?? null;
  const perSlagtype = sisteKanon
    ? sisteKanon.metrics.filter((x) => /^(Chip|Wedge|Lobb|Bunker) PEI$/.test(x.label)).map((x) => ({ navn: x.label.replace(" PEI", ""), vis: tnFormat(x) }))
    : [];

  const erGate = scoringSpec.kind === "count_ok" || scoringSpec.kind === "hit_rate";
  let sisteForsok: PH14TestData["sisteForsok"] = [];
  if (erGate && siste) {
    const parsed = ScoringDetailsSchema.safeParse(siste.details);
    if (parsed.success) {
      sisteForsok = parsed.data.perSlag.map((s) => ({
        nr: s.nr,
        ok: typeof s.verdier.ok === "boolean" ? s.verdier.ok : typeof s.verdier.sunket === "boolean" ? s.verdier.sunket : null,
        side: s.verdier.miss_side === "V" || s.verdier.miss_side === "H" ? (s.verdier.miss_side as "V" | "H") : null,
      }));
    }
  }
  const gateMal = erGate ? gateMaalFraProtokoll(test.protocol) : null;

  const fasiliteter = siste && test.omraade ? await prisma.playerFacility.findMany({
    where: { userId: user.id },
    select: { capabilities: true, maksPuttLengdeM: true, rangeLengdeM: true },
  }) : [];
  const forslag = siste ? foreslaGodkjenteOvelser({
    test: { id: test.id, omraade: test.omraade },
    bank: hentGodkjenteOvelsesbankElementer(),
    fasiliteter,
    spillerKategori: null,
  }) : [];

  const omraade = OMRAADE[test.pyramidArea] ?? { akse: "slag" as const, navn: test.pyramidArea };
  // Team Norway lagrer regelutgaven som scoringRule; vis hva regelen betyr i stedet for versjonsnavnet.
  const tnRegel = tn ? `${tn.points8Ball ? "Appen regner avstand fra hullet, PEI og poeng for hvert slag" : tn.kind === "gate" ? "Godkjent eller bom per slag" : "Etter Team Norways scorekort"} · utgave ${test.scoringRule}` : null;
  const regel = tnRegel ?? [test.scoringRule, gateMal != null ? `mål ${gateMal} av ${shots}` : null, scoringSpec.unit ? `måles i ${scoringSpec.unit}` : null].filter(Boolean).join(" · ");
  // «Ta testen» åpner alltid gjeldende utgave av Team Norway-scorekortet.
  const current = tn ? tnProtocol(tn.id) ?? tn : null;

  const data: PH14TestData = {
    navn: test.name,
    akse: omraade.akse,
    omraade: omraade.navn,
    maalinger,
    lavereErBedre: lavere,
    endring,
    snitt,
    beste,
    regel,
    beskrivelse: test.description,
    protokoll: tn ? [] : spec ? grupperSteg(spec.forsok) : [],
    perSlagtype,
    sisteForsok,
    sperret: current?.blocked ?? null,
    startHref: tn
      ? `/portal/tren/tester/team-norway?test=${current!.id}${current!.variableCount ? `&count=${current!.rows.length}` : ""}`
      : `/portal/tren/tester/${test.id}/gjennomfor`,
    lagret: sp.lagret === "1",
    talentHref: FEATURES.TALENT ? "/portal/talent" : null,
    forslag: forslag.map(({ ovelse, kanLeggesTil, begrunnelse }) => ({
      id: ovelse.id, navn: ovelsesNavn(ovelse.navn), beskrivelse: ovelse.beskrivelse, begrunnelse, kanLeggesTil,
    })),
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <PH14Test data={data} />
    </PlayerHQSkall>
  );
}
