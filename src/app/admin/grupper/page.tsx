/**
 * v2-preview: AgencyOS Grupper (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell/AdminShell — kun root-layout — så
 * V2Shell leverer all chrome i mørk v2-scope.
 *
 * Auth er identisk med /admin/grupper (requirePortalUser ADMIN/COACH). Data
 * hentes fra samme kilder som den ekte grupper-siden: Group + GroupMember +
 * GroupSchedule. «Neste økt» og faste treningstider utledes av de ekte
 * GroupSchedule-radene (WEEKLY) — ingen fabrikerte tider.
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { GrupperV2, type GrupperData, type GruppeV2, type FastTid } from "@/components/admin/v2/GrupperV2";
import { TilbakeLenke } from "@/components/v2";
import { GfgkBootstrapButton, NyGruppeButton } from "./grupper-actions";
import { GFGK_BOOTSTRAP_GRUPPER } from "@/lib/gfgk-junior/bootstrap";

export const dynamic = "force-dynamic";

// Man-indeksert (0=mandag) ukedagsforkortelser — matcher AK-kalenderens uke.
const DAG_KORT = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const UKEDAG_NUM: Record<string, number> = {
  monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6,
};

/** Oslo-lokal ukedag (0=man..6=søn), uavhengig av server-tidssone. */
function osloUkedag(d: Date): number {
  const dag = d.toLocaleDateString("en-US", { weekday: "long", timeZone: "Europe/Oslo" }).toLowerCase();
  return UKEDAG_NUM[dag] ?? 0;
}
/** Oslo-lokal «HH:MM». */
function osloTid(d: Date): string {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Oslo" });
}
function minutter(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export default async function V2GrupperPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const coachesRaw = await prisma.user.findMany({
    where: { role: "COACH", deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  const coaches = coachesRaw.map((c) => ({ id: c.id, name: c.name ?? "Ukjent" }));

  const groups = await prisma.group.findMany({
    select: {
      id: true,
      name: true,
      _count: { select: { members: true } },
      schedules: {
        where: { recurring: "WEEKLY" },
        select: { id: true, title: true, startAt: true, endAt: true, location: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const now = new Date();
  const naaUkedag = osloUkedag(now);
  const naaMin = minutter(osloTid(now));

  const grupper: GruppeV2[] = groups.map((g) => {
    // Faste treningstider — sortert etter ukedag, deretter klokkeslett.
    const faste: (FastTid & { _ukedag: number; _min: number })[] = g.schedules
      .map((s) => {
        const ukedag = osloUkedag(s.startAt);
        return {
          id: s.id,
          dag: DAG_KORT[ukedag],
          tid: `${osloTid(s.startAt)}–${osloTid(s.endAt)}`,
          tittel: s.title,
          sted: s.location,
          _ukedag: ukedag,
          _min: minutter(osloTid(s.startAt)),
        };
      })
      .sort((a, b) => a._ukedag - b._ukedag || a._min - b._min);

    // Neste økt = treningstiden med minst tid til neste forekomst fra nå.
    let neste: (typeof faste)[number] | null = null;
    let minTilNeste = Infinity;
    for (const f of faste) {
      let dagDiff = (f._ukedag - naaUkedag + 7) % 7;
      if (dagDiff === 0 && f._min <= naaMin) dagDiff = 7;
      const tilNeste = dagDiff * 1440 + (f._min - naaMin);
      if (tilNeste < minTilNeste) {
        minTilNeste = tilNeste;
        neste = f;
      }
    }

    const nesteOkt = neste
      ? `${neste.dag} ${neste.tid.split("–")[0]}${neste.sted ? ` · ${neste.sted}` : ""}`
      : null;

    return {
      id: g.id,
      navn: g.name,
      antallMedlemmer: g._count.members,
      nesteOkt,
      faste: faste.map(({ _ukedag, _min, ...rest }) => rest),
    };
  });

  const data: GrupperData = { grupper };

  // gfgkjunior.no-bootstrap: vis engangsknappen til alle fire gruppene finnes.
  const gfgkNavn = new Set(GFGK_BOOTSTRAP_GRUPPER.map((g) => g.navn));
  const manglerGfgk =
    groups.filter((g) => gfgkNavn.has(g.name)).length < gfgkNavn.size;

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/spillere">Stall</TilbakeLenke>
      {manglerGfgk ? (
        <div style={{ marginBottom: 14 }}>
          <GfgkBootstrapButton />
        </div>
      ) : null}
      <GrupperV2 data={data} actions={{ NyGruppeButton }} coaches={coaches} />
    </V2Shell>
  );
}
