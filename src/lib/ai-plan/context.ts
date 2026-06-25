// Kontekst-bygger for AI-plan-generering. Henter spillerens profil, siste
// planer, øktlogger, signaler, mål, WAGR-snapshot, NGF-kategori, aktiv L-fase,
// relevante drills (filtrert på spillerens nivå) og forrige PlanEffectiveness.
//
// Returnerer et strukturert objekt som serialiseres inn i AI-prompten.

import { prisma } from "@/lib/prisma";
import type {
  DrillFasilitet,
  LPhase,
  NgfKategori,
  PyramidArea,
  SessionEnvironment,
  SkillArea,
} from "@/generated/prisma/client";
import { hentTreningsVolum, type UkeVolum } from "../training/volum";
import {
  beregnKorrelasjon,
  type KorrelasjonsResultat,
} from "../training/korrelasjon";
import type { AkKategori } from "@/lib/domain/ak-kategori";
import {
  AK_KATEGORI_ORDER,
  akKategoriIdx,
  akTilNgfKategori,
  hentSpillerAkKategori,
} from "@/lib/domain/spiller-kategori";

export type DrillKatalogEntry = {
  id: string;
  navn: string;
  disciplin: PyramidArea;
  skillArea: SkillArea | null;
  csTargetByKategori: Record<string, number> | null;
  varighetMin: number | null;
  defaultSets: number | null;
  defaultReps: number | null;
  coachNotes: string | null;
  morad: boolean;
  environment: SessionEnvironment[];
  lPhases: LPhase[];
  minKategori: NgfKategori | null;
  maxKategori: NgfKategori | null;
};

export type FasilitetsGrenser = {
  maxPuttM: number | null;
  maxChipM: number | null;
  maxWedgeM: number | null;
  trackmanHrsPerWeek: number | null;
  canSwingAtHome: boolean;
  hasBunker: boolean;
  hasNetAndMat: boolean;
  /** Avledede boolean-flagg fra DrillFasilitet[] på brukerprofilen */
  harRange: boolean;
  harSimulator: boolean;
  harBane: boolean;
};

export type TemplateSession = {
  ukeNr: number;
  dagNr: number;
  title: string;
  varighetMin: number;
  pyramidArea: PyramidArea;
  skillArea: SkillArea | null;
  environment: SessionEnvironment;
  drillsJson: unknown;
  focus: string | null;
};

export type PlanTemplateData = {
  templateId: string;
  navn: string;
  varighetUker: number;
  ukentligOktAntall: number;
  disciplinFordeling: Record<string, number>;
  sessions: TemplateSession[];
};

export type ForrigeEffektivitet = {
  planId: string;
  templateId: string | null;
  completionRate: number;
  sgTotalDelta: number | null;
  sgOttDelta: number | null;
  sgAppDelta: number | null;
  sgArgDelta: number | null;
  sgPuttDelta: number | null;
  selfRating: number | null;
  coachRating: number | null;
  notes: string | null;
  computedAt: string;
};

export type SpillerKontekst = {
  spiller: {
    id: string;
    navn: string;
    hcp: number | null;
    rolle: string;
    tier: string;
    spilteAr: number | null;
    ambisjon: string | null;
    hjemmeklubb: string | null;
    /** A–K-kategori (snittscore inneværende sesong). Samme bokstav som ngfKategori. */
    akKategori: AkKategori | null;
    /** @deprecated Bruk akKategori — beholdt for AI-prompt bakoverkompat. */
    ngfKategori: NgfKategori | null;
    /** Fasiliteter og utstyr spilleren har registrert. Brukes for drill-matching. */
    tilgjengeligeFasiliteter: DrillFasilitet[];
  };
  wagr: {
    rank: number;
    ngfKategori: string | null;
    ptsAvg: number;
  } | null;
  /** Aktiv periodiseringsfase fra SeasonPlan + PeriodBlock (eller null). */
  aktivLPhase: LPhase | null;
  aktiveMal: {
    type: string;
    tittel: string;
    targetValue: number | null;
    targetDate: string | null;
  }[];
  sistePlaner: {
    navn: string;
    start: string;
    slutt: string | null;
    status: string;
    antallOkter: number;
  }[];
  sisteOkter: {
    sessionTittel: string;
    drills: { navn: string }[];
    rating: number | null;
    notes: string | null;
    dato: string;
  }[];
  signaler: {
    kind: string;
    value: number | null;
    computedAt: string;
  }[];
  /** Avstandsgrenser og fasilitetstilgang fra FacilityPrefs. */
  fasilitetsGrenser: FasilitetsGrenser;
  /** Drills filtrert på spillerens NGF-kategori. */
  tilgjengeligeDrills: DrillKatalogEntry[];
  /** Forrige PlanEffectiveness — hva som virket / ikke virket. */
  forrigeEffektivitet: ForrigeEffektivitet | null;
  /** Loggført treningsvolum per uke (siste 8 uker), per SG-område. */
  treningsVolum: UkeVolum[];
  /** Korrelasjon mellom treningsvolum og SG neste uke, per SG-område. */
  korrelasjon: KorrelasjonsResultat[];
};

