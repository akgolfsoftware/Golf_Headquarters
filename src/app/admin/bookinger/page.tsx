/**
 * v2-preview: AgencyOS Bookinger & kapasitet (Paper 1:1, `agencyos-bookinger`).
 * Egen top-level route-group (v2preview) som IKKE arver AdminShell — kun
 * root-layout — så V2Shell leverer all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + data følger den ekte /admin/bookinger-flaten: samme
 * requirePortalUser-guard (ADMIN/COACH) og samme Prisma-loader (booking +
 * facility for valgt uke, sessionRequest PENDING). Mapper til
 * AdminBookingerV2Data (ærlige tomrom, ingen fabrikerte tall).
 *
 * Ukenavigasjon: `?tilbake=N` (antall uker bak inneværende uke). Fasiten
 * viser kun «Forrige uke» — ingen «neste» (Paper-mønster, ikke rørt).
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { can, Capability } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import type { FacilityType } from "@/generated/prisma/client";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { KalenderHubNav } from "@/components/admin/v2/agency-hub-subnav";
import {
  AdminBookingerV2,
  type AdminBookingerV2Data,
  type AdminBookingV2Row,
  type AdminBookingerV2AnleggTab,
} from "@/components/admin/v2/AdminBookingerV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bookinger og kapasitet · AgencyOS" };

const DAGER_KORT = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"]; // getDay()-indeks
const DAG_KOLONNER = ["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"]; // heatmap-kolonner (mandag først)
const TIMER = ["06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22"];

// Grov, ærlig gruppering av reelle FacilityType-verdier til fanenavn —
// speiler kommentarene i prisma/schema.prisma (ikke oppdiktede kategorier).
const ANLEGG_TYPE_GRUPPE: Record<FacilityType, string> = {
  STUDIO: "Simulator",
  RANGE_1F: "Range",
  RANGE_2F: "Range",
  PUTTING_GREEN: "Range",
  SHORT_GAME: "Range",
  COURSE_9H: "Bane",
  COURSE_18H: "Bane",
  SPECIFIC_HOLES: "Bane",
  GENERAL: "Annet",
};

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

type SearchParams = Promise<{ tilbake?: string }>;

export default async function V2AdminBookingerPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const kanSeFinans = can(user.role, Capability.VIEW_FINANCE);

  const { tilbake: tilbakeRaw } = await searchParams;
  const tilbake = Math.max(0, Number(tilbakeRaw) || 0);

  const ukeStart = mandagFor(new Date());
  ukeStart.setDate(ukeStart.getDate() - tilbake * 7);
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);
  const ukeNr = isoUke(ukeStart);

  const [bookinger, facilities, ventendeForesporsler, tjenester] = await Promise.all([
    prisma.booking.findMany({
      where: { startAt: { gte: ukeStart, lt: ukeSlutt } },
      orderBy: { startAt: "asc" },
      include: {
        user: { select: { id: true, name: true } },
        serviceType: { select: { name: true } },
        facility: { select: { name: true, type: true } },
        location: { select: { name: true } },
      },
    }),
    prisma.facility.findMany({
      where: { active: true },
      include: { location: { select: { name: true } } },
      orderBy: [{ location: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.sessionRequest.count({ where: { status: "PENDING" } }),
    prisma.serviceType.findMany({
      where: { active: true },
      select: { id: true, name: true, durationMin: true, priceOre: true },
      orderBy: { name: "asc" },
      take: 6,
    }),
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

  // VarmeKart forventer 0..1-verdier per celle — celler med booking løftes til
  // minst 0.35 så de faktisk er synlige (c/anleggskapasitet ble nær usynlig).
  const verdier = counts.map((row) =>
    row.map((c) => (c === 0 ? 0 : Math.max(0.35, Math.min(1, c / samletKapasitet)))),
  );

  // Kapasitet fra coach-perspektivet: andel av ukas timeluker (17 timer × 7
  // dager) med minst én booking. Anleggskapasiteten i nevneren ga alltid
  // «0 %» ved siden av en full bookingliste (audit-funn 7).
  const totaltSlots = TIMER.length * 7;
  const brukteSlots = counts.reduce(
    (sum, row) => sum + row.reduce((a, c) => a + (c > 0 ? 1 : 0), 0),
    0,
  );
  const kapasitetPct = totaltSlots ? Math.round((brukteSlots / totaltSlots) * 100) : 0;
  const ledigeLuker = Math.max(0, totaltSlots - brukteSlots);

  // Kapasitet som PENGER — ukas bookingverdi i kroner (priceOre er låst ved
  // booking; credit-bookinger = 0 og telles ærlig som 0 kr). Avlyste teller
  // ikke med — de representerer ikke inntekt.
  const ukesVerdiKr = Math.round(
    bookinger
      .filter((b) => b.status !== "CANCELLED")
      .reduce((sum, b) => sum + b.priceOre, 0) / 100,
  );

  const avlystAntall = bookinger.filter((b) => b.status === "CANCELLED").length;

  // Ærlig KPI: «Forespørsler» = ubehandlede sessionRequests (alle uker) —
  // samme tall som Forespørsler-køen banneren peker på. Ventende bookinger
  // (kun denne uka) blandes ikke inn; de vises som PENDING i lista under.
  const foresporsler = ventendeForesporsler;
  const lokasjon = facilities[0]?.location.name ?? "alle anlegg";

  // Anleggsfaner — grovgruppert på reelle FacilityType-verdier, kun typer
  // som faktisk finnes blant ukas bookinger.
  const anleggTypeAvBooking = (b: (typeof bookinger)[number]): string =>
    b.facility ? ANLEGG_TYPE_GRUPPE[b.facility.type] : "Annet";
  const anleggTellinger = new Map<string, number>();
  for (const b of bookinger) {
    const t = anleggTypeAvBooking(b);
    anleggTellinger.set(t, (anleggTellinger.get(t) ?? 0) + 1);
  }
  const REKKEFOLGE = ["Simulator", "Range", "Bane", "Annet"];
  const anleggTabs: AdminBookingerV2AnleggTab[] = REKKEFOLGE.filter((t) => anleggTellinger.has(t)).map((t) => ({
    navn: t,
    antall: anleggTellinger.get(t) ?? 0,
  }));

  const rader: AdminBookingV2Row[] = bookinger.map((b) => {
    const navn = b.user?.name ?? b.guestName ?? "Gjest";
    const anlegg = b.facility?.name ?? b.location?.name ?? "—";
    return {
      id: b.id,
      navn,
      tid: tidLabel(b.startAt),
      tjeneste: b.serviceType.name,
      anlegg,
      anleggType: anleggTypeAvBooking(b),
      status: b.status as AdminBookingV2Row["status"],
      prisKr: Math.round(b.priceOre / 100),
      planHref: null,
    };
  });

  const data: AdminBookingerV2Data = {
    ukeNr,
    lokasjon,
    nyHref: "/admin/bookinger/ny",
    forrigeUkeHref: `/admin/bookinger?tilbake=${tilbake + 1}`,
    kapasitetHref: "/admin/availability",
    kpis: {
      bookinger: bookinger.length,
      avlyst: avlystAntall,
      kapasitetPct,
      brukteTimeluker: brukteSlots,
      totaltTimeluker: totaltSlots,
      foresporsler,
      ledigeLuker,
      apningstid: `${TIMER[0]}–${Number(TIMER[TIMER.length - 1]) + 1}, ma–sø`,
      ukesVerdiKr: kanSeFinans ? ukesVerdiKr : null,
    },
    heat: { timer: TIMER, dager: DAG_KOLONNER, verdier },
    anleggTabs,
    bookinger: rader,
    tjenester: tjenester.map((t) => ({
      id: t.id,
      navn: t.name,
      varighetMin: t.durationMin,
      prisLabel: `${Math.round(t.priceOre / 100).toLocaleString("nb-NO")} kr`,
    })),
  };

  return (
    <V2Shell bredde="kolonne" aktiv="kalender" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <KalenderHubNav />
      <AdminBookingerV2 data={data} />
    </V2Shell>
  );
}
