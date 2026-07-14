/**
 * AgencyOS — Talent · WAGR-import (`/admin/talent/wagr-import`), v2.
 * Port av `(legacy)/talent/wagr-import/page.tsx` (2026-07-14, AgencyOS
 * Bølge 3.24) — samme `WagrSnapshot`-datamodell. `(legacy)/talent/
 * wagr-import/actions.ts` bor fortsatt der — delt `synkWagrNaa`/
 * `slettWagrSnapshot`-server actions, uendret.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminWagrImportV2, type WagrKobletV2 } from "@/components/admin/v2/AdminWagrImportV2";

export const dynamic = "force-dynamic";

function fmtSynket(d: Date): string {
  const dato = d.toLocaleDateString("nb-NO", { day: "numeric", month: "long" });
  const tid = d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  return `${dato} ${tid}`;
}

export default async function WagrImportPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [snapshots, antallSpillere] = await Promise.all([
    prisma.wagrSnapshot.findMany({
      orderBy: { rank: "asc" },
      select: { id: true, rank: true, snapshotAt: true, fullName: true, user: { select: { id: true, name: true } } },
    }),
    prisma.user.count({ where: { role: "PLAYER", deletedAt: null } }),
  ]);

  const koblede: WagrKobletV2[] = snapshots.flatMap((s) =>
    s.user ? [{ id: s.id, rank: s.rank, userId: s.user.id, userName: s.user.name }] : [],
  );
  const sistSynket = snapshots.length
    ? snapshots.reduce((maks, s) => (s.snapshotAt > maks ? s.snapshotAt : maks), snapshots[0].snapshotAt)
    : null;

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminWagrImportV2 koblede={koblede} antallSpillere={antallSpillere} sistSynketTekst={sistSynket ? fmtSynket(sistSynket) : null} />
    </V2Shell>
  );
}
