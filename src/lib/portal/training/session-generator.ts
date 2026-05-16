// session-generator.ts — 4-lags algoritme for å generere økter på treningsplan.
//
// Lag 1: LockedAnchor (faste avtaler — f.eks. "WANG mandag 08-10")
// Lag 2: RecurringPattern (RRULE-baserte gjentakelser)
// Lag 3: PeriodVolumeRecipe (ukentlige "default-økter" per periode)
// Lag 4: ConditionalRule (modifikatorer — "før turnering: legg til putting-økt")
//
// Hver lag respekterer kollisjoner fra forrige lag. Resultatet er én batch
// av økter som settes inn med createMany() for ytelse.

import { rrulestr } from "rrule";
import {
  addDays,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
  differenceInMinutes,
  parseISO,
} from "date-fns";
import { prisma } from "@/lib/prisma";
import type {
  TrainingSessionV2,
  LockedAnchor,
  RecurringPattern,
  PeriodVolumeRecipe,
  PeriodRecipeOkt,
  ConditionalRule,
  PyramidArea,
  PracticeType,
  MMiljo,
} from "@/generated/prisma/client";

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

export type GenererInput = {
  planId: string;
  startDato: Date;
  sluttDato: Date;
  spilllerId: string;
};

export type HoppetOver = { dato: Date; grunn: string };
export type RegelBrudd = { sessionId: string; brudd: string[] };

export type GenererResultat = {
  okter: TrainingSessionV2[];
  hoppetOver: HoppetOver[];
  regelBrudd: RegelBrudd[];
};

// Mellomliggende representasjon før vi skriver til DB.
type DraftOkt = {
  title: string;
  studentId: string;
  coachId: string;
  startTime: Date;
  endTime: Date;
  miljo: MMiljo;
  practiceType: PracticeType;
  notes: string | null;
  pyramide: PyramidArea;
  isCoachCreated: boolean;
  generertFra: "ANCHOR" | "RECURRING" | "RECIPE" | "RULE";
  generertFraId: string;
};

type Recipe = PeriodVolumeRecipe & { okter: PeriodRecipeOkt[] };

// ---------------------------------------------------------------------------
// Hovedfunksjon
// ---------------------------------------------------------------------------

