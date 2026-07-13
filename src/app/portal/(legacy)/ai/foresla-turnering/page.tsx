/**
 * /portal/ai/foresla-turnering — AI foreslår turneringer basert på ekte data:
 * spillerens kommende påmeldinger + katalogen av kommende turneringer. Status
 * og begrunnelse speiler faktisk påmeldingsstatus og tier — ingen oppdiktede
 * sannsynligheter.
 */

import { dagensStartUTC } from "@/lib/dato";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  ForeslaTurneringScreen,
  type TournamentSuggestion,
} from "@/components/portal/ai/foresla-turnering-screen";

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
      where: { startDate: { gte: dagensStartUTC(now) } },
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

  return (
    <ForeslaTurneringScreen
      playerFirstName={(user.name ?? "deg").split(" ")[0]}
      hcpLabel={hcpLabel}
      catalogCount={catalog.length}
      suggestions={suggestions.slice(0, 6)}
    />
  );
}
