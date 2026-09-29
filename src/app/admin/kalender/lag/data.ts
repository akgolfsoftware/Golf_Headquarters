/**
 * Data-loader for AgencyOS-kalenderen (C3 lag + T7 uke/måned/dag).
 *
 * Slår sammen fem lag: Økter · Skole · Turneringer · Tester · Booking.
 * Google er IKKE et lag (anti-scope: `google-calendar-*` røres ikke).
 *
 * Server-only. Kalles fra `/admin/kalender` (RSC). Tid via uke-helpers
 * (Oslo, aldri rå getDay()).
 */

import { prisma } from "@/lib/prisma";
import { dagerIUken, endOfDay, endOfWeek, formatPeriode, startOfDay, startOfWeek, ukenummer } from "@/lib/uke-helpers";
import { fraDatoKolonne, tilDatoKolonne } from "@/lib/workbench/wb-map";
import {
  ALLE_LAG,
  akseFraPyramide,
  type KalenderHendelse,
  type KalenderLag,
} from "@/lib/domain/kalender-lag";
import { byggTurneringslag, type Turneringslag } from "@/lib/domain/kalender-turnering";
import { SPILLER_SYNLIGE_STATUSER } from "@/lib/workbench/wb-map";
import {
  romKollisjoner,
  romKollidererIder,
  type RomBooking,
  type RomKollisjonPar,
} from "@/lib/domain/kalender-rom-kollisjon";
import {
  manedEtikett,
  manedNokkel,
  manedsrutenett,
  parseManedParam,
  skiftManed,
  type ManedsCelle,
} from "@/lib/domain/kalender-maned";

export type KalenderVisning = "dag" | "uke" | "maned";

export interface KalenderLagUkeData {
  visning: KalenderVisning;
  ukeNr: number | null;
  periode: string;
  /** Datoer i visningsvinduet (7 for uke/dag, alle rutenett-dager for måned). */
  dager: string[];
  rutenett: ManedsCelle[];
  idagIso: string;
  hendelser: KalenderHendelse[];
  kollisjoner: RomKollisjonPar[];
  /** Serialiserbart over RSC → klient (ikke Set). */
  kollidererIder: string[];
  /**
   * Turneringslaget over uka (WorkbenchTournamentPlan): turnerings- og
   * reisedager per dag i vinduet, og reisevarsler. Vises over uka.
   */
  turneringslag: Turneringslag;
  /** Coachene som eier økter/bookinger i vinduet — filteret «Alle coacher». */
  coacher: Array<{ id: string; navn: string }>;
  nav: {
    forrige: string;
    neste: string;
    idag: string;
    dagHref: string;
    ukeHref: string;
    manedHref: string;
    nyBookingHref: string;
    tilgjengelighetHref: string;
    /** MASTERPLAN 15.13: /admin/kalender/hendelse/ny hadde ingen vei inn. */
    nyHendelseHref: string;
  };
}

const UKEDAG_KORT = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

function isoAvLokalDato(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function skiftIsoDag(iso: string, delta: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + delta);
  return isoAvLokalDato(d);
}