export async function genererOkter(input: GenererInput): Promise<GenererResultat> {
  const { planId, startDato, sluttDato, spilllerId } = input;

  // Hent alt vi trenger i parallell.
  const [plan, ankere, mønstre, oppskrift, regler, eksisterendeOkter] = await Promise.all([
    prisma.trainingPlan.findUniqueOrThrow({
      where: { id: planId },
      select: { id: true, userId: true, createdById: true },
    }),
    prisma.lockedAnchor.findMany({
      where: { studentId: spilllerId },
    }),
    prisma.recurringPattern.findMany({
      where: { studentId: spilllerId },
    }),
    prisma.periodVolumeRecipe.findUnique({
      where: { trainingPlanId: planId },
      include: { okter: true },
    }),
    prisma.conditionalRule.findMany({
      where: {
        OR: [{ studentId: spilllerId }, { trainingPlanId: planId }],
        aktiv: true,
      },
      orderBy: { prioritet: "desc" },
    }),
    prisma.trainingSessionV2.findMany({
      where: {
        studentId: spilllerId,
        startTime: { gte: startDato, lte: sluttDato },
      },
      select: { id: true, startTime: true, endTime: true },
    }),
  ]);

  const coachId = plan.createdById ?? plan.userId;
  const hoppetOver: HoppetOver[] = [];
  const opprettetSlots: DraftOkt[] = [];

  // Slot-kollisjonssjekk: vi holder en liste av (start, slutt) for å sikre at
  // ingen genererte økter overlapper hverandre eller eksisterende økter.
  const opptattSlots: Array<{ start: Date; end: Date }> = eksisterendeOkter.map((o) => ({
    start: o.startTime,
    end: o.endTime,
  }));

  function harKollisjon(start: Date, end: Date): boolean {
    return opptattSlots.some((slot) => start < slot.end && end > slot.start);
  }

  function reserverSlot(start: Date, end: Date): void {
    opptattSlots.push({ start, end });
  }

  // ---------------------------------------------------------------------------
  // Lag 1: LockedAnchor
  // ---------------------------------------------------------------------------
  for (const anker of ankere) {
    const ankerOkter = ekspanderAnker(anker, startDato, sluttDato);
    for (const okt of ankerOkter) {
      if (harKollisjon(okt.startTime, okt.endTime)) {
        hoppetOver.push({ dato: okt.startTime, grunn: `Anker '${anker.navn}' kollisjon` });
        continue;
      }
      const draft: DraftOkt = {
        title: anker.navn,
        studentId: spilllerId,
        coachId,
        startTime: okt.startTime,
        endTime: okt.endTime,
        miljo: "M2",
        practiceType: "BLOKK",
        notes: anker.beskrivelse,
        pyramide: anker.pyramide,
        isCoachCreated: true,
        generertFra: "ANCHOR",
        generertFraId: anker.id,
      };
      opprettetSlots.push(draft);
      reserverSlot(draft.startTime, draft.endTime);
    }
  }

  // ---------------------------------------------------------------------------
  // Lag 2: RecurringPattern (RRULE)
  // ---------------------------------------------------------------------------
  for (const mønster of mønstre) {
    let datoer: Date[] = [];
    try {
      const rule = rrulestr(mønster.rrule);
      datoer = rule.between(startDato, sluttDato, true);
    } catch (err) {
      console.error(`[session-generator] Ugyldig RRULE for ${mønster.id}:`, err);
      continue;
    }

    for (const d of datoer) {
      const [timer, minutter] = mønster.startTid.split(":").map((s) => Number(s));
      const startTime = new Date(d);
      startTime.setHours(timer ?? 0, minutter ?? 0, 0, 0);
      const endTime = new Date(startTime.getTime() + mønster.varighetMin * 60 * 1000);

      if (harKollisjon(startTime, endTime)) {
        hoppetOver.push({ dato: startTime, grunn: `Mønster '${mønster.navn}' kollisjon` });
        continue;
      }
      const draft: DraftOkt = {
        title: mønster.navn,
        studentId: spilllerId,
        coachId,
        startTime,
        endTime,
        miljo: "M2",
        practiceType: "BLOKK",
        notes: mønster.beskrivelse,
        pyramide: mønster.pyramide,
        isCoachCreated: true,
        generertFra: "RECURRING",
        generertFraId: mønster.id,
      };
      opprettetSlots.push(draft);
      reserverSlot(draft.startTime, draft.endTime);
    }
  }

  // ---------------------------------------------------------------------------
  // Lag 3: PeriodVolumeRecipe — fyll inn default-økter for hver uke
  // ---------------------------------------------------------------------------
  if (oppskrift) {
    const recipeOkter = ekspanderOppskrift(oppskrift, startDato, sluttDato);
    for (const ro of recipeOkter) {
      if (harKollisjon(ro.startTime, ro.endTime)) {
        hoppetOver.push({ dato: ro.startTime, grunn: `Oppskrift '${ro.recipeOktId}' kollisjon` });
        continue;
      }
      const draft: DraftOkt = {
        title: ro.title,
        studentId: spilllerId,
        coachId,
        startTime: ro.startTime,
        endTime: ro.endTime,
        miljo: "M2",
        practiceType: "BLOKK",
        notes: ro.notes,
        pyramide: ro.pyramide,
        isCoachCreated: true,
        generertFra: "RECIPE",
        generertFraId: ro.recipeOktId,
      };
      opprettetSlots.push(draft);
      reserverSlot(draft.startTime, draft.endTime);
    }
  }

  // ---------------------------------------------------------------------------
  // Lag 4: ConditionalRule — modifiser eksisterende drafts (eller legg til nye)
  // ---------------------------------------------------------------------------
  let modifiserteSlots = opprettetSlots;
  for (const regel of regler) {
    modifiserteSlots = anvendRegel(regel, modifiserteSlots);
  }

  // ---------------------------------------------------------------------------
  // Skriv til DB i én batch
  // ---------------------------------------------------------------------------
  if (modifiserteSlots.length === 0) {
    return { okter: [], hoppetOver, regelBrudd: [] };
  }

  // Lag deterministiske cuid-er ved å la Prisma generere id-er — vi får dem
  // tilbake i `findMany` etter `createMany`. createMany returnerer ikke rader.
  const før = await prisma.trainingSessionV2.findMany({
    where: { studentId: spilllerId, startTime: { gte: startDato, lte: sluttDato } },
    select: { id: true },
  });
  const førSet = new Set(før.map((r) => r.id));

  await prisma.trainingSessionV2.createMany({
    data: modifiserteSlots.map((s) => ({
      title: s.title,
      studentId: s.studentId,
      coachId: s.coachId,
      startTime: s.startTime,
      endTime: s.endTime,
      miljo: s.miljo,
      practiceType: s.practiceType,
      notes: s.notes ?? undefined,
      isCoachCreated: s.isCoachCreated,
      generertFra: s.generertFra,
      generertFraId: s.generertFraId,
    })),
  });

  const etter = await prisma.trainingSessionV2.findMany({
    where: { studentId: spilllerId, startTime: { gte: startDato, lte: sluttDato } },
  });
  const okter = etter.filter((o) => !førSet.has(o.id));

  return { okter, hoppetOver, regelBrudd: [] };
}

