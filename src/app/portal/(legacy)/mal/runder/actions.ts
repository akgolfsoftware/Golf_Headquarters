"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { triggerRoundAgent } from "@/lib/agents/triggers";

// createRound (16-felts modal) og lagreSgDiagnose ble slettet 2026-07-10
// sammen med ny-runde-modal.tsx (eneste kaller). Kanon rundeflyt: hurtig
// skjema på /portal/mal/runder/ny + SlagWizard på /portal/mal/runder/[id]/slag.

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
  const user = await requireConsentingUser();
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
 * GolfBox-integrasjonen (OAuth/API) er IKKE aktivert ennå. Tom liste — aldri
 * falske runder. Når NGF GolfBox-integrasjonen er live, hentes ekte runder her.
 */
const DUMMY_GOLFBOX_ROUNDS: Array<{
  externalId: string;
  playedAt: string;
  courseName: string;
  score: number;
  par: number;
  slope: number;
  tee: string;
}> = [];

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
  const user = await requireConsentingUser();

  const round = await prisma.round.findUnique({ where: { id: roundId } });
  if (!round || round.userId !== user.id) throw new Error("forbidden");

  await prisma.round.delete({ where: { id: roundId } });
  revalidatePath("/portal/mal");
  revalidatePath("/portal/mal/runder");
}