// HCP → gammel NGF A–L-skala. @deprecated — bruk hentSpillerAkKategori (snittscore A–K).
// Beholdt kun for seed/scripts som refererer til legacy-mapping.
export function kategoriFraHcp(hcp: number | null): NgfKategori | null {
  if (hcp === null) return null;
  if (hcp < -2) return "A";
  if (hcp < 0) return "B";
  if (hcp < 1.5) return "C";
  if (hcp < 3) return "D";
  if (hcp < 5) return "E";
  if (hcp < 8) return "F";
  if (hcp < 12) return "G";
  if (hcp < 15) return "H";
  if (hcp < 20) return "I";
  if (hcp < 28) return "J";
  if (hcp < 36) return "K";
  return "L";
}

function parseCsTargetByKategori(
  raw: unknown,
): Record<string, number> | null {
  if (!raw || typeof raw !== "object") return null;
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "number") out[k] = v;
  }
  return Object.keys(out).length > 0 ? out : null;
}

function parseDisciplinFordeling(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "number") out[k] = v;
  }
  return out;
}

// Finn spillerens aktive L-fase basert på dagens dato + SeasonPlan/PeriodBlock.
async function hentAktivLPhase(userId: string): Promise<LPhase | null> {
  const naa = new Date();
  const block = await prisma.periodBlock.findFirst({
    where: {
      seasonPlan: { userId },
      startDate: { lte: naa },
      endDate: { gte: naa },
    },
    orderBy: { startDate: "desc" },
    select: { lPhase: true },
  });
  return block?.lPhase ?? null;
}

// Hent drills som matcher spillerens A–K-kategori (snittscore-basert) og fasilitetsprofil.
//
// Konvensjon på ExerciseDefinition: minKategori = beste spiller (A), maxKategori = svakeste (K).
// Prisma støtter ikke lte/gte på enum — vi materialiserer tillatte bokstaver og bruker `in`.
// Legacy L på drills behandles som K i filteret.
async function hentTilgjengeligeDrills(
  kategori: AkKategori | null,
  fasilitetProfil: DrillFasilitet[] = [],
): Promise<DrillKatalogEntry[]> {
  const whereClause =
    kategori === null
      ? {}
      : (() => {
          const idx = akKategoriIdx(kategori);
          const tillattMin = AK_KATEGORI_ORDER.slice(0, idx + 1).map(akTilNgfKategori);
          const tillattMax: NgfKategori[] = [
            ...AK_KATEGORI_ORDER.slice(idx).map(akTilNgfKategori),
            "L", // legacy-tagger etter retag — L = K
          ];
          return {
            AND: [
              {
                OR: [
                  { minKategori: null },
                  { minKategori: { in: tillattMin } },
                ],
              },
              {
                OR: [
                  { maxKategori: null },
                  { maxKategori: { in: tillattMax } },
                ],
              },
            ],
          };
        })();

  const drills = await prisma.exerciseDefinition.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      pyramidArea: true,
      skillArea: true,
      csTargetByKategori: true,
      durationMin: true,
      defaultSets: true,
      defaultReps: true,
      coachNotes: true,
      morad: true,
      environment: true,
      fasilitetKrav: true,
      lPhases: true,
      minKategori: true,
      maxKategori: true,
    },
    orderBy: [{ pyramidArea: "asc" }, { name: "asc" }],
    take: 400, // henter mer siden vi filtrerer
  });

  // Fasilitetsfilter: kun drills der alle krav er dekt av spillerens profil.
  // Tom profil = ingen fasilitetfiltrering (vis alt).
  const fasilitetSet = new Set<string>(fasilitetProfil);
  const filtrerte =
    fasilitetProfil.length === 0
      ? drills
      : drills.filter((d) => {
          const krav = d.fasilitetKrav as string[];
          if (krav.length === 0) return true; // ingen krav → alltid vis
          return krav.every((k) => fasilitetSet.has(k));
        });

  return filtrerte.slice(0, 200).map((d) => ({
    id: d.id,
    navn: d.name,
    disciplin: d.pyramidArea,
    skillArea: d.skillArea,
    csTargetByKategori: parseCsTargetByKategori(d.csTargetByKategori),
    varighetMin: d.durationMin,
    defaultSets: d.defaultSets,
    defaultReps: d.defaultReps,
    coachNotes: d.coachNotes,
    morad: d.morad,
    environment: d.environment,
    lPhases: d.lPhases,
    minKategori: d.minKategori,
    maxKategori: d.maxKategori,
  }));
}

