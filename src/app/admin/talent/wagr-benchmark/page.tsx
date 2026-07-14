/**
 * AgencyOS — Talent · WAGR-benchmark (`/admin/talent/wagr-benchmark`), v2.
 * Port av `(legacy)/talent/wagr-benchmark/page.tsx` (2026-07-14, AgencyOS
 * Bølge 3.23) — samme `WagrSnapshot`-datamodell. `slettWagrSnapshot`
 * (delt server action fra `(legacy)/talent/wagr-import/actions.ts`) uendret.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminWagrBenchmarkV2 } from "@/components/admin/v2/AdminWagrBenchmarkV2";
import { slettWagrSnapshot } from "@/app/admin/(legacy)/talent/wagr-import/actions";

function getIsoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export default async function WagrBenchmarkPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [globale, norske] = await Promise.all([
    prisma.wagrSnapshot.findMany({ where: { country: { not: "no" } }, orderBy: { rank: "asc" }, take: 5 }),
    prisma.wagrSnapshot.findMany({ where: { country: "no" }, orderBy: { rank: "asc" }, take: 5 }),
  ]);

  const snapshotDato = globale[0]?.snapshotAt ?? new Date();

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminWagrBenchmarkV2
        globale={globale}
        norske={norske}
        snapshotDatoTekst="12. mai 2026 (uke 18)"
        snapshotUke={{ uke: getIsoWeek(snapshotDato), aar: snapshotDato.getFullYear() }}
        slettWagrSnapshot={slettWagrSnapshot}
      />
    </V2Shell>
  );
}