// ---------------------------------------------------------------------------
// Hjelpere: Lag 1 — ekspander LockedAnchor til datoer
// ---------------------------------------------------------------------------

function ekspanderAnker(
  anker: LockedAnchor,
  fra: Date,
  til: Date,
): Array<{ startTime: Date; endTime: Date }> {
  const okter: Array<{ startTime: Date; endTime: Date }> = [];
  const effektivStart = isAfter(anker.startDato, fra) ? anker.startDato : fra;
  const effektivSlutt = isBefore(anker.sluttDato, til) ? anker.sluttDato : til;

  let d = startOfDay(effektivStart);
  while (!isAfter(d, endOfDay(effektivSlutt))) {
    // Prisma `ukedag` = 1-7 (man=1 ... søn=7). JS Date.getDay() = 0-6 (søn=0).
    const jsDag = d.getDay() === 0 ? 7 : d.getDay();
    if (jsDag === anker.ukedag) {
      const [tStart, mStart] = anker.startTid.split(":").map((s) => Number(s));
      const [tSlutt, mSlutt] = anker.sluttTid.split(":").map((s) => Number(s));
      const startTime = new Date(d);
      startTime.setHours(tStart ?? 0, mStart ?? 0, 0, 0);
      const endTime = new Date(d);
      endTime.setHours(tSlutt ?? 0, mSlutt ?? 0, 0, 0);
      okter.push({ startTime, endTime });
    }
    d = addDays(d, 1);
  }
  return okter;
}

// ---------------------------------------------------------------------------
// Hjelpere: Lag 3 — ekspander PeriodVolumeRecipe
// ---------------------------------------------------------------------------

type RecipeDraft = {
  recipeOktId: string;
  title: string;
  pyramide: PyramidArea;
  startTime: Date;
  endTime: Date;
  notes: string | null;
};

