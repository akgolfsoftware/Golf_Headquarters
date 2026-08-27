/**
 * Data-loader for AgencyOS Kalender-lag (Loop 7/C3, natt-plan bølge 2).
 *
 * NY, egen flate — IKKE samme kilde som `/admin/kalender` (booking-uka,
 * `hentAgencyKalenderData`). Denne slår sammen fem lag på tvers av domenet:
 * Økter (WorkbenchSession) · Skole (SchoolScheduleEntry) · Turneringer
 * (TournamentEntry) · Tester (TestAssignment) · Booking. Google er IKKE et
 * lag her (anti-scope: ingen Google-API, `google-calendar-*`-filene røres
 * ikke i det hele tatt) — se OVERNIGHT-CODING-LOOP-BOLGE2.md Loop 7.
 *
 * Kilder: EKTE data, ingen fabrikkering. Alle datofelt regnes Oslo-korrekt
 * via `uke-helpers.ts` (aldri rå getDay(), jf. gotchas.md). Booking/
 * TestAssignment/Tournament følger kodebasens «naiv veggklokke»-konvensjon
 * (samme tidssone-antakelse som uke-helpers — se `google-calendar-tid.ts`
 * sin `tilNaivVeggklokke`-dokumentasjon), så uke-helpers' Date-objekter er
 * direkte sammenlignbare med disse kolonnene uten videre konvertering.
 * WorkbenchSession.date (@db.Date) bruker derimot UTC-midnatt-konvensjonen
 * i `wb-map.ts` (`tilDatoKolonne`/`fraDatoKolonne`) — egen, dokumentert
 * konvensjon for den kolonnetypen.
 *
 * Server-only. Kalles fra page.tsx (RSC).
 */

import { prisma } from "@/lib/prisma";
import { dagerIUken, endOfWeek, formatPeriode, startOfWeek, ukenummer } from "@/lib/uke-helpers";
import { fraDatoKolonne, tilDatoKolonne } from "@/lib/workbench/wb-map";
import { ALLE_LAG, type KalenderHendelse, type KalenderLag } from "@/lib/domain/kalender-lag";
import {
  romKollisjoner,
  romKollidererIder,
  type RomBooking,
  type RomKollisjonPar,
} from "@/lib/domain/kalender-rom-kollisjon";

export interface KalenderLagUkeData {
  ukeNr: number;
  periode: string;
  /** 7 lokale datoer (YYYY-MM-DD), mandag→søndag. */
  dager: string[];
  idagIso: string;
  hendelser: KalenderHendelse[];
  kollisjoner: RomKollisjonPar[];
  kollidererIder: Set<string>;
  nav: { forrige: string; neste: string; idag: string };
}

const UKEDAG_KORT = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

