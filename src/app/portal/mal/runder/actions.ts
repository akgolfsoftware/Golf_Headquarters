"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { triggerRoundAgent } from "@/lib/agents/triggers";

export type RoundInput = {
  courseId: string;
  playedAt: string; // ISO-dato
  score: number;
  // Top-level SG
  sgTotal?: number;
  sgOtt?: number;
  sgApp?: number;
  sgArg?: number;
  sgPutt?: number;
  // Granulære SG
  sgTee?: number;
  sgApp200?: number;
  sgApp150?: number;
  sgApp100?: number;
  sgApp50?: number;
  sgChip?: number;
  sgPitch?: number;
  sgLob?: number;
  sgBunker?: number;
  sgPutt0_3?: number;
  sgPutt3_5?: number;
  sgPutt5_10?: number;
  sgPutt10_15?: number;
  sgPutt15_25?: number;
  sgPutt25_40?: number;
  sgPutt40plus?: number;
  notes?: string;
};

export async function createRound(
  input: RoundInput,
): Promise<{ roundId: string; sgTotal: number | null }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const round = await prisma.round.create({
    data: {
      userId: user.id,
      courseId: input.courseId,
      playedAt: new Date(input.playedAt),
      score: input.score,
      sgTotal: input.sgTotal ?? null,
      sgOtt: input.sgOtt ?? null,
      sgApp: input.sgApp ?? null,
      sgArg: input.sgArg ?? null,
      sgPutt: input.sgPutt ?? null,
      sgTee: input.sgTee ?? null,
      sgApp200: input.sgApp200 ?? null,
      sgApp150: input.sgApp150 ?? null,
      sgApp100: input.sgApp100 ?? null,
      sgApp50: input.sgApp50 ?? null,
      sgChip: input.sgChip ?? null,
      sgPitch: input.sgPitch ?? null,
      sgLob: input.sgLob ?? null,
      sgBunker: input.sgBunker ?? null,
      sgPutt0_3: input.sgPutt0_3 ?? null,
      sgPutt3_5: input.sgPutt3_5 ?? null,
      sgPutt5_10: input.sgPutt5_10 ?? null,
      sgPutt10_15: input.sgPutt10_15 ?? null,
      sgPutt15_25: input.sgPutt15_25 ?? null,
      sgPutt25_40: input.sgPutt25_40 ?? null,
      sgPutt40plus: input.sgPutt40plus ?? null,
      notes: input.notes ?? null,
    },
    select: { id: true, sgTotal: true },
  });

  await triggerRoundAgent(user.id);

  revalidatePath("/portal/mal");
  revalidatePath("/portal/mal/runder");

  return { roundId: round.id, sgTotal: round.sgTotal };
}

/** Lagrer spillerens SG-diagnose som en prefiks i rundenes notes-felt. */
export async function lagreSgDiagnose(
  roundId: string,
  diagnose: "TEKNIKK" | "STRATEGI" | "MENTAL",
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const round = await prisma.round.findUnique({
    where: { id: roundId, userId: user.id },
    select: { id: true, notes: true },
  });
  if (!round) throw new Error("Runde ikke funnet.");

  const prefix = `[SG-DIAGNOSE: ${diagnose}]`;
  const nyNotes = round.notes ? `${prefix} ${round.notes}` : prefix;

  await prisma.round.update({
    where: { id: roundId },
    data: { notes: nyNotes },
  });

  revalidatePath("/portal/mal/runder");
}

export type ExportRoundsInput = {
  format: "csv" | "pdf";
  periode: "10" | "30d" | "90d" | "2026" | "custom";
  pdfStyle?: "compact" | "detail" | "stats";
  cols?: string[];
  fromDate?: string;
  toDate?: string;
};

/**
 * exportRounds — eksporterer runder til CSV eller PDF (stub).
 * I produksjon vil denne generere en fil og returnere en download-URL,
 * eller streame filen via en route handler. For nå logger den valget.
 */
export async function exportRounds(input: ExportRoundsInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  // Stub: kun for å bekrefte at server action er koblet.
  // Eksport-pipeline implementeres når PDF-renderer er på plass.
  await prisma.round.findMany({
    where: { userId: user.id },
    take: 1,
  });
  void input;
}

// ---------------------------------------------------------------------------
// GolfBox-import — preview + bekreft
// ---------------------------------------------------------------------------

/**
 * Hardkodet dummy-data for stub-implementasjonen. I produksjon vil dette
 * komme fra GolfBox API etter OAuth-flyt. Inneholder 8 runder; 2 av disse
 * markeres som duplikater hvis de matcher en eksisterende Round (dato +
 * score) for innlogget spiller.
 */
