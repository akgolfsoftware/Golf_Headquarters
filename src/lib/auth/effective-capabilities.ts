// Effektive capabilities per bruker (G6): rolle-default fra cbac.ts ±
// GRANT/REVOKE-overrides fra user_capabilities. ADMIN er immun — overrides
// leses aldri, så en feilskrevet REVOKE kan aldri låse Anders ute.
//
// Ren beregning bor i effective-capabilities-core.ts (enhetstestet).

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/generated/prisma/client";
import { ROLE_CAPABILITIES, type Capability } from "./cbac";
import { beregnEffektive } from "./effective-capabilities-core";

type CapabilityUser = { id: string; role: UserRole };

// React cache: én DB-lesing per bruker per request, uansett hvor mange
// guards/sider som spør i samme render.
const lesOverrides = cache(async (userId: string) => {
  try {
    return await prisma.userCapability.findMany({
      where: { userId },
      select: { capability: true, mode: true },
    });
  } catch (error) {
    // Fail-safe: kan ikke overrides leses (f.eks. user_capabilities-tabellen
    // finnes ennå ikke — DDL-scriptet kjøres ETTER deploy), gjelder ren
    // rolle-default — identisk med oppførselen før G6. En GRANT gir da ingen
    // ekstra tilgang (trygt), en REVOKE håndheves ikke før DB-en svarer igjen.
    console.error("effective-capabilities: klarte ikke lese overrides", error);
    return [];
  }
});

/** Rolle-default ± per-bruker-overrides. ADMIN: alltid alt (immun). */
export async function effectiveCapabilities(
  user: CapabilityUser,
): Promise<Set<Capability>> {
  if (user.role === "ADMIN") {
    return beregnEffektive(ROLE_CAPABILITIES.ADMIN, [], { immun: true });
  }
  const overrides = await lesOverrides(user.id);
  return beregnEffektive(ROLE_CAPABILITIES[user.role], overrides);
}

/** Async motstykke til can(role, cap) — med per-bruker-overrides. */
export async function canUser(
  user: CapabilityUser,
  capability: Capability,
): Promise<boolean> {
  const caps = await effectiveCapabilities(user);
  return caps.has(capability);
}

/**
 * Action-guard: kaster "forbidden" hvis brukeren mangler capability.
 * Brukes ETTER en rolle-guard (requireCoachActionUser/requirePortalUser) —
 * samme feilspråk som action-guards-assert.ts.
 */
export async function assertCapability(
  user: CapabilityUser,
  capability: Capability,
): Promise<void> {
  if (!(await canUser(user, capability))) {
    throw new Error("forbidden");
  }
}
