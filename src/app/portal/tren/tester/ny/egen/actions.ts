"use server";

/**
 * Server actions for å opprette egen-test (custom TestDefinition).
 * En spiller eller coach kan lage sin egen test og velge synlighet:
 *   PRIVATE — kun for skaperen
 *   COACH   — delt med min coach (kan godkjennes til ACADEMY)
 *   GROUP   — delt med min gruppe
 *   ACADEMY — delt med hele akademi
 *
 * Når en spiller velger COACH-synlighet havner testen i køen for
 * coach-godkjenning på /admin/tester/foreslatte.
 */
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

const protokollSchema = z
  .object({
    steg: z.array(z.string().min(1).max(300)).max(20).optional(),
    notater: z.string().max(2000).optional(),
    estMinutter: z.number().int().nonnegative().max(180).optional(),
    utstyr: z.array(z.string().min(1).max(60)).max(20).optional(),
  })
  .partial()
  .passthrough();

const malverdiSchema = z
  .object({
    enhet: z.enum(["sett", "tid_sek", "distanse_m", "score", "prosent", "antall"]),
    nivaaSystem: z.enum(["NGF_DG", "AKA_AB"]).default("NGF_DG"),
    nivaaer: z.record(z.string(), z.string().max(60)).default({}),
  })
  .strict();

const opprettCustomTestSchema = z.object({
  name: z.string().min(2, "Navn må være minst 2 tegn").max(100),
  description: z.string().max(2000).optional().nullable(),
  pyramidArea: z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]),
  protocol: protokollSchema,
  malverdi: malverdiSchema,
  scoringRule: z.string().min(2).max(200),
  visibility: z.enum(["PRIVATE", "COACH", "GROUP", "ACADEMY"]).default("PRIVATE"),
});

export type OpprettCustomTestInput = z.infer<typeof opprettCustomTestSchema>;

export async function opprettCustomTest(input: unknown) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const parsed = opprettCustomTestSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(" · ") ||
        "Ugyldige data",
    );
  }
  const data = parsed.data;

  // Spillere kan ikke direkte sette ACADEMY-synlighet — krever godkjenning.
  // COACH-rolle og ADMIN kan sette hva som helst.
  const visibility =
    user.role === "PLAYER" && data.visibility === "ACADEMY" ? "COACH" : data.visibility;

  // Coach som lager test får automatisk isCoachApproved = true (de kan
  // dele direkte med akademi uten å vente på godkjenning).
  const isCoachApproved =
    user.role === "COACH" || user.role === "ADMIN" ? true : false;

  // Bygger protocol-JSON-blob som inkluderer både selve protokoll-steg
  // og mål-verdi-strukturen for hvert NGF-nivå.
  const protocol = {
    ...data.protocol,
    malverdi: data.malverdi,
  };

  const test = await prisma.testDefinition.create({
    data: {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      pyramidArea: data.pyramidArea,
      protocol,
      scoringRule: data.scoringRule.trim(),
      createdById: user.id,
      isCustom: true,
      visibility,
      isCoachApproved,
      approvedAt: isCoachApproved ? new Date() : null,
    },
    select: { id: true, name: true },
  });

  await audit({
    actorId: user.id,
    action: "test.custom_created",
    target: `TestDefinition:${test.id}`,
    metadata: {
      name: test.name,
      visibility,
      isCoachApproved,
    },
  });

  revalidatePath("/portal/tren/tester");
  if (visibility === "COACH") {
    revalidatePath("/admin/tester/foreslatte");
  }

  return { ok: true as const, id: test.id, name: test.name };
}