const DUMMY_GOLFBOX_ROUNDS = [
  {
    externalId: "gb-2026-05-12",
    playedAt: "2026-05-12",
    courseName: "Larvik GK",
    score: 68,
    par: 70,
    slope: 132,
    tee: "Gul",
  },
  {
    externalId: "gb-2026-05-04",
    playedAt: "2026-05-04",
    courseName: "Bossum Golfklubb",
    score: 72,
    par: 72,
    slope: 128,
    tee: "Gul",
  },
  {
    externalId: "gb-2026-04-27",
    playedAt: "2026-04-27",
    courseName: "Larvik GK",
    score: 71,
    par: 70,
    slope: 132,
    tee: "Gul",
  },
  {
    externalId: "gb-2026-04-20",
    playedAt: "2026-04-20",
    courseName: "Borre Golfklubb",
    score: 75,
    par: 71,
    slope: 124,
    tee: "Gul",
  },
  {
    externalId: "gb-2026-04-12",
    playedAt: "2026-04-12",
    courseName: "Onsøy Golfklubb",
    score: 70,
    par: 70,
    slope: 122,
    tee: "Gul",
  },
  {
    externalId: "gb-2026-03-30",
    playedAt: "2026-03-30",
    courseName: "Bossum Golfklubb",
    score: 73,
    par: 72,
    slope: 128,
    tee: "Hvit",
  },
  {
    externalId: "gb-2026-03-22",
    playedAt: "2026-03-22",
    courseName: "Hauger Golfklubb",
    score: 76,
    par: 71,
    slope: 130,
    tee: "Gul",
  },
  {
    externalId: "gb-2026-03-15",
    playedAt: "2026-03-15",
    courseName: "Larvik GK",
    score: 74,
    par: 70,
    slope: 132,
    tee: "Gul",
  },
];

export type GolfBoxPreviewRound = {
  externalId: string;
  playedAt: string; // ISO YYYY-MM-DD
  courseName: string;
  score: number;
  par: number;
  slope: number;
  tee: string;
  duplicate: boolean;
};

const PreviewInput = z.object({
  fromDate: z
    .string()
    .min(1)
    .refine((s) => !isNaN(Date.parse(s)), "Ugyldig fra-dato"),
  toDate: z
    .string()
    .min(1)
    .refine((s) => !isNaN(Date.parse(s)), "Ugyldig til-dato"),
});

const ImportInput = z.object({
  fromDate: z.string().min(1),
  toDate: z.string().min(1),
  roundIds: z.array(z.string().min(1)).min(1, "Velg minst én runde"),
});

export type PreviewGolfBoxInput = z.infer<typeof PreviewInput>;
export type ImportGolfBoxInput = z.infer<typeof ImportInput>;

/**
 * previewGolfBoxRounds — stub som returnerer hardkoded preview-liste.
 * Auto-detekterer duplikater ved å sjekke om spilleren allerede har en runde
 * på samme dato med samme score.
 */
export async function previewGolfBoxRounds(
  input: unknown,
): Promise<{ rounds: GolfBoxPreviewRound[]; range: { from: string; to: string } }> {
  const user = await requirePortalUser();
  const parsed = PreviewInput.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues.map((i) => i.message).join(" · ") ||
        "Ugyldig dato-range",
    );
  }
  const { fromDate, toDate } = parsed.data;

  const from = new Date(fromDate);
  const to = new Date(toDate);

  // Filtrer dummy-data etter range.
  const iRange = DUMMY_GOLFBOX_ROUNDS.filter((r) => {
    const d = new Date(r.playedAt);
    return d >= from && d <= to;
  });

  // Hent eksisterende runder for å markere duplikater.
  const existing = await prisma.round.findMany({
    where: {
      userId: user.id,
      playedAt: { gte: from, lte: to },
    },
    select: { playedAt: true, score: true },
  });

  const existingKeys = new Set(
    existing.map((r) => `${r.playedAt.toISOString().slice(0, 10)}|${r.score}`),
  );

  const rounds: GolfBoxPreviewRound[] = iRange.map((r) => ({
    ...r,
    duplicate: existingKeys.has(`${r.playedAt}|${r.score}`),
  }));

  return {
    rounds,
    range: { from: fromDate, to: toDate },
  };
}

/**
 * importFromGolfBox — importerer valgte runder fra GolfBox-preview-listen.
 * Stub: matcher mot DUMMY_GOLFBOX_ROUNDS, oppretter (eller henter)
 * CourseDefinition på navn, og oppretter Round-rader. Hopper over duplikater.
 */
export async function importFromGolfBox(
  input: unknown,
): Promise<{ imported: number; skipped: number }> {
  const user = await requirePortalUser();
  const parsed = ImportInput.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues.map((i) => i.message).join(" · ") || "Ugyldig input",
    );
  }

  const valgte = DUMMY_GOLFBOX_ROUNDS.filter((r) =>
    parsed.data.roundIds.includes(r.externalId),
  );

  let imported = 0;
  let skipped = 0;

  for (const r of valgte) {
    // Sjekk duplikat på dato + score.
    const playedAt = new Date(r.playedAt);
    const dup = await prisma.round.findFirst({
      where: {
        userId: user.id,
        playedAt,
        score: r.score,
      },
      select: { id: true },
    });
    if (dup) {
      skipped += 1;
      continue;
    }

    // Finn eller opprett bane.
    let course = await prisma.courseDefinition.findFirst({
      where: { name: r.courseName },
      select: { id: true },
    });
    if (!course) {
      course = await prisma.courseDefinition.create({
        data: {
          name: r.courseName,
          par: r.par,
          slope: r.slope,
        },
        select: { id: true },
      });
    }

    await prisma.round.create({
      data: {
        userId: user.id,
        courseId: course.id,
        playedAt,
        score: r.score,
        notes: `Importert fra GolfBox (${r.tee} tee, slope ${r.slope})`,
      },
    });
    imported += 1;
  }

  await triggerRoundAgent(user.id);
  revalidatePath("/portal/mal");
  revalidatePath("/portal/mal/runder");

  return { imported, skipped };
}

export async function deleteRound(roundId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const round = await prisma.round.findUnique({ where: { id: roundId } });
  if (!round || round.userId !== user.id) throw new Error("forbidden");

  await prisma.round.delete({ where: { id: roundId } });
  revalidatePath("/portal/mal");
  revalidatePath("/portal/mal/runder");
}