function ekspanderOppskrift(
  recipe: Recipe,
  fra: Date,
  til: Date,
): RecipeDraft[] {
  const result: RecipeDraft[] = [];
  // For hver uke i intervallet, for hver okt i oppskriften: opprett antallPerUke
  // datoer. Vi velger preferertUkedag hvis satt, ellers gå sekvensielt.
  let ukeStart = startOfDay(fra);

  while (!isAfter(ukeStart, til)) {
    const ukeSlutt = addDays(ukeStart, 6);
    for (const okt of recipe.okter) {
      const datoer = velgUkedagerForOkt(okt, ukeStart, ukeSlutt);
      for (const d of datoer) {
        const [t, m] = (okt.preferertTid ?? "10:00").split(":").map((s) => Number(s));
        const startTime = new Date(d);
        startTime.setHours(t ?? 10, m ?? 0, 0, 0);
        const endTime = new Date(startTime.getTime() + okt.varighetMin * 60 * 1000);
        if (isBefore(startTime, fra) || isAfter(startTime, til)) continue;
        result.push({
          recipeOktId: okt.id,
          title: `${okt.pyramide}-økt`,
          pyramide: okt.pyramide,
          startTime,
          endTime,
          notes: okt.notat ?? null,
        });
      }
    }
    ukeStart = addDays(ukeStart, 7);
  }
  return result;
}

function velgUkedagerForOkt(okt: PeriodRecipeOkt, ukeStart: Date, ukeSlutt: Date): Date[] {
  const datoer: Date[] = [];
  // Hvis okten har preferertUkedag, bruk den. Ellers fordel jevnt utover uken.
  if (okt.preferertUkedag != null) {
    const targetDag = okt.preferertUkedag;
    let d = startOfDay(ukeStart);
    while (!isAfter(d, ukeSlutt)) {
      const jsDag = d.getDay() === 0 ? 7 : d.getDay();
      if (jsDag === targetDag) {
        datoer.push(new Date(d));
        if (datoer.length >= okt.antallPerUke) break;
      }
      d = addDays(d, 1);
    }
  } else {
    // Fordel jevnt — ta de første N tilgjengelige dagene fra mandag.
    let d = startOfDay(ukeStart);
    while (!isAfter(d, ukeSlutt) && datoer.length < okt.antallPerUke) {
      datoer.push(new Date(d));
      d = addDays(d, Math.floor(7 / Math.max(1, okt.antallPerUke)));
    }
  }
  return datoer;
}

// ---------------------------------------------------------------------------
// Hjelpere: Lag 4 — anvend ConditionalRule
// ---------------------------------------------------------------------------

type RegelParametere = {
  // Eksempler:
  //   { type: "FORE_TURNERING", dagerForXyz: number, leggTilOkt: {...} }
  //   { type: "ETTER_TEST", leggTilOkt: {...} }
  //   { type: "MAX_OKTER_PER_DAG", maks: number }
  [key: string]: unknown;
};

function anvendRegel(regel: ConditionalRule, slots: DraftOkt[]): DraftOkt[] {
  const params = regel.parametere as RegelParametere;
  switch (regel.type) {
    case "MAX_OKTER_PER_DAG": {
      const maks = typeof params.maks === "number" ? params.maks : 2;
      const perDag = new Map<string, number>();
      return slots.filter((s) => {
        const key = startOfDay(s.startTime).toISOString();
        const antall = perDag.get(key) ?? 0;
        if (antall >= maks) return false;
        perDag.set(key, antall + 1);
        return true;
      });
    }
    case "MAX_VARIGHET_PER_DAG": {
      const maksMin = typeof params.maksMinutter === "number" ? params.maksMinutter : 240;
      const perDag = new Map<string, number>();
      return slots.filter((s) => {
        const key = startOfDay(s.startTime).toISOString();
        const sum = perDag.get(key) ?? 0;
        const varighet = differenceInMinutes(s.endTime, s.startTime);
        if (sum + varighet > maksMin) return false;
        perDag.set(key, sum + varighet);
        return true;
      });
    }
    default:
      // Ukjent regel-type — la slots være urørt, men logg.
      console.warn(`[session-generator] Ukjent regel-type: ${regel.type}`);
      return slots;
  }
}

// Eksporter parseISO som hjelper for date-parser.
export { parseISO };