// Hent forrige PlanEffectiveness for spilleren (eller null).
async function hentForrigeEffektivitet(
  userId: string,
): Promise<ForrigeEffektivitet | null> {
  const eff = await prisma.planEffectiveness.findFirst({
    where: { userId },
    orderBy: { computedAt: "desc" },
    select: {
      planId: true,
      templateId: true,
      completionRate: true,
      sgTotalDelta: true,
      sgOttDelta: true,
      sgAppDelta: true,
      sgArgDelta: true,
      sgPuttDelta: true,
      selfRating: true,
      coachRating: true,
      notes: true,
      computedAt: true,
    },
  });
  if (!eff) return null;
  return {
    planId: eff.planId,
    templateId: eff.templateId,
    completionRate: eff.completionRate,
    sgTotalDelta: eff.sgTotalDelta,
    sgOttDelta: eff.sgOttDelta,
    sgAppDelta: eff.sgAppDelta,
    sgArgDelta: eff.sgArgDelta,
    sgPuttDelta: eff.sgPuttDelta,
    selfRating: eff.selfRating,
    coachRating: eff.coachRating,
    notes: eff.notes,
    computedAt: eff.computedAt.toISOString().slice(0, 10),
  };
}

// Hent default PlanTemplate matchet på (kategori, lPhase). Returnerer null
// hvis ingen approved template finnes for kombinasjonen.
export async function hentTemplate(
  kategori: NgfKategori,
  lPhase: LPhase,
): Promise<PlanTemplateData | null> {
  // Foretrekk approved templates, fall ev. tilbake til uapprovde.
  const template = await prisma.planTemplate.findFirst({
    where: { kategori, lPhase },
    orderBy: [
      { approved: "desc" },
      { effectivenessAvg: "desc" },
      { usageCount: "desc" },
    ],
    select: {
      id: true,
      name: true,
      varighetUker: true,
      ukentligOktAntall: true,
      disciplinFordeling: true,
      sessions: {
        select: {
          ukeNr: true,
          dagNr: true,
          title: true,
          varighetMin: true,
          pyramidArea: true,
          skillArea: true,
          environment: true,
          drillsJson: true,
          focus: true,
        },
        orderBy: [{ ukeNr: "asc" }, { dagNr: "asc" }],
      },
    },
  });
  if (!template) return null;

  return {
    templateId: template.id,
    navn: template.name,
    varighetUker: template.varighetUker,
    ukentligOktAntall: template.ukentligOktAntall,
    disciplinFordeling: parseDisciplinFordeling(template.disciplinFordeling),
    sessions: template.sessions.map((s) => ({
      ukeNr: s.ukeNr,
      dagNr: s.dagNr,
      title: s.title,
      varighetMin: s.varighetMin,
      pyramidArea: s.pyramidArea,
      skillArea: s.skillArea,
      environment: s.environment,
      drillsJson: s.drillsJson,
      focus: s.focus,
    })),
  };
}