function isoAvLokalDato(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function minSidenMidnatt(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

/** Sluttid i minutter, klemt til den dagen hendelsen starter (fleredagers-spenn låner aldri fra neste dag). */
function klemtSluttMin(start: Date, slutt: Date): number {
  const sammeDag =
    start.getFullYear() === slutt.getFullYear() &&
    start.getMonth() === slutt.getMonth() &&
    start.getDate() === slutt.getDate();
  return sammeDag ? minSidenMidnatt(slutt) : 24 * 60;
}

export async function hentKalenderLagUke(ukeParam?: string): Promise<KalenderLagUkeData> {
  const basis = ukeParam && !Number.isNaN(new Date(ukeParam).getTime()) ? new Date(ukeParam) : new Date();
  const ukeStart = startOfWeek(basis);
  const ukeSlutt = endOfWeek(basis);
  const dagerDates = dagerIUken(ukeStart);
  const dager = dagerDates.map(isoAvLokalDato);
  const idagIso = isoAvLokalDato(new Date());

  const forrigeUke = new Date(ukeStart);
  forrigeUke.setDate(forrigeUke.getDate() - 7);
  const nesteUke = new Date(ukeStart);
  nesteUke.setDate(nesteUke.getDate() + 7);

  const [oktRader, skoleRader, turneringRader, testRader, bookingRader] = await Promise.all([
    prisma.workbenchSession.findMany({
      where: {
        date: { gte: tilDatoKolonne(dager[0]), lte: tilDatoKolonne(dager[6]) },
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
      },
      orderBy: [{ date: "asc" }, { startMinute: "asc" }],
      take: 500,
    }),
    prisma.schoolScheduleEntry.findMany({
      where: { date: { gte: ukeStart, lt: ukeSlutt } },
      orderBy: { date: "asc" },
      take: 200,
    }),
    prisma.tournamentEntry.findMany({
      where: {
        entryStatus: { notIn: ["WITHDRAWN"] },
        OR: [
          { manualDate: { gte: ukeStart, lt: ukeSlutt } },
          { tournament: { startDate: { gte: ukeStart, lt: ukeSlutt } } },
        ],
      },
      include: { tournament: { select: { name: true, startDate: true } }, user: { select: { name: true } } },
      take: 200,
    }),
    prisma.testAssignment.findMany({
      where: { status: "OPEN", dueDate: { gte: ukeStart, lt: ukeSlutt } },
      include: { test: { select: { name: true } }, player: { select: { name: true } } },
      take: 200,
    }),
    prisma.booking.findMany({
      where: {
        startAt: { gte: ukeStart, lt: ukeSlutt },
        status: { in: ["CONFIRMED", "PENDING", "COMPLETED"] },
      },
      include: {
        user: { select: { name: true } },
        serviceType: { select: { name: true } },
        facility: { select: { id: true, name: true, capacity: true } },
      },
      orderBy: { startAt: "asc" },
      take: 500,
    }),
  ]);

  // WorkbenchSession har bare `playerId` (ingen relasjon) — navn hentes i ett
  // samlet oppslag, samme mønster som TrainingSessionV2 i
  // `admin/kalender/data.ts` (`studentId` uten relasjon).
  const spillerIder = [...new Set(oktRader.map((r) => r.playerId))];
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
      href: `/admin/spillere/${r.playerId}`,
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

  // Booking + KA-05 romkollisjon: kun bookinger koblet til en fasilitet kan
  // kollidere på rom — bookinger uten facilityId («et sted på lokasjonen»)
  // holdes utenfor kollisjonsregningen, samme prinsipp som
  // `kalender-belegg.ts` sin «ukjent eier holdes utenfor».
  const romBookinger: RomBooking[] = [];
  const kapasitetPerFasilitet: Record<string, number> = {};
  for (const r of bookingRader) {
    const startMin = minSidenMidnatt(r.startAt);
    const sluttMin = klemtSluttMin(r.startAt, r.endAt);
    hendelser.push({
      id: `booking-${r.id}`,
      lag: "BOOKING",
      dato: isoAvLokalDato(r.startAt),
      tittel: r.user?.name ?? r.guestName ?? "Gjest",
      undertekst: `${r.serviceType.name}${r.facility ? ` · ${r.facility.name}` : ""}`,
      startMin,
      sluttMin,
      heldag: false,
      href: `/admin/bookinger`,
    });
    if (r.facility) {
      kapasitetPerFasilitet[r.facility.id] = r.facility.capacity;
      romBookinger.push({
        id: `booking-${r.id}`,
        facilityId: r.facility.id,
        facilityName: r.facility.name,
        // Romkollisjon er pr. dag — bookinger på ulike dager kan aldri kollidere,
        // så vi grener på dato ved å blande datoen inn i den effektive tidsaksen
        // (dag-indeks × 1440 + minutt) i stedet for å kjøre ett sweep pr. dag.
        startMin: dagIndeks(dager, isoAvLokalDato(r.startAt)) * 1440 + startMin,
        sluttMin: dagIndeks(dager, isoAvLokalDato(r.startAt)) * 1440 + sluttMin,
        tittel: r.user?.name ?? r.guestName ?? "Gjest",
      });
    }
  }

  const kollisjoner = romKollisjoner(romBookinger, kapasitetPerFasilitet);
  const kollidererIder = romKollidererIder(kollisjoner);
  for (const h of hendelser) {
    if (kollidererIder.has(h.id)) {
      h.kollidererMed = kollisjoner
        .filter((k) => k.a === h.id || k.b === h.id)
        .map((k) => (k.a === h.id ? k.b : k.a));
    }
  }

  const sluttVisning = new Date(ukeStart);
  sluttVisning.setDate(sluttVisning.getDate() + 6);

  return {
    ukeNr: ukenummer(ukeStart),
    periode: `Uke ${ukenummer(ukeStart)} · ${formatPeriode(ukeStart, ukeSlutt)}`,
    dager,
    idagIso,
    hendelser,
    kollisjoner,
    kollidererIder,
    nav: {
      forrige: `/admin/kalender/lag?uke=${isoAvLokalDato(forrigeUke)}`,
      neste: `/admin/kalender/lag?uke=${isoAvLokalDato(nesteUke)}`,
      idag: `/admin/kalender/lag`,
    },
  };
}

function dagIndeks(dager: string[], dato: string): number {
  const i = dager.indexOf(dato);
  return i === -1 ? 0 : i;
}

export const KALENDER_LAG_UKEDAG_KORT = UKEDAG_KORT;
export type { KalenderHendelse, KalenderLag, RomKollisjonPar };
export { ALLE_LAG };
