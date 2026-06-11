"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";
import type { PlanForslag, OktType } from "@/lib/ai-plan/schema";
import { AI_PLAN_MODEL } from "@/lib/ai-plan/generate";
import { PlanTemplatePayloadSchema } from "@/lib/ai-plan/json-schemas";

/**
 * Periodiserings-fase brukt i Plan-wizard. Mappes til pyramidArea-vekter
 * når økt-skjelettet genereres.
 */
export type PlanFase = "BASE" | "GENERELL" | "SPESIFIKK" | "TAPER" | "TOPPFORM";

export const PLAN_FASE_LABELS: Record<PlanFase, string> = {
  BASE: "Base",
  GENERELL: "Generell",
  SPESIFIKK: "Spesifikk",
  TAPER: "Taper",
  TOPPFORM: "Toppform",
};

export type AllokeringVekter = {
  FYS: number;
  TEK: number;
  SLAG: number;
  SPILL: number;
  TURN: number;
};

export type UkeSkjema = {
  okterPerUke: number;
  varighetMin: number;
};

export type OpprettPlanInput = {
  spillerId: string;
  navn: string;
  startDato: string;
  sluttDato: string;
  faser: PlanFase[];
  allokering: AllokeringVekter;
  ukeSkjema: UkeSkjema;
  /**
   * Hvis true: planen sendes direkte til spilleren for godkjenning
   * (status = PENDING_PLAYER). Default false → planen lagres som DRAFT.
   */
  sendTilSpiller?: boolean;
};

type ValideringResultat =
  | { ok: true; planId: string }
  | { ok: false; feil: string };

const PYRAMID_OMRADER: (keyof AllokeringVekter)[] = [
  "FYS",
  "TEK",
  "SLAG",
  "SPILL",
  "TURN",
];

function valider(input: OpprettPlanInput): string | null {
  if (!input.spillerId || typeof input.spillerId !== "string") {
    return "Spiller mangler.";
  }
  if (!input.navn || input.navn.trim().length < 2) {
    return "Plan-navn må være minst 2 tegn.";
  }
  if (input.navn.length > 120) {
    return "Plan-navn er for langt (maks 120 tegn).";
  }
  const start = new Date(input.startDato);
  const slutt = new Date(input.sluttDato);
  if (Number.isNaN(start.getTime()) || Number.isNaN(slutt.getTime())) {
    return "Ugyldig dato.";
  }
  if (slutt.getTime() <= start.getTime()) {
    return "Sluttdato må være etter startdato.";
  }
  if (!Array.isArray(input.faser) || input.faser.length < 3 || input.faser.length > 5) {
    return "Velg 3–5 faser.";
  }
  const sum = PYRAMID_OMRADER.reduce((acc, n) => acc + (input.allokering[n] ?? 0), 0);
  if (sum !== 100) {
    return `Allokering må summere til 100 % (er nå ${sum}).`;
  }
  for (const n of PYRAMID_OMRADER) {
    const v = input.allokering[n];
    if (typeof v !== "number" || v < 0 || v > 100) {
      return `Ugyldig vekt for ${n}.`;
    }
  }
  if (input.ukeSkjema.okterPerUke < 1 || input.ukeSkjema.okterPerUke > 7) {
    return "Antall økter per uke må være 1–7.";
  }
  if (input.ukeSkjema.varighetMin < 15 || input.ukeSkjema.varighetMin > 360) {
    return "Varighet må være 15–360 min.";
  }
  return null;
}

/**
 * Velg pyramidArea for én økt deterministisk basert på vekter.
 * Returnerer FYS/TEK/SLAG/SPILL/TURN slik at det totale antallet økter per
 * område over hele planen er proporsjonal med allokeringen.
 */
function fordelPyramidArea(
  index: number,
  totalOkter: number,
  allokering: AllokeringVekter,
): PyramidArea {
  // Bygg cumulative-array av antall økter per område
  const antallPerOmrade: { omrade: keyof AllokeringVekter; n: number }[] = PYRAMID_OMRADER.map(
    (omrade) => ({
      omrade,
      n: Math.round((allokering[omrade] / 100) * totalOkter),
    }),
  );
  // Build sequence
  const sekvens: PyramidArea[] = [];
  for (const { omrade, n } of antallPerOmrade) {
    for (let i = 0; i < n; i++) {
      sekvens.push(omrade as PyramidArea);
    }
  }
  // Hvis avrundinger gir for få/for mange, fyll med største område
  while (sekvens.length < totalOkter) {
    sekvens.push("TEK" as PyramidArea);
  }
  if (sekvens.length > totalOkter) {
    sekvens.length = totalOkter;
  }
  return sekvens[index] ?? ("TEK" as PyramidArea);
}

