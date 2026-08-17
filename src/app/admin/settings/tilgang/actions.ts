"use server";

/**
 * G6 — per-trener capability-styring. ADMIN setter GRANT/REVOKE-overrides
 * per coach oppå rolle-defaulten i cbac.ts. Matcher ønsket tilstand
 * defaulten, slettes overriden (ingen død rad). ADMIN er immun mot
 * overrides (effective-capabilities.ts) — denne actionen tar derfor kun
 * COACH-brukere som mål.
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdminActionUser } from "@/lib/auth/action-guards";
import { Capability, ROLE_CAPABILITIES } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

const CAPABILITY_VERDIER = Object.values(Capability) as [
  Capability,
  ...Capability[],
];

const SettOverrideSchema = z.object({
  coachId: z.string().min(1),
  capability: z.enum(CAPABILITY_VERDIER),
  /** Ønsket effektiv tilstand for treneren (det bryteren viser). */
  aktivert: z.boolean(),
});

export type SettOverrideResult =
  | { ok: true; override: "GRANT" | "REVOKE" | null }
  | { ok: false; error: string };

export async function settCapabilityOverride(
  input: unknown,
): Promise<SettOverrideResult> {
  let admin;
  try {
    admin = await requireAdminActionUser();
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "forbidden",
    };
  }

  const parsed = SettOverrideSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig input" };
  const { coachId, capability, aktivert } = parsed.data;

  const coach = await prisma.user.findFirst({
    where: { id: coachId, role: "COACH", deletedAt: null },
    select: { id: true, name: true },
  });
  if (!coach) return { ok: false, error: "Fant ikke treneren." };

  const iDefault = ROLE_CAPABILITIES.COACH.includes(capability);
  let override: "GRANT" | "REVOKE" | null;

  if (aktivert === iDefault) {
    // Ønsket tilstand = rolle-default → fjern ev. override.
    await prisma.userCapability.deleteMany({
      where: { userId: coachId, capability },
    });
    override = null;
  } else {
    override = aktivert ? "GRANT" : "REVOKE";
    await prisma.userCapability.upsert({
      where: { userId_capability: { userId: coachId, capability } },
      create: {
        userId: coachId,
        capability,
        mode: override,
        grantedById: admin.id,
      },
      update: { mode: override, grantedById: admin.id },
    });
  }

  await audit({
    actorId: admin.id,
    action: "user.capability_override",
    target: `User:${coachId}`,
    metadata: { capability, override, coachNavn: coach.name },
  });

  revalidatePath("/admin/settings/tilgang");
  return { ok: true, override };
}
