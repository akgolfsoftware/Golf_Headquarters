"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

// ISO date-streng (YYYY-MM-DD). Lagres i Postgres som DATE (uten klokkeslett).
const InputSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Dato må være på formatet ÅÅÅÅ-MM-DD"),
  restingHr: z.number().int().min(20).max(220).nullable().optional(),
  sleepHours: z.number().min(0).max(24).nullable().optional(),
  weightKg: z.number().min(20).max(300).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export type HelseInput = z.infer<typeof InputSchema>;

export async function lagreHelseEntry(input: HelseInput) {
  const user = await requirePortalUser();
  const parsed = InputSchema.parse(input);

  // Postgres DATE — bruk midnight UTC for å unngå tz-drift.
  const dateValue = new Date(`${parsed.date}T00:00:00.000Z`);

  await prisma.healthEntry.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date: dateValue,
      },
    },
    create: {
      userId: user.id,
      date: dateValue,
      restingHr: parsed.restingHr ?? null,
      sleepHours: parsed.sleepHours ?? null,
      weightKg: parsed.weightKg ?? null,
      notes: parsed.notes ?? null,
    },
    update: {
      restingHr: parsed.restingHr ?? null,
      sleepHours: parsed.sleepHours ?? null,
      weightKg: parsed.weightKg ?? null,
      notes: parsed.notes ?? null,
    },
  });

  revalidatePath("/portal/meg/helse");
}
