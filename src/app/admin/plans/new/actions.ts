"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import type { PyramidArea } from "@/generated/prisma/client";

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
  const plan = await prisma.trainingPlan.create({
    data: {
      userId: input.spillerId,
      name: input.navn.trim(),
      startDate: start,
      endDate: slutt,
      isActive: true,
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
