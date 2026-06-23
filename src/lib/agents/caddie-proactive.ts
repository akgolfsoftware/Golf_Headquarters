/**
 * Proaktiv Caddie-agent (Fase 3).
 *
 * Skanner etter inaktive spillere (gjenbruker identifiserInaktiveSpillere) og
 * lager et CaddieDraft-forslag per spiller — Anders' personlige co-agent som
 * jobber uoppfordret. Forslagene vises i Caddie-dashbordet (Proaktive forslag)
 * der Anders kan åpne dem i samtale eller avvise.
 *
 * Idempotent: hopper over spillere som allerede har et PENDING forslag.
 * Kjøres via cron (caddie-proactive) eller manuelt fra /admin/agents.
 * Caddie er ADMIN-only → forslag eies av ADMIN-brukeren, ikke spilleren
 * (ingen spiller-vendt varsling).
 */

import { prisma } from "@/lib/prisma";
import { identifiserInaktiveSpillere } from "@/lib/ai/agents/vinn-tilbake";

export type CaddieProactiveResult = {
  ok: boolean;
  reason?: string;
  inaktive?: number;
  created?: number;
  skipped?: number;
};

export async function runCaddieProactive(): Promise<CaddieProactiveResult> {
  // Caddie er Anders' personlige agent — finn ADMIN-brukeren.
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN", deletedAt: null },
    select: { id: true },
  });
  if (!admin) return { ok: false, reason: "ingen ADMIN-bruker" };

  const inaktive = await identifiserInaktiveSpillere(admin.id);

  // Idempotens: hvilke spillere har allerede et åpent forslag?
  const apneForslag = await prisma.caddieDraft.findMany({
    where: { userId: admin.id, status: "PENDING", toolName: "reengageInactivePlayer" },
    select: { toolInput: true },
  });
  const alleredeForeslatt = new Set(
    apneForslag
      .map((d) => (d.toolInput as { spillerId?: string } | null)?.spillerId)
      .filter((id): id is string => Boolean(id)),
  );

  let created = 0;
  let skipped = 0;
  for (const sp of inaktive) {
    if (alleredeForeslatt.has(sp.spillerId)) {
      skipped++;
      continue;
    }
    await prisma.caddieDraft.create({
      data: {
        userId: admin.id,
        conversationId: "proactive",
        toolCallId: `proactive_${sp.spillerId}`,
        toolName: "reengageInactivePlayer",
        toolInput: {
          spillerId: sp.spillerId,
          spillerName: sp.spillerName,
          dagerInaktiv: sp.dagerInaktiv,
          foreslattMelding: sp.foreslattMelding,
        },
        previewText: `${sp.spillerName} har ikke vært aktiv på ${sp.dagerInaktiv} dager — send oppfølging?`,
        status: "PENDING",
      },
    });
    created++;
  }

  return { ok: true, inaktive: inaktive.length, created, skipped };
}
