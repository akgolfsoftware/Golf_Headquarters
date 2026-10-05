// PH19Leaderboard — Precision Athletics.
/**
 * PlayerHQ · Mål · Leaderboard (/portal/mal/leaderboard) i Precision Athletics.
 * Kilde: Claude Design arkiv/2026-09-30/playerhq/screens/PH-19.jsx
 *
 * Feature-gate (FEATURES.LEADERBOARD), auth-guard, Prisma-queries og
 * rangeringslogikken (snitt-SG per felt siste 30 dager) er uendret.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { FEATURES } from "@/lib/features";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH19Leaderboard } from "@/components/portal/precision/PH19Leaderboard";
import type {
  LeaderboardRad,
  LeaderboardTab,
  LeaderboardSgTab,
  LeaderboardV2Data,
} from "@/components/portal/v2/LeaderboardV2";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; sg?: string }>;
}) {
  if (!FEATURES.LEADERBOARD) notFound();

  const user = await requirePortalUser();
  const sp = await searchParams;
  const tab: LeaderboardTab =
    sp?.tab === "venner" || sp?.tab === "globalt" ? sp.tab : "klubb";
  const sgTab: LeaderboardSgTab =
    sp?.sg === "approach"
      ? "approach"
      : sp?.sg === "short-game"
        ? "short-game"
        : sp?.sg === "putting"
          ? "putting"
          : "totalt";

  const tretti = new Date();
  tretti.setDate(tretti.getDate() - 30);

  const sgField =
    sgTab === "approach"
      ? "sgApp"
      : sgTab === "short-game"
        ? "sgArg"
        : sgTab === "putting"
          ? "sgPutt"
          : "sgTotal";

  const [proBrukere, uleste] = await Promise.all([
    prisma.user.findMany({
      where: { tier: "PRO", role: "PLAYER" },
      select: {
        id: true,
        name: true,
        hcp: true,
        homeClub: true,
        rounds: {
          where: {
            playedAt: { gte: tretti },
            [sgField]: { not: null },
          },
          select: { sgTotal: true, sgApp: true, sgArg: true, sgPutt: true },
        },
      },
    }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);

  const rangering: LeaderboardRad[] = proBrukere
    .map((b) => {
      const sgVerdier = b.rounds
        .map((r) => {
          if (sgTab === "approach") return r.sgApp;
          if (sgTab === "short-game") return r.sgArg;
          if (sgTab === "putting") return r.sgPutt;
          return r.sgTotal;
        })
        .filter((v): v is number => typeof v === "number");
      const sg =
        sgVerdier.length > 0
          ? sgVerdier.reduce((s, v) => s + v, 0) / sgVerdier.length
          : null;
      return {
        id: b.id,
        rank: 0,
        navn: b.name ?? "Spiller",
        sub: b.homeClub ?? "AK Golf",
        hcp: b.hcp != null ? b.hcp.toFixed(1) : "—",
        sg,
        runder: b.rounds.length,
        meg: b.id === user.id,
      };
    })
    .filter((r) => r.runder > 0)
    .sort((a, b) => (b.sg ?? -99) - (a.sg ?? -99))
    .slice(0, 25)
    .map((r, i) => ({
      ...r,
      rank: i + 1,
      medalje:
        i === 0 ? ("gull" as const) : i === 1 ? ("solv" as const) : i === 2 ? ("bronse" as const) : undefined,
    }));

  const minRad = rangering.find((r) => r.meg) ?? null;
  const fornavn = user.name?.split(" ")[0] ?? "deg";

  const data: LeaderboardV2Data = {
    fornavn,
    minRank: minRad?.rank ?? null,
    total: proBrukere.length,
    tab,
    sgTab,
    rader: rangering,
    meg: minRad,
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH19Leaderboard data={data} />
    </PlayerHQSkall>
  );
}
