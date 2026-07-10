"use server";

/**
 * Server actions for "Ny turnering"-wizard.
 *
 * Tournament-modellen i Prisma har et minimalt feltsett (name, startDate, endDate,
 * courseId, format, notes). Resten av wizard-feltene (type, prio, max deltakere,
 * påmeldingsfrist, gebyr i øre, runder, HCP-justering, tee, cut, manuelt
 * banenavn) lagres som JSON-blob i notes-feltet — samme mønster som
 * /admin/tournaments/page.tsx allerede bruker via parseMeta().
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

const FORMATER = ["STROKE", "MATCH", "STABLEFORD", "SKINS", "FOURSOME"] as const;
const TYPER = ["INTERN", "EKSTERN"] as const;
const PRIORITETER = ["MAJOR", "NORMAL", "LOCAL"] as const;
const HCP_VALG = ["FULL", "P90", "P75", "SCRATCH"] as const;

export const ny_turnering_schema = z
  .object({
    type: z.enum(TYPER),
    name: z.string().trim().min(2, "Navn er for kort").max(140),
    startDate: z.string().min(1, "Startdato er påkrevd"),
    endDate: z.string().optional().nullable(),
    courseId: z.string().optional().nullable(),
    manualVenue: z.string().trim().max(200).optional().nullable(),
    rounds: z.coerce.number().int().min(1).max(8).default(2),
    description: z.string().trim().max(2000).optional().nullable(),
    format: z.enum(FORMATER),
    teeOptions: z.array(z.string().trim().max(40)).max(8).default([]),
    hcpAdjust: z.enum(HCP_VALG).default("FULL"),
    hasCut: z.coerce.boolean().default(false),
    registrationDeadline: z.string().optional().nullable(),
    maxParticipants: z.coerce.number().int().min(1).max(500).default(36),
    feeOre: z.coerce.number().int().min(0).max(10_000_000).default(0),
    priority: z.enum(PRIORITETER).default("NORMAL"),
    sendInvitations: z.coerce.boolean().default(true),
  })
  .superRefine((val, ctx) => {
    if (val.endDate && val.endDate < val.startDate) {
      ctx.addIssue({
        path: ["endDate"],
        code: z.ZodIssueCode.custom,
        message: "Sluttdato må være etter startdato",
      });
    }
    if (
      val.registrationDeadline &&
      val.registrationDeadline > val.startDate
    ) {
      ctx.addIssue({
        path: ["registrationDeadline"],
        code: z.ZodIssueCode.custom,
        message: "Påmeldingsfrist må være før startdato",
      });
    }
  });

export type NyTurneringInput = z.infer<typeof ny_turnering_schema>;

export type CreateTournamentResult =
  | { ok: true; tournamentId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

async function krevCoach() {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "COACH" && user.role !== "ADMIN")
    throw new Error("forbidden");
  return user;
}

export async function createTournament(
  raw: unknown,
): Promise<CreateTournamentResult> {
  const user = await krevCoach();
  const parsed = ny_turnering_schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Validering feilet", fieldErrors };
  }
  const v = parsed.data;

  // notes lagrer JSON-blob med ekstra metadata
  const meta = {
    type: v.type,
    priority: v.priority,
    rounds: v.rounds,
    teeOptions: v.teeOptions,
    hcpAdjust: v.hcpAdjust,
    hasCut: v.hasCut,
    registrationDeadline: v.registrationDeadline ?? null,
    maxParticipants: v.maxParticipants,
    feeOre: v.feeOre,
    manualVenue: v.manualVenue ?? null,
    description: v.description ?? null,
    sendInvitations: v.sendInvitations,
    createdVia: "wizard",
  };

  const ny = await prisma.tournament.create({
    data: {
      name: v.name,
      startDate: new Date(v.startDate),
      endDate: v.endDate ? new Date(v.endDate) : null,
      courseId: v.courseId || null,
      format: v.format,
      notes: JSON.stringify(meta),
    },
  });

  await audit({
    actorId: user.id,
    action: "tournament.created",
    target: `Tournament:${ny.id}`,
    metadata: { name: ny.name, type: v.type, format: v.format },
  });

  revalidatePath("/admin/tournaments");
  return { ok: true, tournamentId: ny.id };
}