function fasetittel(fase: PlanFase, area: PyramidArea): string {
  const fNavn = PLAN_FASE_LABELS[fase];
  const areaNavn: Record<PyramidArea, string> = {
    FYS: "Fysisk økt",
    TEK: "Teknikk-økt",
    SLAG: "Slag-økt",
    SPILL: "Banespill",
    TURN: "Turnerings-prep",
  };
  return `${fNavn} · ${areaNavn[area]}`;
}

/**
 * Lagre plan-utkast (status DRAFT) — alias for {@link opprettPlan} med
 * sendTilSpiller=false. Eksponeres som egen navngitt action slik at coach-UI
 * og automatiserings-skript kan kalle den uten å vite om det interne flagget.
 */
export async function savePlanDraft(
  input: Omit<OpprettPlanInput, "sendTilSpiller">,
): Promise<ValideringResultat> {
  return opprettPlan({ ...input, sendTilSpiller: false });
}

/**
 * Publiser plan til spiller (status PENDING_PLAYER + Notification) — alias for
 * {@link opprettPlan} med sendTilSpiller=true. Lager også en Notification slik
 * at spilleren får varsel om at planen venter på godkjenning.
 */
export async function publishPlan(
  input: Omit<OpprettPlanInput, "sendTilSpiller">,
): Promise<ValideringResultat> {
  const res = await opprettPlan({ ...input, sendTilSpiller: true });
  if (!res.ok) return res;

  // Send Notification til spilleren slik at planen vises i innboksen deres.
  try {
    await prisma.notification.create({
      data: {
        userId: input.spillerId,
        type: "plan",
        title: "Ny treningsplan venter på godkjenning",
        body: `Coachen din har sendt deg planen «${input.navn.trim()}». Åpne den for å godkjenne.`,
        link: `/portal/planer/${res.planId}`,
      },
    });
  } catch (err) {
    // Notification er ikke kritisk — planen er allerede opprettet.
    console.error("[plans] Kunne ikke opprette Notification for ny plan", err);
  }

  return res;
}

export async function opprettPlan(input: OpprettPlanInput): Promise<ValideringResultat> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, feil: "unauthenticated" };
  if (user.role !== "COACH" && user.role !== "ADMIN") {
    return { ok: false, feil: "forbidden" };
  }

  const valideringsFeil = valider(input);
  if (valideringsFeil) return { ok: false, feil: valideringsFeil };

  // Beregn antall økter totalt og generer sessions
  const start = new Date(input.startDato);
  const slutt = new Date(input.sluttDato);
  const msPerUke = 7 * 24 * 60 * 60 * 1000;
  const antallUker = Math.max(1, Math.round((slutt.getTime() - start.getTime()) / msPerUke));
  const totalOkter = antallUker * input.ukeSkjema.okterPerUke;

  // Mappe globale økt-indekser til fase basert på fase-andel av totalUker
  const faser = input.faser;
  const ukerPerFase = Math.floor(antallUker / faser.length);
  const restUker = antallUker - ukerPerFase * faser.length;

  // Bygg liste over hvilken fase hver uke tilhører
  const fasePerUke: PlanFase[] = [];
  for (let i = 0; i < faser.length; i++) {
    const ekstra = i < restUker ? 1 : 0;
    for (let u = 0; u < ukerPerFase + ekstra; u++) {
      fasePerUke.push(faser[i]);
    }
  }

  // Lag plan + sessions i samme transaksjon
  // sendTilSpiller=true → PENDING_PLAYER (synlig for spiller, venter på godkjenning)
  // sendTilSpiller=false → DRAFT (coach jobber videre)
  const status = input.sendTilSpiller ? "PENDING_PLAYER" : "DRAFT";
  const plan = await prisma.trainingPlan.create({
    data: {
      userId: input.spillerId,
      name: input.navn.trim(),
      startDate: start,
      endDate: slutt,
      isActive: true,
      status,
      createdById: user.id,
      sessions: {
        create: Array.from({ length: totalOkter }, (_, i) => {
          const uke = Math.floor(i / input.ukeSkjema.okterPerUke);
          const okterIDenneUken = input.ukeSkjema.okterPerUke;
          const dagOffset = uke * 7 + Math.floor((i % okterIDenneUken) * (6 / Math.max(1, okterIDenneUken - 1)));
          const scheduledAt = new Date(start.getTime() + dagOffset * 24 * 60 * 60 * 1000);
          const fase = fasePerUke[uke] ?? faser[faser.length - 1];
          const pyramidArea = fordelPyramidArea(i, totalOkter, input.allokering);
          return {
            scheduledAt,
            durationMin: input.ukeSkjema.varighetMin,
            title: fasetittel(fase, pyramidArea),
            pyramidArea,
            status: "PLANNED" as const,
          };
        }),
      },
    },
  });

  revalidatePath("/admin/plans");
  revalidatePath(`/admin/plans/${plan.id}`);
  return { ok: true, planId: plan.id };
}

