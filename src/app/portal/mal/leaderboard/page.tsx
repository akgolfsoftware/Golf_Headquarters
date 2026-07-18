/**
 * PlayerHQ · Mål · Leaderboard (/portal/mal/leaderboard) — v2.
 * v2-port 16. juli 2026: `LeaderboardV2` erstatter wireframe-designet, ruten
 * flyttet ut av (legacy). Feature-gate (FEATURES.LEADERBOARD), auth-guard,
 * Prisma-queries og rangeringslogikken (snitt-SG per felt siste 30 dager,
 * topp 25) er uendret. Delta-rang/badges er fortsatt ikke bygget (TODO i
 * original) — v2 viser dem ikke i stedet for å vise plassholdere.
 */

import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { FEATURES } from "@/lib/features";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  LeaderboardV2,
  type LeaderboardRad,
  type LeaderboardTab,
  type LeaderboardSgTab,
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

  // Velg riktig SG-felt basert på aktiv kategori-tab
  const sgField =
    sgTab === "approach"
      ? "sgApp"
      : sgTab === "short-game"
        ? "sgArg"
        : sgTab === "putting"
          ? "sgPutt"
          : "sgTotal";

  const proBrukere = await prisma.user.findMany({
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
      trainingPlans: {
        select: {
          sessions: {
            where: { scheduledAt: { gte: tretti } },
            select: { id: true },
          },
        },
      },
    },
  });

  const rangering: LeaderboardRad[] = proBrukere
    .map((b) => {
      const sessionCount = b.trainingPlans.reduce(
        (acc, p) => acc + p.sessions.length,
        0,
      );
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
        navn: b.name,
        sub: `${b.homeClub ?? "—"} · Pro`,
        hcp:
          b.hcp != null
            ? (b.hcp >= 0 ? "+" : "") + b.hcp.toFixed(1).replace(".", ",")
            : "—",
        sg,
        runder: sessionCount,
        meg: b.id === user.id,
      };
    })
    .filter((r) => r.sg != null)
    .sort((a, b) => (b.sg ?? -99) - (a.sg ?? -99))
    .slice(0, 25)
    .map((r, i) => ({
      ...r,
      rank: i + 1,
      medalje:
        i === 0
          ? ("gull" as const)
          : i === 1
            ? ("solv" as const)
            : i === 2
              ? ("bronse" as const)
              : undefined,
    }));

  const meg = rangering.find((r) => r.meg) ?? null;
  const fornavn = user.name.split(" ")[0];

  return (
    <V2Shell aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/mal">Mål</TilbakeLenke>
      <LeaderboardV2
        data={{
          fornavn,
          minRank: meg?.rank ?? null,
          total: rangering.length,
          tab,
          sgTab,
          rader: rangering,
          meg,
        }}
      />
    </V2Shell>
  );
}
