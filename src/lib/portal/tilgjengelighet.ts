// Spillerens tilgjengelighet — hva som er opptatt, og hva som er ledig.
//
// Fire kilder gjør en spiller utilgjengelig. Tre fantes allerede i basen, men
// ble aldri lest inn i spillerens kalender:
//
//   1. GroupSchedule        — fast gruppetrening (via GroupMember)
//   2. SchoolScheduleEntry  — skolerute per klassetrinn (via User.schoolYear)
//   3. Leave                — fravær, skade, permisjon
//   4. PlayerBusyBlock      — spillerens egne avtaler (ny)
//
// I tillegg er allerede planlagt trening (TrainingSessionV2) opptatt tid — en
// ny økt skal ikke legges oppå en som finnes.
//
// Formålet er finnLedigeLuker: planleggeren skal legge økter i timer spilleren
// faktisk har, ikke oppå skole, kamp eller tannlege.

import "server-only";
import { prisma } from "@/lib/prisma";

export type OpptattKilde =
  | "GRUPPETRENING"
  | "SKOLE"
  | "FRAVAER"
  | "EGEN_AVTALE"
  | "TRENING";

export type OpptattBlokk = {
  kilde: OpptattKilde;
  /** Null når spilleren har markert avtalen som privat. Tiden er aldri skjult. */
  tittel: string | null;
  start: Date;
  slutt: Date;
  /** Hele dagen er blokkert (skolerute har ingen klokkeslett i modellen). */
  heleDagen: boolean;
};

export type LedigLuke = {
  start: Date;
  slutt: Date;
  minutter: number;
};

/**
 * Skolerute-kategorier som gjør spilleren utilgjengelig.
 * FERIE er bevisst utelatt — ferie er ledig tid, ikke opptatt.
 * Kilde: SchoolScheduleEntry.category (TIME | PROVE | HELDAGSPROVE | EKSAMEN |
 * FERIE | SKOLETUR | ANNET).
 */
const SKOLE_OPPTATT = new Set([
  "TIME",
  "PROVE",
  "HELDAGSPROVE",
  "EKSAMEN",
  "SKOLETUR",
]);

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

/**
 * Utvider en ukentlig gjentakelse inn i vinduet. GroupSchedule og
 * PlayerBusyBlock bruker samme enkle mønster: recurring = "WEEKLY" betyr at
 * blokken gjentas hver uke fra startAt. Ingen unntak, ingen sluttdato — det
 * ville krevd en egen gjentakelsesmodell.
 */
export function utvidUkentlig(
  start: Date,
  slutt: Date,
  fra: Date,
  til: Date,
): Array<{ start: Date; slutt: Date }> {
  const UKE_MS = 7 * 24 * 60 * 60 * 1000;
  const varighet = slutt.getTime() - start.getTime();
  const treff: Array<{ start: Date; slutt: Date }> = [];

  // Hopp fram til første forekomst i vinduet i stedet for å iterere fra
  // startAt — en gruppetrening satt opp for to år siden ville ellers gitt
  // hundrevis av runder.
  let t = start.getTime();
  if (t < fra.getTime()) {
    const hopp = Math.ceil((fra.getTime() - t) / UKE_MS);
    t += hopp * UKE_MS;
  }
  while (t <= til.getTime()) {
    treff.push({ start: new Date(t), slutt: new Date(t + varighet) });
    t += UKE_MS;
  }
  return treff;
}