/**
 * Hent en mal-payload som plain JSON, til bruk for å forhåndsfylle wizard-stegene.
 * Returnerer null hvis malen ikke finnes eller er inaktiv.
 */
export type MalForhandsutfylling = {
  templateId: string;
  navn: string;
  weeks: number;
  allokering: AllokeringVekter;
  ukeSkjema: UkeSkjema;
};

export async function hentMalForhandsutfylling(
  templateId: string,
): Promise<MalForhandsutfylling | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "COACH" && user.role !== "ADMIN") return null;

  const mal = await prisma.planTemplate.findUnique({
    where: { id: templateId },
  });
  if (!mal || !mal.approved) return null;

  // Vi lagrer disciplinFordeling som Json i Prisma. Bruk zod for å validere
  // — feil format skal feile høyt, ikke gi `undefined.allokering` lengre nede.
  const parseResult = PlanTemplatePayloadSchema.safeParse(mal.disciplinFordeling);
  if (!parseResult.success) {
    console.error("[plans] PlanTemplate.disciplinFordeling har ugyldig form", {
      templateId: mal.id,
      feil: parseResult.error.issues,
    });
    return null;
  }
  const payload = parseResult.data;

  return {
    templateId: mal.id,
    navn: mal.name,
    weeks: mal.varighetUker,
    allokering: payload.allokering,
    ukeSkjema: payload.ukeSkjema,
  };
}

/* =========================================================
   AI-plan — lagre forslag som TrainingPlan
   ========================================================= */

export type OpprettAiPlanInput = {
  spillerId: string;
  startDato: string;
  generationId: string;
  forslag: PlanForslag;
  sendTilSpiller: boolean;
};

const OKT_TYPE_TIL_PYR: Record<OktType, PyramidArea> = {
  RANGE: "TEK",
  NARESPILL: "SLAG",
  PUTTING: "SLAG",
  SPILL: "SPILL",
  FYSISK: "FYS",
  MENTAL: "TURN",
};

const DAG_TIL_OFFSET: Record<string, number> = {
  MAN: 0,
  TIR: 1,
  ONS: 2,
  TOR: 3,
  FRE: 4,
  LOR: 5,
  SON: 6,
};

/* =========================================================
   Visuell plan-bygger — opprett plan fra drag-drop-raster
   ========================================================= */

export type VisuellByggSession = {
  ax: "fys" | "tek" | "slag" | "spill" | "turn";
  ttl: string;
  mins: number;
  weekNumber: number;
  dayIndex: number; // 0 = mandag, 6 = søndag
};

export type OpprettPlanFraByggInput = {
  spillerId: string;
  navn: string;
  sessions: VisuellByggSession[];
};

const AX_TIL_PYRAMID: Record<VisuellByggSession["ax"], PyramidArea> = {
  fys:   "FYS",
  tek:   "TEK",
  slag:  "SLAG",
  spill: "SPILL",
  turn:  "TURN",
};

function weekStartDate(weekNumber: number): Date {
  // Uke N: start = 1. jan 2026 + (N-1) * 7 dager (matcher prototype-formel)
  return new Date(2026, 0, 1 + (weekNumber - 1) * 7);
}

export async function opprettPlanFraByggere(
  input: OpprettPlanFraByggInput,
): Promise<{ ok: true; planId: string } | { ok: false; feil: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, feil: "unauthenticated" };
  if (user.role !== "COACH" && user.role !== "ADMIN") {
    return { ok: false, feil: "forbidden" };
  }

  if (!input.spillerId) return { ok: false, feil: "Mangler spillerId." };
  if (!input.navn || input.navn.trim().length < 2) {
    return { ok: false, feil: "Plan-navn må være minst 2 tegn." };
  }

  // Beregn dato-range fra sessions (eller bruk hele 2026 som fallback)
  let startDate = new Date(2026, 0, 1);
  let endDate = new Date(2026, 11, 31);
  if (input.sessions.length > 0) {
    const dates = input.sessions.map((s) => {
      const ws = weekStartDate(s.weekNumber);
      return ws.getTime() + s.dayIndex * 86400000;
    });
    startDate = new Date(Math.min(...dates));
    endDate = new Date(Math.max(...dates) + 86400000);
  }

  const plan = await prisma.trainingPlan.create({
    data: {
      userId: input.spillerId,
      name: input.navn.trim(),
      startDate,
      endDate,
      isActive: true,
      status: "PENDING_PLAYER",
      createdById: user.id,
      sessions: {
        create: input.sessions.map((s) => ({
          scheduledAt: new Date(weekStartDate(s.weekNumber).getTime() + s.dayIndex * 86400000),
          durationMin: s.mins,
          title: s.ttl,
          pyramidArea: AX_TIL_PYRAMID[s.ax],
          status: "PLANNED" as const,
        })),
      },
    },
  });

  revalidatePath("/admin/plans");
  revalidatePath(`/admin/plans/${plan.id}`);
  return { ok: true, planId: plan.id };
}

