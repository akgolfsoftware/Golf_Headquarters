/**
 * AgencyOS — TrackMan-oversikt (`/admin/trackman`), v2.
 * Port av `(legacy)/trackman/page.tsx` (2026-07-14, AgencyOS Bølge 3.7) —
 * samme `TrackManSession`-datamodell, ny v2-presentasjon i `AdminTrackmanV2`.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminTrackmanV2, type AdminTrackmanV2Rad } from "@/components/admin/v2/AdminTrackmanV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "TrackMan · AgencyOS (v2)" };

const ENV_LABEL: Record<string, string> = {
  SIMULATOR_INDOOR: "Simulator inne",
  NET_INDOOR: "Nett inne",
  RANGE_OUTDOOR_MAT: "Range matte",
  RANGE_OUTDOOR_GRASS: "Range gress",
  COURSE_PRACTICE: "Bane trening",
  COURSE_COMPETITION: "Bane konkurranse",
};

const SOURCE_LABEL: Record<string, string> = { "csv-import": "CSV-import", api: "API" };

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });
}

export default async function TrackmanPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const sessions = await prisma.trackManSession.findMany({
    orderBy: { recordedAt: "desc" },
    take: 50,
    include: { user: { select: { id: true, name: true, hcp: true } } },
  });

  const totalSessions = await prisma.trackManSession.count();
  const totalShots = sessions.reduce((s, x) => s + x.shotCount, 0);

  // eslint-disable-next-line react-hooks/purity
  const trettiSiden = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const siste30d = sessions.filter((s) => s.recordedAt.getTime() >= trettiSiden);
  const shots30d = siste30d.reduce((s, x) => s + x.shotCount, 0);

  const uniquePlayers = new Set(sessions.map((s) => s.userId)).size;
  const snittShots = sessions.length === 0 ? 0 : Math.round(totalShots / sessions.length);

  const rader: AdminTrackmanV2Rad[] = sessions.map((s) => ({
    brukerId: s.user.id,
    navn: s.user.name,
    initialer: initials(s.user.name),
    hcpTekst: s.user.hcp != null ? s.user.hcp.toFixed(1).replace(".", ",") : null,
    dato: formatDate(s.recordedAt),
    shotCount: s.shotCount,
    kilde: SOURCE_LABEL[s.source] ?? s.source,
    miljo: s.environment ? (ENV_LABEL[s.environment] ?? s.environment) : null,
  }));

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminTrackmanV2
        siste30dAntall={siste30d.length}
        shots30d={shots30d}
        snittShots={snittShots}
        aktiveSpillere={uniquePlayers}
        totalSessions={totalSessions}
        rader={rader}
      />
    </V2Shell>
  );
}
