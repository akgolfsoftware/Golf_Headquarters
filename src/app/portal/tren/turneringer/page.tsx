/**
 * v2-forhåndsvisning — PlayerHQ Turneringer (retning C). Egen top-level route-
 * group (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell leverer
 * chrome-en (IkonRail/BunnNav), TurneringerV2 rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbrukt 1:1 fra den ekte siden
 * (src/app/portal/tren/turneringer/page.tsx).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TurneringerV2 } from "@/components/portal/v2/TurneringerV2";

export const dynamic = "force-dynamic";

const MND = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

export default async function V2TurneringerPreviewPage() {
  const user = await requirePortalUser();
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const aar = new Date().getFullYear();

  const entries = await prisma.tournamentEntry.findMany({
    where: { userId: user.id, entryStatus: { in: ["PLANNED", "CONFIRMED"] } },
    include: { tournament: { select: { name: true, startDate: true, location: true } } },
    orderBy: [{ tournament: { startDate: "asc" } }, { manualDate: "asc" }],
    take: 30,
  });

  const rader = entries
    .map((e) => {
      const dato = e.tournament?.startDate ?? e.manualDate ?? null;
      return {
        id: e.id,
        navn: e.tournament?.name ?? e.manualName ?? "Turnering",
        dato: dato ? `${dato.getDate()}. ${MND[dato.getMonth()]}` : "—",
        kategori: e.category ?? e.tournament?.location ?? "Turnering",
        bekreftet: e.entryStatus === "CONFIRMED",
      };
    })
    .filter((r) => r.dato !== "—");

  return (
    <V2Shell aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TurneringerV2 data={{ rader, aar }} />
    </V2Shell>
  );
}