export async function opprettPlanFraAiForslag(
  input: OpprettAiPlanInput,
): Promise<ValideringResultat> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, feil: "unauthenticated" };
  if (user.role !== "COACH" && user.role !== "ADMIN") {
    return { ok: false, feil: "forbidden" };
  }

  const { spillerId, startDato, generationId, forslag, sendTilSpiller } = input;

  if (!spillerId) return { ok: false, feil: "Mangler spillerId." };
  if (!generationId) return { ok: false, feil: "Mangler generationId." };
  if (!forslag || !Array.isArray(forslag.okter) || forslag.okter.length === 0) {
    return { ok: false, feil: "Forslaget har ingen økter." };
  }

  const start = new Date(startDato);
  if (Number.isNaN(start.getTime())) {
    return { ok: false, feil: "Ugyldig startdato." };
  }
  const slutt = new Date(
    start.getTime() + forslag.periodeUker * 7 * 24 * 60 * 60 * 1000,
  );

  // Hent ExerciseDefinition matched on name (case-insensitive) for å kunne
  // opprette SessionDrill-rader der mulig.
  const drillNavn = Array.from(
    new Set(
      forslag.okter.flatMap((o) =>
        o.drills.map((d) => d.navn.trim().toLowerCase()),
      ),
    ),
  );
  const exDefs = drillNavn.length
    ? await prisma.exerciseDefinition.findMany({
        where: { name: { in: drillNavn, mode: "insensitive" } },
        select: { id: true, name: true },
      })
    : [];
  const exDefByName = new Map(
    exDefs.map((e) => [e.name.toLowerCase(), e.id] as const),
  );

  const status = sendTilSpiller ? "PENDING_PLAYER" : "DRAFT";

  const plan = await prisma.trainingPlan.create({
    data: {
      userId: spillerId,
      name: forslag.navn,
      startDate: start,
      endDate: slutt,
      isActive: true,
      status,
      createdById: user.id,
      aiGenerated: true,
      aiGenerationId: generationId,
      aiModel: AI_PLAN_MODEL,
      sessions: {
        create: forslag.okter.map((okt) => {
          const dagOffset = DAG_TIL_OFFSET[okt.dag] ?? 0;
          const scheduledAt = new Date(
            start.getTime() +
              ((okt.uke - 1) * 7 + dagOffset) * 24 * 60 * 60 * 1000,
          );
          const pyr = OKT_TYPE_TIL_PYR[okt.type];
          const rationale = okt.drills
            .map((d) => {
              const sets = d.sets ?? d.antallSet;
              const reps = d.reps ?? d.antallRep;
              const detaljer = [
                sets ? `${sets} sett` : null,
                reps ? `${reps} rep` : null,
                d.csTarget ? `CS ${d.csTarget}%` : null,
              ]
                .filter(Boolean)
                .join(" · ");
              const note = d.notes ?? d.notat;
              return `${d.navn}${detaljer ? ` (${detaljer})` : ""}${
                note ? ` — ${note}` : ""
              }`;
            })
            .join("\n");

          const drillsCreate = okt.drills
            .map((d) => {
              const exId = exDefByName.get(d.navn.trim().toLowerCase());
              if (!exId) return null;
              const sets = d.sets ?? d.antallSet ?? null;
              const reps = d.reps ?? d.antallRep ?? null;
              const repsSets =
                sets && reps
                  ? `${sets}x${reps}`
                  : reps
                    ? `${reps}`
                    : sets
                      ? `${sets} sett`
                      : "—";
              return {
                exerciseId: exId,
                repsSets,
                sets,
                reps,
                csTarget: d.csTarget ?? null,
                notes: d.notes ?? d.notat ?? null,
              };
            })
            .filter((x): x is NonNullable<typeof x> => x !== null);

          return {
            scheduledAt,
            durationMin: okt.varighetMin,
            title: `${okt.fokus}`,
            rationale,
            pyramidArea: pyr,
            skillArea: okt.skillArea ?? null,
            environment: okt.environment ?? null,
            lPhase: okt.lPhase ?? null,
            status: "PLANNED" as const,
            drills: drillsCreate.length
              ? { create: drillsCreate.map((d, i) => ({ ...d, orderIndex: i })) }
              : undefined,
          };
        }),
      },
    },
  });

  revalidatePath("/admin/plans");
  revalidatePath(`/admin/plans/${plan.id}`);
  return { ok: true, planId: plan.id };
}
