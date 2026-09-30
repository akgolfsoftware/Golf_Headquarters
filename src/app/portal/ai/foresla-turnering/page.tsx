/**
 * /portal/ai/foresla-turnering — Caddie foreslår turneringer — Precision Athletics PH-22.
 * Visningen er PH22Turneringsforslag. Innlogging, Prisma-spørringer og
 * rangeringen (påmeldinger + katalog, ingen oppdiktede sannsynligheter) uendret.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import {
  PH22Turneringsforslag,
  type TurneringsForslag as TournamentSuggestion,
} from "@/components/portal/precision/PH22Turneringsforslag";

export const dynamic = "force-dynamic";

const TIER_BADGE: Record<number, string> = {
  1: "Major",
  2: "Tour",
  3: "Challenge",
  4: "Junior",
  5: "Lokal",
};

function dateParts(d: Date): { day: string; month: string } {
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: d.toLocaleDateString("nb-NO", { month: "short" }).replace(".", ""),
  };
}

export default async function ForeslaTurneringPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const now = new Date();

  const [entries, catalog] = await Promise.all([
    prisma.tournamentEntry.findMany({
      where: {
        userId: user.id,
        entryStatus: { not: "WITHDRAWN" },
        tournamentId: { not: null },
      },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            shortName: true,
            startDate: true,
            location: true,
            tier: true,
            purseUsd: true,
            status: true,
          },
        },
      },
    }),
    prisma.tournament.findMany({
      where: { startDate: { gte: now } },
      orderBy: { startDate: "asc" },
      select: {
        id: true,
        name: true,
        shortName: true,
        startDate: true,
        location: true,
        tier: true,
        purseUsd: true,
      },
      take: 30,
    }),
  ]);

  const enrolledIds = new Set(
    entries.map((e) => e.tournamentId).filter((id): id is string => !!id),
  );

  const ranked: (TournamentSuggestion & { _at: number })[] = [];

  // 1) Kommende turneringer spilleren allerede er påmeldt.
  for (const e of entries) {
    const t = e.tournament;
    if (!t || t.startDate < now) continue;
    const { day, month } = dateParts(t.startDate);
    ranked.push({
      _at: t.startDate.getTime(),
      id: t.id,
      href: `/portal/tren/turneringer/${t.id}`,
      day,
      month,
      badge: t.tier ? (TIER_BADGE[t.tier] ?? "Turnering") : "Turnering",
      statusLabel: "Allerede påmeldt",
      statusTone: "enrolled",
      name: t.shortName ?? t.name,
      venue: t.location,
      meta: t.purseUsd ? [`Pott ${Math.round(t.purseUsd / 1000)}k USD`] : [],
      why: "Du er påmeldt denne. Forbered deg i god tid — se bane og dato i detaljene.",
    });
  }

  // 2) Kommende katalog-turneringer spilleren ikke er påmeldt.
  for (const t of catalog) {
    if (enrolledIds.has(t.id)) continue;
    const { day, month } = dateParts(t.startDate);
    const isJunior = t.tier === 4;
    ranked.push({
      _at: t.startDate.getTime(),
      id: t.id,
      href: `/portal/tren/turneringer/${t.id}`,
      day,
      month,
      badge: t.tier ? (TIER_BADGE[t.tier] ?? "Turnering") : "Turnering",
      statusLabel: isJunior ? "Anbefalt" : "Vurder",
      statusTone: isJunior ? "recommended" : "stretch",
      name: t.shortName ?? t.name,
      venue: t.location,
      meta: t.purseUsd ? [`Pott ${Math.round(t.purseUsd / 1000)}k USD`] : [],
      why: isJunior
        ? "Junior-turnering i kalenderen — passer normalt nivået ditt. Vurder å melde deg på."
        : "Kommende turnering i katalogen. Sjekk påmeldingskrav i detaljene før du melder deg på.",
    });
  }

  // Sorter på dato (tidligst først) og begrens.
  ranked.sort((a, b) => a._at - b._at);
  const suggestions: TournamentSuggestion[] = ranked.map(({ _at, ...rest }) => {
    void _at;
    return rest;
  });

  const hcpLabel =
    user.hcp != null ? user.hcp.toLocaleString("nb-NO", { maximumFractionDigits: 1 }) : "—";

  const dash = await getUnreadNotifications(user.id, 1).catch(() => null);

  return (
    <PlayerHQSkall innboksHref="/portal/coach/melding" uleste={dash?.count ?? 0}>
      <PH22Turneringsforslag
        hcpLabel={hcpLabel}
        catalogCount={catalog.length}
        suggestions={suggestions.slice(0, 6)}
      />
    </PlayerHQSkall>
  );
}
