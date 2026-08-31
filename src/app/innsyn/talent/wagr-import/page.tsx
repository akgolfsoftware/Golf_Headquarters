/**
 * AgencyOS — Talent · WAGR-import (TALENT · WAGR-IMPORT). v2-port 16. juli 2026.
 *
 * Datakilde: WagrSnapshot (matchede spillere = snapshot med userId-kobling) +
 * antall PLAYER-brukere for stallen. «Sist synket» = nyeste snapshotAt.
 * Ingen oppdiktede tall — tomme tilstander vises ærlig.
 *
 * «Synk nå» trigger wagr-sync-agenten (src/lib/agents/wagr-sync.ts) via
 * synkWagrNaa i ./actions.ts: henter ferske rankinger fra wagr.com for alle
 * ekte slugs (godkjent av Anders 2026-07-12) og kobler umatchede snapshots
 * til spillere på navn. Manuell import via importerWagrSpiller består for
 * å legge til NYE spillere.
 *
 * Bevisst avvik fra fasit (rapportert i porting-retur):
 *  - Fasit har én rad «Trenger bekreftelse»; WagrSnapshot mangler felt for
 *    match-konfidens, så alle koblede rader vises som «Sikker match».
 *
 * Roller: COACH, ADMIN.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminWagrImportV2, type AdminWagrImportV2Data } from "@/components/admin/v2/AdminWagrImportV2";

export const dynamic = "force-dynamic";

function fmtSynket(d: Date): string {
  const dato = d.toLocaleDateString("nb-NO", { day: "numeric", month: "long" });
  const tid = d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  return `${dato} ${tid}`;
}

export default async function WagrImportPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [snapshots, antallSpillere] = await Promise.all([
    prisma.wagrSnapshot.findMany({
      orderBy: { rank: "asc" },
      select: {
        id: true,
        rank: true,
        snapshotAt: true,
        fullName: true,
        user: { select: { id: true, name: true } },
      },
    }),
    prisma.user.count({ where: { role: "PLAYER", deletedAt: null } }),
  ]);

  const koblede = snapshots.flatMap((s) => (s.user ? [{ id: s.id, rank: s.rank, user: s.user }] : []));
  const sistSynket = snapshots.length
    ? snapshots.reduce((maks, s) => (s.snapshotAt > maks ? s.snapshotAt : maks), snapshots[0].snapshotAt)
    : null;

  const data: AdminWagrImportV2Data = {
    koblede: koblede.map((s) => ({ id: s.id, spillerId: s.user.id, navn: s.user.name, rank: s.rank })),
    antallSpillere,
    sistSynketLabel: sistSynket ? fmtSynket(sistSynket) : null,
  };

  return <AdminWagrImportV2 data={data} />;
}
