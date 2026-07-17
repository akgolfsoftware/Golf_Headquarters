"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { triggerTestAgent } from "@/lib/agents/triggers";

/**
 * Zod-schema for ny test. Resultatet-feltet er en åpen record fordi de
 * konkrete metrikkene varierer per testtype (CMJ vs. putting vs. sprint).
 */
const LogTestInput = z.object({
  testId: z.string().min(1),
  takenAt: z
    .string()
    .min(1)
    .refine((s) => !isNaN(Date.parse(s)), "Ugyldig dato")
    .refine(
      (s) => new Date(s).getTime() <= Date.now() + 1000 * 60 * 60 * 24,
      "Dato kan ikke være i fremtiden",
    ),
  location: z.string().min(1, "Lokasjon påkrevd").max(120),
  equipment: z.array(z.string().min(1).max(60)).max(20).default([]),
  preNotes: z.string().max(2000).optional().default(""),
  postNotes: z.string().max(2000).optional().default(""),
  shareWithCoach: z.boolean().default(true),
  // Per-metrikk resultater (key = metrikk-slug, value = tall i SI-enhet)
  results: z.record(z.string(), z.number().nonnegative()),
});

export type LogTestInput = z.infer<typeof LogTestInput>;

/**
 * logTest — oppretter en TestResult. Score beregnes fra `results` basert på
 * en enkel default-regel per testtype (snitt eller første metrikk). Resten
 * lagres i `details` som JSON, validert mot et åpent schema (record).
 */
export async function logTest(input: unknown) {
  const user = await requirePortalUser();
  const parsed = LogTestInput.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues.map((i) => i.message).join(" · ") ||
        "Ugyldige data",
    );
  }
  const data = parsed.data;

  const test = await prisma.testDefinition.findUnique({
    where: { id: data.testId },
    select: { id: true, name: true },
  });
  if (!test) throw new Error("Test ikke funnet");

  // Beregn score som hovedverdi for visning i listen.
  // Default: bruk første resultat-verdi. Klient kan overstyre via results._score.
  const explicitScore = data.results._score;
  const values = Object.entries(data.results).filter(([k]) => k !== "_score");
  const fallback = values.length > 0 ? values[0][1] : 0;
  const score = typeof explicitScore === "number" ? explicitScore : fallback;

  const details = {
    location: data.location,
    equipment: data.equipment,
    preNotes: data.preNotes,
    shareWithCoach: data.shareWithCoach,
    metrics: Object.fromEntries(values),
  };

  const created = await prisma.testResult.create({
    data: {
      userId: user.id,
      testId: data.testId,
      takenAt: new Date(data.takenAt),
      score,
      notes: data.postNotes || null,
      details,
    },
    select: { id: true, testId: true },
  });

  triggerTestAgent(user.id);

  revalidatePath("/portal/tren/tester");
  revalidatePath(`/portal/tren/tester/${created.testId}`);

  return { ok: true as const, resultId: created.id, testId: created.testId };
}
