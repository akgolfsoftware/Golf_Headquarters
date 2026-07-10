/**
 * Plan-bygger-kjernen — delt mellom legacy-ruten (/portal/mal/bygger) og
 * v2-flaten (/portal/planlegge/bygger). Trukket ut av
 * src/app/portal/(legacy)/mal/bygger/actions.ts, parameterisert på bruker i
 * stedet for å kalle requirePortalUser selv — rutenes actions er tynne
 * "use server"-wrappers rundt disse.
 *
 * Endringer fra legacy-versjonen (bevisste):
 * - lagrePlanForslag dual-writer nå til V2 via upsertV2ForPlanSession per økt
 *   (tettet gap: planer lagret her var usynlige i v2-ukevisningen).
 * - PlanForslag zod-valideres på server-grensen (forslaget har rundtur via
 *   klienten mellom generering og lagring).
 */

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { genererPlan } from "@/lib/ai-plan/generate";
import { akTilNgfKategori, hentSpillerAkKategori } from "@/lib/domain/spiller-kategori";
import { upsertV2ForPlanSession } from "@/lib/workbench/v2-sync";
import {
  OKT_DAGER,
  OKT_TYPER,
  SKILL_AREAS,
  ENVIRONMENTS,
  LPHASES,
  type PlanForslag,
  type OktDag,
} from "@/lib/ai-plan/schema";
import type {
  LPhase,
  NgfKategori,
  PyramidArea,
  SessionEnvironment,
} from "@/generated/prisma/client";

/** Minimal bruker-kontrakt — rutene sender inn requirePortalUser-resultatet. */
export type ByggerBruker = {
  id: string;
  name: string;
  hcp: number | null;
  tier: string;
};

export type ByggerMaltype = "TURNERING" | "SVAKHET" | "GENERELL" | "EGENDEFINERT";

export type ByggerKontekst = {
  spiller: {
    id: string;
    navn: string;
    fornavn: string;
    hcp: number | null;
    tier: string;
    kategori: NgfKategori | null;
  };
  aktivLPhase: LPhase | null;
  kommendeTurneringer: {
    id: string;
    navn: string;
    dato: string | null;
    kategori: string | null;
  }[];
  svakhet: {
    skillArea: string;
    sgDelta: number | null;
  } | null;
};

export type MalAnbefaling = {
  templateId: string;
  navn: string;
  beskrivelse: string | null;
  kategori: NgfKategori;
  lPhase: LPhase;
  varighetUker: number;
  ukentligOktAntall: number;
  disciplinFordeling: Record<string, number>;
  usageCount: number;
  effectivenessAvg: number | null;
};

export type AnbefalingerResultat = {
  anbefalt: MalAnbefaling | null;
  alternativer: MalAnbefaling[];
};

export type GenerertForslag = {
  generationId: string;
  templateId: string | null;
  forslag: PlanForslag;
};

export type LagrePlanInput = {
  generationId: string;
  forslag: PlanForslag;
  status: "DRAFT" | "PENDING_COACH";
  startDato: string; // ISO yyyy-mm-dd
};

export type LagrePlanResultat = {
  planId: string;
};

const DAG_TIL_OFFSET: Record<OktDag, number> = {
  MAN: 0,
  TIR: 1,
  ONS: 2,
  TOR: 3,
  FRE: 4,
  LOR: 5,
  SON: 6,
};

const OKT_TYPE_TIL_PYRAMID: Record<string, PyramidArea> = {
  RANGE: "TEK",
  NARESPILL: "TEK",
  PUTTING: "TEK",
  SPILL: "SPILL",
  FYSISK: "FYS",
  MENTAL: "SPILL",
};

const ENV_FALLBACK: SessionEnvironment = "RANGE";

// ---------- Zod: PlanForslag på server-grensen ----------

const PlanForslagDrillSchema = z.object({
  navn: z.string().min(1),
  sets: z.number().int().min(1).max(20).optional(),
  reps: z.number().int().min(1).max(500).optional(),
  csTarget: z.number().min(0).max(110).optional(),
  notes: z.string().optional(),
  // Bakoverkompatibilitet (eldre forslag i omløp)
  antallRep: z.number().optional(),
  antallSet: z.number().optional(),
  varighetMin: z.number().optional(),
  notat: z.string().optional(),
});

