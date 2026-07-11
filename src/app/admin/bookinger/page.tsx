/**
 * v2-preview: AgencyOS Bookinger & kapasitet (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver AdminShell — kun root-layout — så
 * V2Shell leverer all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + data følger den ekte /admin/bookinger-flaten: samme
 * requirePortalUser-guard (ADMIN/COACH) og samme Prisma-loader (booking +
 * facility for inneværende uke, sessionRequest PENDING). Mapper til
 * AdminBookingerV2Data (ærlige tomrom, ingen fabrikerte tall).
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminBookingerV2, type AdminBookingerV2Data, type AdminBookingV2Row } from "@/components/admin/v2/AdminBookingerV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bookinger & kapasitet · AgencyOS (v2)" };

const DAGER_KORT = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"]; // getDay()-indeks
const DAG_KOLONNER = ["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"]; // heatmap-kolonner (mandag først)
const TIMER = ["06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22"];

function mandagFor(d: Date): Date {
  const m = new Date(d);
  m.setHours(0, 0, 0, 0);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
}

function isoUke(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dag = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dag);
  const aarStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - aarStart.getTime()) / 86_400_000 + 1) / 7);
}

function tidLabel(d: Date): string {
  const hhmm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${DAGER_KORT[d.getDay()]} ${d.getDate()}. · ${hhmm}`;
}

/** mandag-først kolonneindeks (0=Ma … 6=Sø) fra getDay() (0=Søn). */
function kolonneFor(getDay: number): number {
  return (getDay + 6) % 7;
}

export default async function V2AdminBookingerPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const ukeStart = mandagFor(new Date());
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);
  const ukeNr = isoUke(ukeStart);

  const [bookinger, facilities, ventendeForesporsler] = await Promise.all([
    prisma.booking.findMany({
      where: { startAt: { gte: ukeStart, lt: ukeSlutt } },
      orderBy: { startAt: "asc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            technicalPlans: { where: { status: "ACTIVE" }, select: { id: true }, take: 1 },
          },
        },
        serviceType: { select: { name: true } },
        facility: { select: { name: true } },
        location: { select: { name: true } },
      },
    }),
    prisma.facility.findMany({
      where: { active: true },
      include: { location: { select: { name: true } } },
      orderBy: [{ location: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.sessionRequest.count({ where: { status: "PENDING" } }),
  ]);

  // --- Kapasitet-heatmap: timer × dag (ekte bookinger) ---
  const samletKapasitet = facilities.reduce((sum, f) => sum + Math.max(1, f.capacity), 0) || 1;
  const counts: number[][] = TIMER.map(() => new Array(7).fill(0));
  const aktiveBookinger = bookinger.filter((b) => b.status === "CONFIRMED" || b.status === "PENDING");
  for (const b of aktiveBookinger) {
    const timeIdx = TIMER.findIndex((t) => Number(t) === b.startAt.getHours());
    if (timeIdx === -1) continue;
    const dagIdx = kolonneFor(b.startAt.getDay());
    counts[timeIdx][dagIdx]++;
  }

  // VarmeKart forventer 0..1-verdier per celle.
  const verdier = counts.map((row) => row.map((c) => Math.min(1, c / samletKapasitet)));

  const totaltSlots = TIMER.length * 7 * samletKapasitet;
  const brukteSlots = counts.reduce(
    (sum, row) => sum + row.reduce((a, c) => a + Math.min(c, samletKapasitet), 0),
    0,
  );
  const kapasitetPct = totaltSlots ? Math.round((brukteSlots / totaltSlots) * 100) : 0;
  const ledigeLuker = Math.max(0, totaltSlots - brukteSlots);

  const ventendeBookinger = bookinger.filter((b) => b.status === "PENDING").length;
  const foresporsler = ventendeBookinger + ventendeForesporsler;
  const lokasjon = facilities[0]?.location.name ?? "Alle anlegg";

  const rader: AdminBookingV2Row[] = bookinger.map((b) => {
    const navn = b.user?.name ?? b.guestName ?? "Gjest";
    const anlegg = b.facility?.name ?? b.location?.name ?? "—";
    const planId = b.user?.technicalPlans?.[0]?.id;
    return {
      id: b.id,
      navn,
      tid: tidLabel(b.startAt),
      tjeneste: b.serviceType.name,
      anlegg,
      status: b.status as AdminBookingV2Row["status"],
      planHref: b.user && planId ? `/admin/spillere/${b.user.id}/plan/${planId}` : null,
    };
  });

  const data: AdminBookingerV2Data = {
    ukeNr,
    lokasjon,
    nyHref: "/admin/bookinger/ny",
    kpis: { bookinger: bookinger.length, kapasitetPct, foresporsler, ledigeLuker },
    heat: { timer: TIMER, dager: DAG_KOLONNER, verdier },
    anlegg: facilities.map((f) => f.name),
    bookinger: rader,
  };

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminBookingerV2 data={data} />
    </V2Shell>
  );
}