/** Henter all opptatt tid for en spiller i vinduet [fra, til]. */
export async function hentOpptattTid(
  spillerId: string,
  fra: Date,
  til: Date,
): Promise<OpptattBlokk[]> {
  const spiller = await prisma.user.findUnique({
    where: { id: spillerId },
    select: { schoolYear: true },
  });

  const [grupper, egne, fravaer, okter, skole] = await Promise.all([
    prisma.groupSchedule.findMany({
      where: {
        group: { members: { some: { userId: spillerId } } },
        // Ukentlige tas med selv om startAt er før vinduet — de gjentas inn i det.
        OR: [{ startAt: { lte: til } }],
      },
      select: { title: true, startAt: true, endAt: true, recurring: true },
    }),
    prisma.playerBusyBlock.findMany({
      where: { userId: spillerId, startAt: { lte: til } },
      select: {
        title: true,
        startAt: true,
        endAt: true,
        recurring: true,
        isPrivate: true,
      },
    }),
    prisma.leave.findMany({
      where: {
        userId: spillerId,
        startAt: { lte: til },
        // endAt null = pågående permisjon, blokkerer ut vinduet.
        OR: [{ endAt: null }, { endAt: { gte: fra } }],
      },
      select: { reason: true, startAt: true, endAt: true },
    }),
    prisma.trainingSessionV2.findMany({
      where: { studentId: spillerId, startTime: { gte: fra, lte: til } },
      select: { title: true, startTime: true, endTime: true },
    }),
    spiller?.schoolYear
      ? prisma.schoolScheduleEntry.findMany({
          where: {
            date: { gte: startOfDay(fra), lte: endOfDay(til) },
            // null classYear = gjelder alle trinn (skolerute/ferier).
            OR: [{ classYear: spiller.schoolYear }, { classYear: null }],
          },
          select: { title: true, category: true, date: true },
        })
      : Promise.resolve([]),
  ]);

  const blokker: OpptattBlokk[] = [];

  for (const g of grupper) {
    const forekomster =
      g.recurring === "WEEKLY"
        ? utvidUkentlig(g.startAt, g.endAt, fra, til)
        : [{ start: g.startAt, slutt: g.endAt }];
    for (const f of forekomster) {
      if (f.slutt < fra || f.start > til) continue;
      blokker.push({
        kilde: "GRUPPETRENING",
        tittel: g.title,
        start: f.start,
        slutt: f.slutt,
        heleDagen: false,
      });
    }
  }

  for (const e of egne) {
    const forekomster =
      e.recurring === "WEEKLY"
        ? utvidUkentlig(e.startAt, e.endAt, fra, til)
        : [{ start: e.startAt, slutt: e.endAt }];
    for (const f of forekomster) {
      if (f.slutt < fra || f.start > til) continue;
      blokker.push({
        kilde: "EGEN_AVTALE",
        // Privat avtale: tiden teller, tittelen deles ikke.
        tittel: e.isPrivate ? null : e.title,
        start: f.start,
        slutt: f.slutt,
        heleDagen: false,
      });
    }
  }

  for (const l of fravaer) {
    blokker.push({
      kilde: "FRAVAER",
      tittel: String(l.reason),
      start: l.startAt,
      slutt: l.endAt ?? til,
      heleDagen: true,
    });
  }

  for (const o of okter) {
    blokker.push({
      kilde: "TRENING",
      tittel: o.title,
      start: o.startTime,
      slutt: o.endTime,
      heleDagen: false,
    });
  }

  for (const s of skole) {
    if (!SKOLE_OPPTATT.has(s.category)) continue;
    // Skolerute har ingen klokkeslett i modellen — kun dato. Hele dagen
    // markeres opptatt. Presis timeplan må spilleren legge inn selv som
    // PlayerBusyBlock med kind=SKOLE.
    blokker.push({
      kilde: "SKOLE",
      tittel: s.title,
      start: startOfDay(s.date),
      slutt: endOfDay(s.date),
      heleDagen: true,
    });
  }

  return blokker.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export type LedigeLukerOptions = {
  /** Tidligste klokkeslett det kan trenes, som time (0-23). */
  fraTime?: number;
  /** Seneste klokkeslett en økt kan slutte, som time (0-23). */
  tilTime?: number;
  /** Ignorer luker kortere enn dette. */
  minMinutter?: number;
};

/**
 * Finner ledige luker per dag i vinduet.
 *
 * Dag for dag, ikke sammenhengende over døgnskiller: en «ledig luke» fra
 * 22:00 til 09:00 neste morgen er ikke en treningsmulighet.
 */
export async function finnLedigeLuker(
  spillerId: string,
  fra: Date,
  til: Date,
  options: LedigeLukerOptions = {},
): Promise<LedigLuke[]> {
  const opptatt = await hentOpptattTid(spillerId, fra, til);
  return beregnLedigeLuker(opptatt, fra, til, options);
}

/**
 * Ren beregning: opptatte blokker inn, ledige luker ut. Ingen database.
 * Skilt fra finnLedigeLuker så logikken kan testes uten Prisma.
 */
export function beregnLedigeLuker(
  opptatt: OpptattBlokk[],
  fra: Date,
  til: Date,
  options: LedigeLukerOptions = {},
): LedigLuke[] {
  const fraTime = options.fraTime ?? 7;
  const tilTime = options.tilTime ?? 21;
  const minMinutter = options.minMinutter ?? 45;

  const luker: LedigLuke[] = [];

  for (
    let dag = startOfDay(fra);
    dag <= til;
    dag = new Date(dag.getFullYear(), dag.getMonth(), dag.getDate() + 1)
  ) {
    const dagStart = new Date(
      dag.getFullYear(),
      dag.getMonth(),
      dag.getDate(),
      fraTime,
    );
    const dagSlutt = new Date(
      dag.getFullYear(),
      dag.getMonth(),
      dag.getDate(),
      tilTime,
    );
    if (dagSlutt <= fra || dagStart >= til) continue;

    // Klipp mot vinduet, så en luke aldri starter før fra eller slutter etter til.
    const vindusStart = dagStart < fra ? fra : dagStart;
    const vindusSlutt = dagSlutt > til ? til : dagSlutt;

    const iDag = opptatt
      .filter((b) => b.slutt > vindusStart && b.start < vindusSlutt)
      .map((b) => ({
        start: b.start < vindusStart ? vindusStart : b.start,
        slutt: b.slutt > vindusSlutt ? vindusSlutt : b.slutt,
      }))
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    let markor = vindusStart;
    for (const b of iDag) {
      if (b.start > markor) {
        const min = (b.start.getTime() - markor.getTime()) / 60000;
        if (min >= minMinutter) {
          luker.push({ start: markor, slutt: b.start, minutter: min });
        }
      }
      if (b.slutt > markor) markor = b.slutt;
    }
    if (markor < vindusSlutt) {
      const min = (vindusSlutt.getTime() - markor.getTime()) / 60000;
      if (min >= minMinutter) {
        luker.push({ start: markor, slutt: vindusSlutt, minutter: min });
      }
    }
  }

  return luker;
}