const PlanForslagOktSchema = z.object({
  uke: z.number().int().min(1).max(52),
  dag: z.enum(OKT_DAGER),
  type: z.enum(OKT_TYPER),
  varighetMin: z.number().int().min(15).max(360),
  fokus: z.string().min(1),
  skillArea: z.enum(SKILL_AREAS),
  environment: z.enum(ENVIRONMENTS),
  lPhase: z.enum(LPHASES),
  drills: z.array(PlanForslagDrillSchema),
});

export const PlanForslagSchema = z.object({
  navn: z.string().min(1).max(200),
  beskrivelse: z.string(),
  periodeUker: z.number().int().min(1).max(12),
  fokusOmrader: z.array(z.string()),
  okter: z.array(PlanForslagOktSchema).min(1),
});

// ---------- Kjerner (1:1 fra legacy-actions, bruker som parameter) ----------

function parseDisciplinFordeling(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "number") out[k] = v;
  }
  return out;
}

async function hentAktivLPhaseInternal(userId: string): Promise<LPhase | null> {
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

export async function hentByggerKontekstCore(user: ByggerBruker): Promise<ByggerKontekst> {
  const [wagr, signaler, aktivLPhase, turneringer] = await Promise.all([
    prisma.wagrSnapshot.findUnique({
      where: { userId: user.id },
      select: { ngfCategory: true },
    }),
    prisma.signal.findMany({
      where: { userId: user.id, kind: { contains: "sg_" } },
      orderBy: { computedAt: "desc" },
      take: 10,
      select: { kind: true, value: true },
    }),
    hentAktivLPhaseInternal(user.id),
    prisma.tournamentEntry.findMany({
      where: {
        userId: user.id,
        entryStatus: "PLANNED",
        OR: [
          { manualDate: { gte: new Date() } },
          { tournament: { startDate: { gte: new Date() } } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        tournament: { select: { name: true, startDate: true } },
      },
    }),
  ]);

  // Utled svakhet fra signaler — finn laveste SG-verdi.
  let svakhet: ByggerKontekst["svakhet"] = null;
  const sgSignaler = signaler.filter(
    (s) => s.value !== null && s.kind.startsWith("sg_"),
  );
  if (sgSignaler.length > 0) {
    const laveste = sgSignaler.reduce((min, s) =>
      (s.value ?? 0) < (min.value ?? 0) ? s : min,
    );
    const navn = laveste.kind
      .replace("sg_", "")
      .replace("_delta", "")
      .toUpperCase();
    svakhet = { skillArea: navn, sgDelta: laveste.value };
  }

  const akKat = await hentSpillerAkKategori(user.id, {
    wagrNgfCategory: wagr?.ngfCategory ?? null,
    hcp: user.hcp,
  });
  const kategori = akKat ? akTilNgfKategori(akKat) : null;

  return {
    spiller: {
      id: user.id,
      navn: user.name,
      fornavn: user.name.split(" ")[0] ?? user.name,
      hcp: user.hcp,
      tier: user.tier,
      kategori,
    },
    aktivLPhase,
    kommendeTurneringer: turneringer.map((t) => ({
      id: t.id,
      navn: t.tournament?.name ?? t.manualName ?? "Turnering",
      dato: (t.tournament?.startDate ?? t.manualDate)?.toISOString().slice(0, 10) ?? null,
      kategori: t.category,
    })),
    svakhet,
  };
}

export async function anbefalMalCore(
  user: ByggerBruker,
  input: { maltype: ByggerMaltype; turneringId?: string | null },
): Promise<AnbefalingerResultat> {
  const wagr = await prisma.wagrSnapshot.findUnique({
    where: { userId: user.id },
    select: { ngfCategory: true },
  });
  const akKat = await hentSpillerAkKategori(user.id, {
    wagrNgfCategory: wagr?.ngfCategory ?? null,
    hcp: user.hcp,
  });
  const kategori = akKat ? akTilNgfKategori(akKat) : null;
  if (!kategori) {
    return { anbefalt: null, alternativer: [] };
  }

  // lPhase: hvis turnering valgt → TURNERING; ellers aktiv lPhase eller GRUNN.
  let lPhase: LPhase = "GRUNN";
  if (input.maltype === "TURNERING") {
    lPhase = "TURNERING";
  } else {
    const aktiv = await hentAktivLPhaseInternal(user.id);
    if (aktiv) lPhase = aktiv;
  }

  const [primary, andre] = await Promise.all([
    prisma.planTemplate.findFirst({
      where: { kategori, lPhase },
      orderBy: [
        { approved: "desc" },
        { effectivenessAvg: "desc" },
        { usageCount: "desc" },
      ],
    }),
    prisma.planTemplate.findMany({
      where: { kategori },
      orderBy: [
        { approved: "desc" },
        { effectivenessAvg: "desc" },
        { usageCount: "desc" },
      ],
      take: 5,
    }),
  ]);

  const mapTemplate = (
    t: NonNullable<Awaited<ReturnType<typeof prisma.planTemplate.findFirst>>>,
  ): MalAnbefaling => ({
    templateId: t.id,
    navn: t.name,
    beskrivelse: t.description,
    kategori: t.kategori,
    lPhase: t.lPhase,
    varighetUker: t.varighetUker,
    ukentligOktAntall: t.ukentligOktAntall,
    disciplinFordeling: parseDisciplinFordeling(t.disciplinFordeling),
    usageCount: t.usageCount,
    effectivenessAvg: t.effectivenessAvg,
  });

  return {
    anbefalt: primary ? mapTemplate(primary) : null,
    alternativer: andre.filter((a) => a.id !== primary?.id).map(mapTemplate),
  };
}

export async function genererPlanForslagCore(
  user: ByggerBruker,
  input: {
    maltype: ByggerMaltype;
    turneringId?: string | null;
    egendefinertTekst?: string;
  },
): Promise<GenerertForslag> {
  // Bygg coach-prompt basert på valgt mål-type.
  let brukerPrompt = "";
  switch (input.maltype) {
    case "TURNERING": {
      if (input.turneringId) {
        const t = await prisma.tournamentEntry.findUnique({
          where: { id: input.turneringId },
          include: { tournament: true },
        });
        const navn = t?.tournament?.name ?? t?.manualName ?? "kommende turnering";
        const dato = (t?.tournament?.startDate ?? t?.manualDate)
          ?.toISOString()
          .slice(0, 10);
        brukerPrompt = `Lag en plan som forbereder spilleren til ${navn}${dato ? ` (${dato})` : ""}. Fokus på turneringsspesifikk skarphet — under-press-trening, nærspill og putting under turnerings-forhold.`;
      } else {
        brukerPrompt =
          "Lag en turneringsforberedelse-plan. Fokus på under-press-trening, nærspill og putting under turnerings-forhold.";
      }
      break;
    }
    case "SVAKHET":
      brukerPrompt =
        "Identifiser spillerens svakeste SG-område fra konteksten og lag en plan som adresserer det. Bruk 60% av økt-tiden på svakhets-arbeid.";
      break;
    case "GENERELL":
      brukerPrompt =
        "Lag en balansert utviklings-plan basert på aktiv L-fase. Følg pyramide-balanse (FYS 15%, TEK 25%, SLAG 25%, SPILL 20%, TURN 15%).";
      break;
    case "EGENDEFINERT":
      brukerPrompt =
        input.egendefinertTekst?.trim() ||
        "Lag en treningsplan tilpasset spillerens kontekst.";
      break;
  }

  // Spilleren er både "user" og "coach" i denne flyten (spiller-driven). For
  // logging bruker vi user.id som coachId siden vi ikke har en coach-id ennå.
  const resultat = await genererPlan({
    userId: user.id,
    coachId: user.id,
    brukerPrompt,
  });

  return {
    generationId: resultat.generationId,
    templateId: resultat.templateId,
    forslag: resultat.forslag,
  };
}

export async function lagrePlanForslagCore(
  user: ByggerBruker,
  input: LagrePlanInput,
): Promise<LagrePlanResultat> {
  if (user.tier === "GRATIS") {
    throw new Error(
      "GRATIS-brukere kan ikke lagre planer. Oppgrader til PRO for å lagre.",
    );
  }

  const parsedForslag = PlanForslagSchema.safeParse(input.forslag);
  if (!parsedForslag.success) {
    throw new Error("Ugyldig plan-forslag — generer på nytt og prøv igjen.");
  }
  const forslag = parsedForslag.data;

  const startDato = new Date(input.startDato);
  if (Number.isNaN(startDato.getTime())) {
    throw new Error("Ugyldig startdato.");
  }

  const status = input.status === "PENDING_COACH" ? "PENDING_PLAYER" : "DRAFT";

  // Slutt-dato: startDato + periodeUker * 7 dager.
  const sluttDato = new Date(startDato);
  sluttDato.setDate(sluttDato.getDate() + forslag.periodeUker * 7);

  // Mapper drill-navn til ExerciseDefinition.id — match på navn (case-insensitive).
  // Drills som ikke finnes opprettes ikke automatisk her; vi hopper over dem.
  const drillNavn = Array.from(
    new Set(forslag.okter.flatMap((o) => o.drills.map((d) => d.navn))),
  );
  const eksisterendeDrills = drillNavn.length
    ? await prisma.exerciseDefinition.findMany({
        where: {
          OR: drillNavn.map((navn) => ({ name: { equals: navn, mode: "insensitive" as const } })),
        },
        select: { id: true, name: true },
      })
    : [];
  const drillMap = new Map<string, string>();
  for (const d of eksisterendeDrills) {
    drillMap.set(d.name.toLowerCase(), d.id);
  }

  const plan = await prisma.trainingPlan.create({
    data: {
      userId: user.id,
      name: forslag.navn,
      startDate: startDato,
      endDate: sluttDato,
      isActive: false,
      status,
      aiGenerated: true,
      aiGenerationId: input.generationId,
      sessions: {
        create: forslag.okter.map((okt) => {
          const offset = (okt.uke - 1) * 7 + DAG_TIL_OFFSET[okt.dag];
          const scheduledAt = new Date(startDato);
          scheduledAt.setDate(scheduledAt.getDate() + offset);
          const pyramidArea = OKT_TYPE_TIL_PYRAMID[okt.type] ?? "TEK";
          return {
            scheduledAt,
            durationMin: okt.varighetMin,
            title: okt.fokus,
            rationale: null,
            pyramidArea,
            skillArea: okt.skillArea,
            environment: (okt.environment ?? ENV_FALLBACK) as SessionEnvironment,
            lPhase: okt.lPhase === "SPESIAL" ? "SPESIAL" : okt.lPhase,
            drills: {
              create: okt.drills
                .map((d, idx) => {
                  const exerciseId = drillMap.get(d.navn.toLowerCase());
                  if (!exerciseId) return null;
                  return {
                    exerciseId,
                    repsSets: `${d.sets ?? d.antallSet ?? 1}x${d.reps ?? d.antallRep ?? 10}`,
                    sets: d.sets ?? d.antallSet ?? null,
                    reps: d.reps ?? d.antallRep ?? null,
                    csTarget: d.csTarget ?? null,
                    notes: d.notes ?? d.notat ?? null,
                    orderIndex: idx,
                  };
                })
                .filter((x): x is NonNullable<typeof x> => x !== null),
            },
          };
        }),
      },
    },
    select: {
      id: true,
      sessions: {
        select: {
          id: true,
          title: true,
          scheduledAt: true,
          durationMin: true,
          pyramidArea: true,
        },
      },
    },
  });

  // Dual-write til V2 (fast regel: hver økt-skriving speiles) — legacy-flyten
  // manglet dette, så AI-planer var usynlige i v2-ukevisningen.
  for (const s of plan.sessions) {
    await upsertV2ForPlanSession({
      planSessionId: s.id,
      playerId: user.id,
      title: s.title,
      scheduledAt: s.scheduledAt,
      durationMin: s.durationMin,
      pyramidArea: s.pyramidArea,
      miljo: null,
    });
  }

  return { planId: plan.id };
}

export async function sendTilGodkjenningCore(
  userId: string,
  planId: string,
): Promise<{ ok: true }> {
  const plan = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    select: { userId: true, status: true },
  });
  if (!plan || plan.userId !== userId) {
    throw new Error("Plan ikke funnet eller du har ikke tilgang.");
  }

  await prisma.trainingPlan.update({
    where: { id: planId },
    data: { status: "PENDING_PLAYER" },
  });

  return { ok: true };
}
