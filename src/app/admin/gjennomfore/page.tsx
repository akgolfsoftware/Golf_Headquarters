/**
 * v2-forhåndsvisning — AgencyOS Gjennomføre / Daglig drift (retning C). Egen
 * top-level route-group (v2preview) som IKKE arver AdminShell — kun root-layout
 * — så V2Shell leverer all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + datakontrakt gjenbrukt fra den ekte siden
 * (src/app/admin/gjennomfore/page.tsx): samme requirePortalUser-guard
 * (ADMIN/COACH) og samme dag/uke-tellinger (Booking CONFIRMED/PENDING) + antall
 * aktive anlegg (Location). I tillegg hentes den EKTE økt-lista for dagen
 * (Booking på tvers av spillere, inkl. gjennomførte) — kjernen i «daglig drift».
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  AdminGjennomforeV2,
  type AdminGjennomforeData,
  type GjennomforeOkt,
  type OktStatusRaw,
} from "@/components/admin/v2/AdminGjennomforeV2";

export const dynamic = "force-dynamic";

const AKTIVE_STATUSER = ["CONFIRMED", "PENDING"] as const;

/** Dag/uke-vindu — beregnes utenfor render (Date.now i render er forbudt). */
function dagOgUkeVindu() {
  const dagStart = new Date();
  dagStart.setHours(0, 0, 0, 0);
  const dagSlutt = new Date(dagStart);
  dagSlutt.setDate(dagStart.getDate() + 1);
  const ukeStart = new Date(dagStart);
  ukeStart.setDate(dagStart.getDate() - ((dagStart.getDay() + 6) % 7)); // mandag
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeStart.getDate() + 7);
  return { dagStart, dagSlutt, ukeStart, ukeSlutt };
}

export default async function V2AdminGjennomforePage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const { dagStart, dagSlutt, ukeStart, ukeSlutt } = dagOgUkeVindu();
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const [okterIDag, okterDenneUka, antallAnlegg, dagensBookinger] = await Promise.all([
    prisma.booking.count({
      where: { startAt: { gte: dagStart, lt: dagSlutt }, status: { in: [...AKTIVE_STATUSER] } },
    }),
    prisma.booking.count({
      where: { startAt: { gte: ukeStart, lt: ukeSlutt }, status: { in: [...AKTIVE_STATUSER] } },
    }),
    prisma.location.count({ where: { active: true } }),
    // Dagens økt-liste på tvers av spillere (ekte rader). Ekskluder CANCELLED.
    prisma.booking.findMany({
      where: {
        startAt: { gte: dagStart, lt: dagSlutt },
        status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
      },
      orderBy: { startAt: "asc" },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        guestName: true,
        user: { select: { name: true } },
        serviceType: { select: { name: true } },
        location: { select: { name: true } },
      },
    }),
  ]);

  const okter: GjennomforeOkt[] = dagensBookinger.map((b) => ({
    id: b.id,
    tid: b.startAt.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" }),
    startMin: Math.round((b.startAt.getTime() - dagStart.getTime()) / 60000),
    durMin: Math.max(0, Math.round((b.endAt.getTime() - b.startAt.getTime()) / 60000)),
    spiller: b.user?.name ?? b.guestName ?? "Uten spiller",
    tjeneste: b.serviceType?.name ?? "Økt",
    sted: b.location?.name ?? "—",
    status: b.status as OktStatusRaw,
    href: `/admin/gjennomfore/okter/${b.id}`,
  }));

  // Alle åtte drifts-destinasjoner bevart fra den ekte hub-siden.
  const data: AdminGjennomforeData = {
    dayLabel: dagStart.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" }),
    nowMin,
    okterIDag,
    okterDenneUka,
    antallAnlegg,
    okter,
    snarveier: [
      { id: "kalender", href: "/admin/kalender/uke", ikon: "calendar", tittel: "Coach-kalender", verdi: `${okterIDag} i dag`, sub: `${okterDenneUka} denne uka` },
      { id: "bookinger", href: "/admin/bookinger", ikon: "check-circle", tittel: "Bookinger", verdi: `${okterDenneUka} denne uka`, sub: "Behandle bekreftelser" },
      { id: "anlegg", href: "/admin/locations", ikon: "map-pin", tittel: "Anlegg", verdi: `${antallAnlegg} anlegg`, sub: "Aktive lokasjoner" },
      { id: "tilgjengelighet", href: "/admin/availability", ikon: "clock", tittel: "Tilgjengelighet", verdi: "—", sub: "Sett åpne timer", tom: true },
      { id: "kapasitet", href: "/admin/kapasitet", ikon: "bar-chart", tittel: "Kapasitet", verdi: "—", sub: "Se kapasitet-trend", tom: true },
      { id: "tjenester", href: "/admin/services", ikon: "credit-card", tittel: "Tjenester", verdi: "—", sub: "Prislister og tjenester", tom: true },
      { id: "trackman", href: "/admin/trackman", ikon: "monitor", tittel: "TrackMan", verdi: "—", sub: "Aktive sesjoner", tom: true },
      { id: "live", href: "/admin/kalender", ikon: "activity", tittel: "Live-økter", verdi: "—", sub: "Start ny økt fra kalender", tom: true },
    ],
  };

  return (
    <V2Shell aktiv="kalender" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/planlegge">Planlegge</TilbakeLenke>
      <AdminGjennomforeV2 data={data} />
    </V2Shell>
  );
}
