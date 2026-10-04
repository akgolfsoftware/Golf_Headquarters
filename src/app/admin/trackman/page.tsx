/**
 * v2 — AgencyOS TrackMan (på tvers), /admin/trackman.
 * Egen top-level route-group (v2preview) som IKKE arver AdminShell — kun
 * root-layout — så V2Shell leverer all chrome (IkonRail/BunnNav) i mørk
 * v2-scope. Erstatter den tidligere `(legacy)/trackman`-siden.
 *
 * Train-lock-port (T9, 27.08.2026) — se AdminTrackmanTrainLock.tsx for
 * fasit-referanse og dokumenterte avvik.
 *
 * Auth + datakontrakt gjenbrukt 1:1 fra den ekte flaten: samme
 * requirePortalUser-guard (ADMIN/COACH) og samme prisma.trackManSession-
 * spørring (nyeste 50, m/ spiller-navn+HCP), snitt/uniktall regnet ut her
 * (server) så klientkomponenten forblir ren visning. Ingen fabrikerte tall.
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { startOfWeek, endOfWeek } from "@/lib/uke-helpers";
import { computeTrackManDispersionMap } from "@/lib/trackman/dispersion-map";

import {
  AdminTrackmanTrainLock,
  type AdminTrackmanTLData,
  type AdminTrackmanTLRad,
} from "@/components/admin/v2/AdminTrackmanTrainLock";

export const dynamic = "force-dynamic";
export const metadata = { title: "TrackMan · AgencyOS" };

const SOURCE_LABEL: Record<string, string> = {
  "csv-import": "csv",
  api: "api",
};

function datoLabel(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });
}

export default async function V2AdminTrackmanPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const sessions = await prisma.trackManSession.findMany({
    orderBy: { recordedAt: "desc" },
    take: 50,
    include: { user: { select: { id: true, name: true, hcp: true } } },
  });

  const totalShots = sessions.reduce((s, x) => s + x.shotCount, 0);

  const naa = new Date();
  const ukeStart = startOfWeek(naa);
  const ukeSlutt = endOfWeek(naa);
  const denneUken = sessions.filter((s) => s.recordedAt >= ukeStart && s.recordedAt <= ukeSlutt);
  const uniquePlayers = new Set(sessions.map((s) => s.userId)).size;
  const snittShots = sessions.length === 0 ? 0 : Math.round(totalShots / sessions.length);

  const rader: AdminTrackmanTLRad[] = sessions.map((s) => ({
    key: s.id,
    spillerId: s.user.id,
    navn: s.user.name,
    hcp: s.user.hcp != null ? s.user.hcp.toFixed(1).replace(".", ",") : null,
    dato: datoLabel(s.recordedAt),
    slag: s.shotCount,
    kildeLabel: SOURCE_LABEL[s.source] ?? s.source,
  }));

  // Hero-kort: siste økt med nok gyldige slag (side + carry) til å tegne et kart.
  // Kun ÉN ekstra spørring — ikke én per rad (se avvik-notat i AdminTrackmanTrainLock).
  let hero: AdminTrackmanTLData["hero"] = null;
  for (const s of sessions.slice(0, 8)) {
    const shots = await prisma.trackManShot.findMany({
      where: { sessionId: s.id },
      orderBy: { shotNumber: "asc" },
      select: { id: true, shotNumber: true, club: true, side: true, carryDistance: true, totalDistance: true, smashFactor: true, launchAngle: true },
    });
    const perKolle = new Map<string, typeof shots>();
    for (const shot of shots) {
      if (shot.side == null || shot.carryDistance == null) continue;
      perKolle.set(shot.club, [...(perKolle.get(shot.club) ?? []), shot]);
    }
    let valgtKolle: string | null = null;
    let flest = -1;
    for (const [kolle, liste] of perKolle) {
      if (liste.length > flest) {
        flest = liste.length;
        valgtKolle = kolle;
      }
    }
    if (!valgtKolle || flest < 2) continue;
    const kolleShots = shots.filter((shot) => shot.club === valgtKolle);
    hero = {
      playerName: s.user.name ?? "Spiller",
      club: valgtKolle,
      sessionHref: `/admin/trackman/${s.id}`,
      result: computeTrackManDispersionMap(kolleShots),
    };
    break;
  }

  const data: AdminTrackmanTLData = {
    kpis: [
      { label: "Sesjoner · uken", value: String(denneUken.length) },
      { label: "Snitt slag/sesjon", value: String(snittShots) },
      { label: "Aktive spillere", value: String(uniquePlayers) },
      { label: "Totalt slag", value: totalShots.toLocaleString("nb-NO") },
    ],
    oktDenneUken: denneUken.length,
    antallSpillere: uniquePlayers,
    hero,
    rader,
  };

  return (
    <V2Shell bredde="kolonne" aktiv="innsikt" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminTrackmanTrainLock data={data} />
    </V2Shell>
  );
}
