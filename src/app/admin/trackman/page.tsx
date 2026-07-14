/**
 * v2 — AgencyOS TrackMan (på tvers), /admin/trackman.
 * Egen top-level route-group (v2preview) som IKKE arver AdminShell — kun
 * root-layout — så V2Shell leverer all chrome (IkonRail/BunnNav) i mørk
 * v2-scope. Erstatter den tidligere `(legacy)/trackman`-siden.
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
import { TilbakeLenke } from "@/components/v2";
import {
  AdminTrackmanV2,
  type AdminTrackmanV2Data,
  type AdminTrackmanV2Rad,
} from "@/components/admin/v2/AdminTrackmanV2";

export const dynamic = "force-dynamic";

// Matcher TrackManEnvironment-enum i prisma/schema.prisma.
const ENV_LABEL: Record<string, string> = {
  SIMULATOR_INDOOR: "Simulator inne",
  NET_INDOOR: "Nett inne",
  RANGE_OUTDOOR_MAT: "Range matte",
  RANGE_OUTDOOR_GRASS: "Range gress",
  COURSE_PRACTICE: "Bane trening",
  COURSE_COMPETITION: "Bane konkurranse",
};

const SOURCE_LABEL: Record<string, string> = {
  "csv-import": "CSV-import",
  api: "API",
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

  // eslint-disable-next-line react-hooks/purity
  const trettiSiden = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const siste30d = sessions.filter((s) => s.recordedAt.getTime() >= trettiSiden);
  const shots30d = siste30d.reduce((s, x) => s + x.shotCount, 0);
  const uniquePlayers = new Set(sessions.map((s) => s.userId)).size;
  const snittShots = sessions.length === 0 ? 0 : Math.round(totalShots / sessions.length);

  const rader: AdminTrackmanV2Rad[] = sessions.map((s) => ({
    key: s.id,
    spillerId: s.user.id,
    navn: s.user.name,
    hcp: s.user.hcp != null ? s.user.hcp.toFixed(1).replace(".", ",") : null,
    dato: datoLabel(s.recordedAt),
    slag: s.shotCount,
    kildeLabel: SOURCE_LABEL[s.source] ?? s.source,
    miljoLabel: s.environment ? (ENV_LABEL[s.environment] ?? s.environment) : null,
  }));

  const miljoer = Array.from(new Set(rader.map((r) => r.miljoLabel).filter((m): m is string => m !== null))).sort();

  const data: AdminTrackmanV2Data = {
    kpis: [
      { label: "Sesjoner · 30d", value: String(siste30d.length), tint: true },
      { label: "Slag · 30d", value: shots30d.toLocaleString("nb-NO") },
      { label: "Snitt slag/sesjon", value: String(snittShots) },
      { label: "Aktive spillere", value: String(uniquePlayers) },
    ],
    miljoer,
    rader,
  };

  return (
    <V2Shell aktiv="kalender" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/gjennomfore">Daglig drift</TilbakeLenke>
      <AdminTrackmanV2 data={data} />
    </V2Shell>
  );
}
