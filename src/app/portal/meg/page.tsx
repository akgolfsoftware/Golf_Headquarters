/**
 * /portal/meg — PlayerHQ "Meg" (hybrid design).
 *
 * Server component som henter profildata, streak og runde-antall via Prisma,
 * og rendrer MegHybrid med ekte data. Lagring av varsler går via server actions.
 */

import { MegHybrid } from "./meg-hybrid";
import { hentProfil, oppdaterPreferences, logout } from "./actions";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { aktivStreak, computeStreak } from "@/lib/streak";

export const dynamic = "force-dynamic";

function initialer(navn: string): string {
  const deler = navn.trim().split(/\s+/).filter(Boolean);
  if (deler.length === 0) return "—";
  if (deler.length === 1) return deler[0].slice(0, 2).toUpperCase();
  return (deler[0][0] + deler[deler.length - 1][0]).toUpperCase();
}

export default async function MegPage() {
  const [data, user] = await Promise.all([
    hentProfil(),
    getCurrentUser(),
  ]);

  let streakDager = 0;
  let antallRunder = 0;

  if (user) {
    // Hent streak fra trenings-logger (siste 30 dager)
    const tredveDAgerSiden = new Date();
    tredveDAgerSiden.setDate(tredveDAgerSiden.getDate() - 30);
    const loggDates = await prisma.trainingPlanSessionLog
      .findMany({
        where: {
          session: { plan: { userId: user.id } },
          startedAt: {
            gte: tredveDAgerSiden,
          },
        },
        select: { startedAt: true },
      })
      .then((rows) => rows.map((r) => r.startedAt))
      .catch(() => [] as Date[]);

    const streakArr = computeStreak(loggDates, 30);
    streakDager = aktivStreak(streakArr);

    // Hent totalt antall runder
    antallRunder = await prisma.round
      .count({ where: { userId: user.id } })
      .catch(() => 0);
  }

  return (
    <MegHybrid
      name={data.user.name}
      initials={initialer(data.user.name)}
      avatarUrl={data.user.avatarUrl}
      hcp={data.user.hcp}
      homeClub={data.user.homeClub}
      tier={user?.tier ?? "GRATIS"}
      streakDager={streakDager}
      antallRunder={antallRunder}
      preferences={data.preferences}
      onUpdatePreferences={oppdaterPreferences}
      onLogout={logout}
    />
  );
}
