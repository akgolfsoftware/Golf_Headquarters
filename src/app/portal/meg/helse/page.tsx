/**
 * v2 — PlayerHQ Meg · Helse (retning C). V2Shell leverer chrome-en
 * (IkonRail/BunnNav), MegHelseV2 rendrer stacken.
 *
 * Auth + dataloader er 1:1 med den tidligere /portal/meg/helse-siden: siste 14
 * dagers HealthEntry, aktiv/tidligere Leave (isInjury), FYS-score og belastning.
 * Datoer formateres her (nb-NO) så klientkomponenten forblir serialiserbar.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { hentFysScore } from "@/lib/fys-data";
import { hentBelastning } from "@/lib/health/belastning";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { MegHelseV2, type MegHelseData } from "@/components/portal/v2/MegHelseV2";
import { lagreHelseEntry } from "./actions";

export const dynamic = "force-dynamic";

function formatDatoKort(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

export default async function HelsePage() {
  const user = await requirePortalUser();

  // Siste 14 dagers logg, nyest først (identisk med tidligere /portal/meg/helse).
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - 13);

  const now = new Date();
  const [entries, aktivSkade, tidligereSkader, fys, belastning] = await Promise.all([
    prisma.healthEntry.findMany({
      where: { userId: user.id, date: { gte: since } },
      orderBy: { date: "desc" },
    }),
    prisma.leave.findFirst({
      where: {
        userId: user.id,
        isInjury: true,
        returnedAt: null,
        OR: [{ endAt: null }, { endAt: { gte: now } }],
      },
      orderBy: { startAt: "desc" },
    }),
    prisma.leave.count({
      where: {
        userId: user.id,
        isInjury: true,
        OR: [{ returnedAt: { not: null } }, { endAt: { lt: now } }],
      },
    }),
    hentFysScore(user.id),
    hentBelastning(user.id),
  ]);

  const siste = entries[0];
  const iDagIso = new Date().toISOString().slice(0, 10);

  // Ekte søvn-snitt siste 7 døgn (kun logger med sleepHours).
  const ukeGrense = new Date();
  ukeGrense.setUTCHours(0, 0, 0, 0);
  ukeGrense.setUTCDate(ukeGrense.getUTCDate() - 6);
  const sovnUke = entries.filter(
    (e): e is typeof e & { sleepHours: number } =>
      e.sleepHours !== null && e.date >= ukeGrense,
  );
  const sovnSnitt =
    sovnUke.length > 0
      ? sovnUke.reduce((sum, e) => sum + e.sleepHours, 0) / sovnUke.length
      : null;

  const data: MegHelseData = {
    fys: { harTester: fys.harTester, score: fys.score, antallTester: fys.antallTester },
    siste: siste
      ? { restingHr: siste.restingHr, hrv: siste.hrv, sleepHours: siste.sleepHours }
      : null,
    sovn: { snitt: sovnSnitt, antall: sovnUke.length },
    belastning: { harData: belastning.harData, prosentAvNormalt: belastning.prosentAvNormalt },
    skade: {
      aktivSiden: aktivSkade ? formatDatoKort(aktivSkade.startAt) : null,
      tidligere: tidligereSkader,
      sistLogget: siste ? formatDatoKort(siste.date) : null,
    },
    initial: {
      date: iDagIso,
      restingHr: siste?.restingHr ?? null,
      hrv: siste?.hrv ?? null,
      sleepHours: siste?.sleepHours ?? null,
      weightKg: siste?.weightKg ?? null,
      notes: siste?.notes ?? null,
    },
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name ?? undefined} avatarUrl={user.avatarUrl}>
      <MegHelseV2 data={data} lagre={lagreHelseEntry} />
    </V2Shell>
  );
}