export async function byggSpillerKontekst(
  userId: string,
): Promise<SpillerKontekst> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      hcp: true,
      role: true,
      tier: true,
      playingYears: true,
      ambition: true,
      homeClub: true,
      tilgjengeligeFasiliteter: true,
    },
  });
  if (!user) throw new Error(`Bruker ${userId} finnes ikke.`);

  const [wagr, goals, planer, signaler, aktivLPhase] = await Promise.all([
    prisma.wagrSnapshot.findUnique({
      where: { userId },
      select: { rank: true, ngfCategory: true, ptsAvg: true },
    }),
    prisma.goal.findMany({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { type: true, title: true, targetValue: true, targetDate: true },
    }),
    prisma.trainingPlan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        name: true,
        startDate: true,
        endDate: true,
        status: true,
        _count: { select: { sessions: true } },
      },
    }),
    prisma.signal.findMany({
      where: { userId },
      orderBy: { computedAt: "desc" },
      take: 20,
      select: { kind: true, value: true, computedAt: true },
    }),
    hentAktivLPhase(userId),
  ]);

  const akKategori = await hentSpillerAkKategori(userId, {
    wagrNgfCategory: wagr?.ngfCategory ?? null,
    hcp: user.hcp,
  });
  const ngfKategori = akKategori ? akTilNgfKategori(akKategori) : null;

  const [logger, tilgjengeligeDrills, forrigeEffektivitet, treningsVolum, korrelasjon, facilityPrefs] =
    await Promise.all([
      prisma.trainingPlanSessionLog.findMany({
        where: { session: { plan: { userId } } },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          rating: true,
          notes: true,
          createdAt: true,
          session: {
            select: {
              title: true,
              drills: { select: { exercise: { select: { name: true } } } },
            },
          },
        },
      }),
      hentTilgjengeligeDrills(akKategori, user.tilgjengeligeFasiliteter as DrillFasilitet[]),
      hentForrigeEffektivitet(userId),
      hentTreningsVolum(userId, 8),
      beregnKorrelasjon(userId, 16),
      prisma.facilityPrefs.findUnique({
        where: { userId },
        select: {
          trackman: true,
          range: true,
          course18: true,
          course9: true,
          putting: true,
          shortgame: true,
        },
      }),
    ]);

  // For å holde token-budsjettet nede: ikke send hele drills-katalogen hvis
  // den blir veldig stor. Kutt til 80 mest relevante (sortert som vi har dem).
  const drills =
    tilgjengeligeDrills.length > 80
      ? tilgjengeligeDrills.slice(0, 80)
      : tilgjengeligeDrills;

  return {
    spiller: {
      id: user.id,
      navn: user.name,
      hcp: user.hcp,
      rolle: user.role,
      tier: user.tier,
      spilteAr: user.playingYears,
      ambisjon: user.ambition,
      hjemmeklubb: user.homeClub,
      akKategori,
      ngfKategori,
      tilgjengeligeFasiliteter: user.tilgjengeligeFasiliteter as DrillFasilitet[],
    },
    wagr: wagr
      ? { rank: wagr.rank, ngfKategori: wagr.ngfCategory, ptsAvg: wagr.ptsAvg }
      : null,
    aktivLPhase,
    aktiveMal: goals.map((g) => ({
      type: g.type,
      tittel: g.title,
      targetValue: g.targetValue,
      targetDate: g.targetDate ? g.targetDate.toISOString().slice(0, 10) : null,
    })),
    sistePlaner: planer.map((p) => ({
      navn: p.name,
      start: p.startDate.toISOString().slice(0, 10),
      slutt: p.endDate ? p.endDate.toISOString().slice(0, 10) : null,
      status: p.status,
      antallOkter: p._count.sessions,
    })),
    sisteOkter: logger.map((l) => ({
      sessionTittel: l.session.title,
      drills: l.session.drills.map((d) => ({ navn: d.exercise.name })),
      rating: l.rating,
      notes: l.notes,
      dato: l.createdAt.toISOString().slice(0, 10),
    })),
    signaler: signaler.map((s) => ({
      kind: s.kind,
      value: s.value,
      computedAt: s.computedAt.toISOString().slice(0, 10),
    })),
    fasilitetsGrenser: {
      // Avstandsgrenser avventer schema — plassholdere til Anders låser verdier.
      maxPuttM: null,
      maxChipM: null,
      maxWedgeM: null,
      trackmanHrsPerWeek: null,
      canSwingAtHome: false,
      hasBunker: false,
      hasNetAndMat: false,
      harRange: facilityPrefs?.range ?? true,
      harSimulator: facilityPrefs?.trackman ?? false,
      harBane: (facilityPrefs?.course18 || facilityPrefs?.course9) ?? true,
    },
    tilgjengeligeDrills: drills,
    forrigeEffektivitet,
    treningsVolum,
    korrelasjon,
  };
}

export function kontekstSomBrukerMelding(
  ctx: SpillerKontekst,
  brukerPrompt: string,
  feedback?: string,
  forrigeForslag?: unknown,
): string {
  const linjer: string[] = [];
  linjer.push("KONTEKST OM SPILLEREN (JSON):");
  linjer.push("```json");
  linjer.push(JSON.stringify(ctx, null, 2));
  linjer.push("```");
  linjer.push("");
  linjer.push("COACH SIN INSTRUKS:");
  linjer.push(brukerPrompt);
  if (forrigeForslag && feedback) {
    linjer.push("");
    linjer.push("FORRIGE FORSLAG (revider basert på feedback):");
    linjer.push("```json");
    linjer.push(JSON.stringify(forrigeForslag, null, 2));
    linjer.push("```");
    linjer.push("");
    linjer.push("FEEDBACK FRA COACH:");
    linjer.push(feedback);
  }
  linjer.push("");
  linjer.push(
    'Lag en treningsplan tilpasset spilleren. Kall verktøyet "lever_planforslag" med en gang.',
  );
  return linjer.join("\n");
}