function minSidenMidnatt(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

/** Sluttid i minutter, klemt til den dagen hendelsen starter. */
function klemtSluttMin(start: Date, slutt: Date): number {
  const sammeDag =
    start.getFullYear() === slutt.getFullYear() &&
    start.getMonth() === slutt.getMonth() &&
    start.getDate() === slutt.getDate();
  return sammeDag ? minSidenMidnatt(slutt) : 24 * 60;
}

function dagIndeks(dager: string[], dato: string): number {
  const i = dager.indexOf(dato);
  return i === -1 ? 0 : i;
}

function kalenderHref(opts: {
  visning?: KalenderVisning;
  uke?: string;
  maaned?: string;
  dato?: string;
  lag?: KalenderLag;
}): string {
  const q = new URLSearchParams();
  if (opts.visning && opts.visning !== "uke") q.set("visning", opts.visning);
  if (opts.visning === "maned" && opts.maaned) q.set("maaned", opts.maaned);
  if (opts.visning === "dag" && opts.dato) q.set("dato", opts.dato);
  if (opts.visning !== "maned" && opts.visning !== "dag" && opts.uke) q.set("uke", opts.uke);
  if (opts.lag) q.set("lag", opts.lag);
  const s = q.toString();
  return s ? `/admin/kalender?${s}` : "/admin/kalender";
}

async function hentHendelserIVindu(
  vinduStart: Date,
  vinduSlutt: Date,
  dager: string[],
): Promise<{
  hendelser: KalenderHendelse[];
  kollisjoner: RomKollisjonPar[];
  kollidererIder: string[];
  turneringslag: Turneringslag;
  coacher: Array<{ id: string; navn: string }>;
}> {
  const forsteDag = dager[0] ?? isoAvLokalDato(vinduStart);
  const sisteDag = dager[dager.length - 1] ?? isoAvLokalDato(vinduStart);
  const [oktRader, skoleRader, turneringRader, testRader, bookingRader, turneringsPlaner] = await Promise.all([
    prisma.workbenchSession.findMany({
      where: {
        date: { gte: tilDatoKolonne(dager[0] ?? isoAvLokalDato(vinduStart)), lte: tilDatoKolonne(dager[dager.length - 1] ?? isoAvLokalDato(vinduStart)) },
        status: { notIn: ["CANCELLED", "SKIPPED"] },
      },
      select: {
        id: true,
        date: true,
        startMinute: true,
        durationMinutes: true,
        title: true,
        location: true,
        playerId: true,
        pyramid: true,
        status: true,
        coachId: true,
      },
      orderBy: [{ date: "asc" }, { startMinute: "asc" }],
      take: 2000,
    }),
    prisma.schoolScheduleEntry.findMany({
      where: { date: { gte: vinduStart, lt: vinduSlutt } },
      orderBy: { date: "asc" },
      take: 500,
    }),
    prisma.tournamentEntry.findMany({
      where: {
        entryStatus: { notIn: ["WITHDRAWN"] },
        OR: [
          { manualDate: { gte: vinduStart, lt: vinduSlutt } },
          { tournament: { startDate: { gte: vinduStart, lt: vinduSlutt } } },
        ],
      },
      include: { tournament: { select: { name: true, startDate: true } }, user: { select: { name: true } } },
      take: 500,
    }),
    prisma.testAssignment.findMany({
      where: { status: "OPEN", dueDate: { gte: vinduStart, lt: vinduSlutt } },
      include: { test: { select: { name: true } }, player: { select: { name: true } } },
      take: 500,
    }),
    prisma.booking.findMany({
      where: {
        startAt: { gte: vinduStart, lt: vinduSlutt },
        status: { in: ["CONFIRMED", "PENDING", "COMPLETED"] },
      },
      include: {
        user: { select: { name: true } },
        serviceType: { select: { name: true } },
        facility: { select: { id: true, name: true, capacity: true } },
      },
      orderBy: { startAt: "asc" },
      take: 2000,
    }),
    // Turneringslaget: planer som spilles eller har reisedager i vinduet.
    prisma.workbenchTournamentPlan.findMany({
      where: {
        status: { notIn: ["WITHDRAWN", "ARCHIVED"] },
        OR: [
          { startDate: { lte: tilDatoKolonne(sisteDag) }, endDate: { gte: tilDatoKolonne(forsteDag) } },
          { travelStartDate: { lte: tilDatoKolonne(sisteDag) }, travelEndDate: { gte: tilDatoKolonne(forsteDag) } },
        ],
      },
      select: {
        id: true,
        title: true,
        playerId: true,
        startDate: true,
        endDate: true,
        travelStartDate: true,
        travelEndDate: true,
      },
      orderBy: { startDate: "asc" },
      take: 200,
    }),
  ]);

  const coachIder = [...new Set([...oktRader.map((r) => r.coachId), ...bookingRader.map((r) => r.coachId)].filter((id): id is string => !!id))];
  const spillerIder = [...new Set([...oktRader.map((r) => r.playerId), ...turneringsPlaner.map((p) => p.playerId), ...coachIder])];
  const spillerNavn = new Map<string, string | null>();
  if (spillerIder.length > 0) {
    const spillere = await prisma.user.findMany({
      where: { id: { in: spillerIder } },
      select: { id: true, name: true },
    });
    for (const s of spillere) spillerNavn.set(s.id, s.name);
  }

  const hendelser: KalenderHendelse[] = [];

  for (const r of oktRader) {
    const dato = fraDatoKolonne(r.date);
    hendelser.push({
      id: `okt-${r.id}`,
      lag: "OEKTER",
      dato,
      tittel: r.title,
      undertekst: spillerNavn.get(r.playerId) ?? undefined,
      startMin: r.startMinute,
      sluttMin: Math.min(1440, r.startMinute + r.durationMinutes),
      heldag: false,
      href: `/admin/workbench/${r.playerId}`,
      akse: akseFraPyramide(r.pyramid),
      coachId: r.coachId,
      flytt: {
        type: "okt",
        id: r.id,
        spillerSer: (SPILLER_SYNLIGE_STATUSER as readonly string[]).includes(r.status),
      },
    });
  }

  for (const r of skoleRader) {
    hendelser.push({
      id: `skole-${r.id}`,
      lag: "SKOLE",
      dato: isoAvLokalDato(r.date),
      tittel: r.title,
      undertekst: r.classYear ?? undefined,
      startMin: null,
      sluttMin: null,
      heldag: true,
      lesevisning: true,
    });
  }

  for (const r of turneringRader) {
    const dato = r.tournament?.startDate ?? r.manualDate;
    if (!dato) continue;
    hendelser.push({
      id: `turn-${r.id}`,
      lag: "TURNERING",
      dato: isoAvLokalDato(dato),
      tittel: r.tournament?.name ?? r.manualName ?? "Turnering",
      undertekst: r.user.name ?? undefined,
      startMin: null,
      sluttMin: null,
      heldag: true,
    });
  }

  for (const r of testRader) {
    if (!r.dueDate) continue;
    hendelser.push({
      id: `test-${r.id}`,
      lag: "TESTER",
      dato: isoAvLokalDato(r.dueDate),
      tittel: r.test.name,
      undertekst: r.player.name ?? undefined,
      startMin: null,
      sluttMin: null,
      heldag: true,
      href: "/admin/tester",
    });
  }

  const romBookinger: RomBooking[] = [];
  const kapasitetPerFasilitet: Record<string, number> = {};
  for (const r of bookingRader) {
    const startMin = minSidenMidnatt(r.startAt);
    const sluttMin = klemtSluttMin(r.startAt, r.endAt);
    const dato = isoAvLokalDato(r.startAt);
    hendelser.push({
      id: `booking-${r.id}`,
      lag: "BOOKING",
      dato,
      tittel: r.user?.name ?? r.guestName ?? "Gjest",
      undertekst: `${r.serviceType.name}${r.facility ? ` · ${r.facility.name}` : ""}`,
      startMin,
      sluttMin,
      heldag: false,
      href: `/admin/bookinger/${r.id}`,
      coachId: r.coachId,
      flytt: r.status === "COMPLETED"
        ? undefined
        : {
            type: "booking",
            id: r.id,
            harSpiller: r.userId != null,
            foreslaatt: r.proposedStartAt
              ? `${isoAvLokalDato(r.proposedStartAt)} ${String(r.proposedStartAt.getHours()).padStart(2, "0")}:${String(r.proposedStartAt.getMinutes()).padStart(2, "0")}`
              : null,
          },
    });
    if (r.facility) {
      kapasitetPerFasilitet[r.facility.id] = r.facility.capacity;
      romBookinger.push({
        id: `booking-${r.id}`,
        facilityId: r.facility.id,
        facilityName: r.facility.name,
        startMin: dagIndeks(dager, dato) * 1440 + startMin,
        sluttMin: dagIndeks(dager, dato) * 1440 + sluttMin,
        tittel: r.user?.name ?? r.guestName ?? "Gjest",
      });
    }
  }

  const kollisjoner = romKollisjoner(romBookinger, kapasitetPerFasilitet);
  const kollidererSet = romKollidererIder(kollisjoner);
  for (const h of hendelser) {
    if (kollidererSet.has(h.id)) {
      h.kollidererMed = kollisjoner
        .filter((k) => k.a === h.id || k.b === h.id)
        .map((k) => (k.a === h.id ? k.b : k.a));
    }
  }

  const turneringslag = byggTurneringslag(
    dager,
    turneringsPlaner.map((p) => ({
      id: p.id,
      tittel: p.title,
      spiller: spillerNavn.get(p.playerId) ?? "Spiller",
      spillerId: p.playerId,
      startDato: fraDatoKolonne(p.startDate),
      sluttDato: fraDatoKolonne(p.endDate),
      reiseFra: p.travelStartDate ? fraDatoKolonne(p.travelStartDate) : null,
      reiseTil: p.travelEndDate ? fraDatoKolonne(p.travelEndDate) : null,
    })),
    oktRader.map((r) => ({ spillerId: r.playerId, dato: fraDatoKolonne(r.date), tittel: r.title })),
  );

  const coacher = coachIder
    .map((id) => ({ id, navn: spillerNavn.get(id) ?? "Coach" }))
    .sort((a, b) => a.navn.localeCompare(b.navn, "nb-NO"));

  return {
    hendelser,
    kollisjoner,
    kollidererIder: [...kollidererSet],
    turneringslag,
    coacher,
  };
}

export async function hentKalenderLagUke(
  ukeParam?: string,
  opts?: { lag?: KalenderLag; visning?: "uke" | "dag"; dato?: string },
): Promise<KalenderLagUkeData> {
  const visning: KalenderVisning = opts?.visning === "dag" ? "dag" : "uke";
  const basisIso = opts?.dato ?? ukeParam;
  const basis = basisIso && !Number.isNaN(new Date(basisIso).getTime()) ? new Date(basisIso) : new Date();
  const ukeStart = startOfWeek(basis);
  const ukeSlutt = endOfWeek(basis);
  const dagerDates = dagerIUken(ukeStart);
  const dager = dagerDates.map(isoAvLokalDato);
  const idagIso = isoAvLokalDato(new Date());

  const forrigeUke = new Date(ukeStart);
  forrigeUke.setDate(forrigeUke.getDate() - 7);
  const nesteUke = new Date(ukeStart);
  nesteUke.setDate(nesteUke.getDate() + 7);

  const lastet = await hentHendelserIVindu(ukeStart, ukeSlutt, dager);

  const ukeIso = isoAvLokalDato(ukeStart);
  const dagIso =
    (opts?.dato && dager.includes(opts.dato) ? opts.dato : undefined) ??
    (idagIso && dager.includes(idagIso) ? idagIso : undefined) ??
    dager[0] ??
    ukeIso;
  const maaned = ukeIso.slice(0, 7);
  const lag = opts?.lag;

  return {
    visning,
    ukeNr: ukenummer(ukeStart),
    periode: `Uke ${ukenummer(ukeStart)} · ${formatPeriode(ukeStart, ukeSlutt)}`,
    dager,
    rutenett: dager.map((dato) => ({ dato, iManed: true })),
    idagIso,
    ...lastet,
    nav: {
      forrige:
        visning === "dag"
          ? kalenderHref({ visning: "dag", dato: skiftIsoDag(dagIso, -1), lag })
          : kalenderHref({ visning: "uke", uke: isoAvLokalDato(forrigeUke), lag }),
      neste:
        visning === "dag"
          ? kalenderHref({ visning: "dag", dato: skiftIsoDag(dagIso, 1), lag })
          : kalenderHref({ visning: "uke", uke: isoAvLokalDato(nesteUke), lag }),
      idag: kalenderHref({ visning, lag }),
      dagHref: kalenderHref({ visning: "dag", dato: dagIso, lag }),
      ukeHref: kalenderHref({ visning: "uke", uke: ukeIso, lag }),
      manedHref: kalenderHref({ visning: "maned", maaned, lag }),
      nyBookingHref: "/admin/bookinger/ny",
      tilgjengelighetHref: "/admin/availability",
      nyHendelseHref: "/admin/kalender/hendelse/ny",
    },
  };
}

export async function hentKalenderLagManed(
  maanedParam?: string,
  opts?: { lag?: KalenderLag },
): Promise<KalenderLagUkeData> {
  const idag = new Date();
  const parsed = parseManedParam(maanedParam) ?? {
    aar: idag.getFullYear(),
    maaned: idag.getMonth() + 1,
  };
  const rutenett = manedsrutenett(parsed.aar, parsed.maaned);
  const dager = rutenett.map((c) => c.dato);
  const foerste = rutenett[0]?.dato;
  const siste = rutenett[rutenett.length - 1]?.dato;
  const vinduStart = foerste ? startOfDay(new Date(`${foerste}T12:00:00`)) : startOfWeek(idag);
  const vinduSlutt = siste ? endOfDay(new Date(`${siste}T12:00:00`)) : endOfWeek(idag);
  const idagIso = isoAvLokalDato(idag);

  const lastet = await hentHendelserIVindu(vinduStart, vinduSlutt, dager);

  const forrige = skiftManed(parsed.aar, parsed.maaned, -1);
  const neste = skiftManed(parsed.aar, parsed.maaned, 1);
  const denneNokkel = manedNokkel(parsed.aar, parsed.maaned);
  const ukeIso = dager.includes(idagIso) ? idagIso : (foerste ?? idagIso);
  const lag = opts?.lag;

  return {
    visning: "maned",
    ukeNr: null,
    periode: manedEtikett(parsed.aar, parsed.maaned),
    dager,
    rutenett,
    idagIso,
    ...lastet,
    nav: {
      forrige: kalenderHref({ visning: "maned", maaned: manedNokkel(forrige.aar, forrige.maaned), lag }),
      neste: kalenderHref({ visning: "maned", maaned: manedNokkel(neste.aar, neste.maaned), lag }),
      idag: kalenderHref({ visning: "maned", lag }),
      dagHref: kalenderHref({ visning: "dag", dato: idagIso, lag }),
      ukeHref: kalenderHref({ visning: "uke", uke: ukeIso, lag }),
      manedHref: kalenderHref({ visning: "maned", maaned: denneNokkel, lag }),
      nyBookingHref: "/admin/bookinger/ny",
      tilgjengelighetHref: "/admin/availability",
      nyHendelseHref: "/admin/kalender/hendelse/ny",
    },
  };
}

export const KALENDER_LAG_UKEDAG_KORT = UKEDAG_KORT;
export type { KalenderHendelse, KalenderLag, RomKollisjonPar };
export { ALLE_LAG };

export interface KalenderAarData {
  aar: number;
  maaneder: Array<{ nokkel: string; navn: string; bookinger: number; okter: number }>;
  nav: { forrige: string; neste: string; idag: string };
}

const MND_KORT = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"];

/**
 * AG-05-AR: bookinger og økter per måned i ett år. Samme statuser som
 * uke-visningen (bookinger: bekreftet/venter/gjennomført; økter: ikke
 * avlyst/hoppet over). Tellinger, ingen estimater.
 */
export async function hentKalenderAar(aarParam?: string): Promise<KalenderAarData> {
  const iAar = Number(new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo", year: "numeric" }).format(new Date()));
  const aar = aarParam && /^\d{4}$/.test(aarParam) ? Number(aarParam) : iAar;
  const maaneder = await Promise.all(
    MND_KORT.map(async (navn, m) => {
      const [bookinger, okter] = await Promise.all([
        prisma.booking.count({
          where: { startAt: { gte: new Date(aar, m, 1), lt: new Date(aar, m + 1, 1) }, status: { in: ["CONFIRMED", "PENDING", "COMPLETED"] } },
        }),
        prisma.workbenchSession.count({
          where: {
            date: { gte: new Date(Date.UTC(aar, m, 1)), lt: new Date(Date.UTC(aar, m + 1, 1)) },
            status: { notIn: ["CANCELLED", "SKIPPED"] },
          },
        }),
      ]);
      return { nokkel: `${aar}-${String(m + 1).padStart(2, "0")}`, navn, bookinger, okter };
    }),
  );
  return {
    aar,
    maaneder,
    nav: {
      forrige: `/admin/kalender?fane=ar&aar=${aar - 1}`,
      neste: `/admin/kalender?fane=ar&aar=${aar + 1}`,
      idag: "/admin/kalender?fane=ar",
    },
  };
}
