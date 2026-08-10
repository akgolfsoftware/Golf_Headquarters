/**
 * Data-loader for v2-forhåndsvisningen av AgencyOS Kalender (coach-uke).
 *
 * Kilder (EKTE data — ingen fabrikkering):
 *   1. Booking (via loadWeekCalendar) → 1-til-1- og gruppe-økter i valgt uke,
 *      mappet til et 7-dagers tids-grid.
 *   2. GroupSchedule med recurring="WEEKLY" → GJENTAKENDE SERIER. Projiseres
 *      inn i uka på sin ukedag/tid, men KUN for uker på eller etter seriens
 *      startdato (ingen oppdiktede forekomster før serien faktisk begynner).
 *      Serie-økter merkes med `serie`-label ("Gjentas hver <dag>.").
 *
 * SerieMeny («denne / alle fremtidige») bindes til en EKTE gjentakende serie:
 * den som forekommer i uka, ellers nærmeste kommende serie (med startdato-note).
 * Selve serie-redigeringen er delvis (struktur vises, handlingene er ikke koblet).
 *
 * Server-only. Kalles fra page.tsx (RSC).
 */

import { prisma } from "@/lib/prisma";
import { loadWeekCalendar } from "@/lib/admin-kalender/week-data";
import { hentSpeiledeHendelser } from "@/lib/google-calendar-mirror";
import { hentTilgjengelighet, type Tilgjengelighet } from "@/lib/admin-kalender/tilgjengelighet";
import type { OktSlag } from "@/lib/domain/kalender-belegg";

export type AkseKort = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

export interface KalOkt {
  id: string;
  kl: string;
  startMin: number;
  /**
   * Minutter siden midnatt for slutt — EKTE sluttid fra kilden, ikke estimat.
   * Klemt til 1440 når økta strekker seg over midnatt, så dagsregnskapet aldri
   * låner tid fra neste dag. Undefined kun der kilden ikke har en slutt
   * (oppgavefrist er et tidspunkt, ikke et spenn).
   *
   * Belegg regnes av dette feltet. Uten det måtte det vært regnet av
   * `estimertVarighetMin`, altså en gjetning presentert som en prosent.
   */
  sluttMin?: number;
  /**
   * Hva økta gjør med beleggsregnestykket. Se `src/lib/domain/kalender-belegg.ts`.
   * Settes av loaderen, som er det eneste stedet som vet hvilken tabell raden kom
   * fra — komponenten skal aldri gjette slag ut fra navn eller flagg.
   */
  slag: OktSlag;
  navn: string;
  akse?: AkseKort;
  sted?: string | null;
  gruppe?: number | null;
  serie?: string | null;
  href?: string;
  naa?: boolean;
  /** I3: kalenderhendelse (ferie, stengt anlegg, møte) — merkes i OktBlokk. */
  erHendelse?: boolean;
  /** B8 (2026-07-16): oppgavefrist fra Kommando-oppgavelisten (/admin/agent-team). */
  erOppgave?: boolean;
  /** Bølge 5: TrainingSessionV2-id for drill-lesevisning (klikk → drilliste). */
  treningsSessionId?: string;
  /** Steg 1 (2026-07-27): speilet hendelse fra Google Calendar. */
  erGoogle?: boolean;
  /** Navn på Google-kalenderen hendelsen kommer fra (vises som kilde). */
  kalenderNavn?: string;
  /** Googles egen farge på kalenderen (hex), brukes som prikk/stripe. */
  kalenderFarge?: string | null;
  /** Heldagshendelse — vises uten klokkeslett. */
  heldag?: boolean;
  /** Lenke til hendelsen i Google Calendar (åpnes i ny fane). */
  googleLenke?: string | null;
  /** Speilrad-id — nøkkelen som lar hendelsen redigeres (steg 4). */
  googleMirrorId?: string;
  /** «YYYY-MM-DDTHH:mm» for datetime-local-felt i redigeringsarket. */
  startLokal?: string;
  sluttLokal?: string;
  /** Beskrivelsen fra Google, redigerbar i arket. */
  notat?: string | null;
  /**
   * Booking-id — satt KUN for rader som kommer fra `Booking`. Det er de eneste
   * som kan flyttes i tid (`flyttBookingTilTid`); serier, treningsøkter,
   * hendelser og Google-speil har ingen flytte-handling. Detaljkolonnen bruker
   * feltet til å avgjøre om «Flytt til …» i det hele tatt skal vises — en knapp
   * som ikke kan gjøre noe skal ikke stå der.
   */
  bookingId?: string;
  /** Multi-coach: eier av bookingen — styrer coach-farge og coach-filteret. */
  coachId?: string | null;
  coachName?: string | null;
  /** Fasilitet: id brukes av filteret, navn vises i stedet for fritekst-sted. */
  facilityId?: string | null;
  facilityName?: string | null;
}

export interface KalDag {
  dag: string;
  dato: string;
  /** Lokal dato (YYYY-MM-DD) — grunnlag for trykk-på-tom-luke → ny booking (I1). */
  datoISO: string;
  idag: boolean;
  okter: KalOkt[];
}

export interface SerieMenyData {
  navn: string;
  dagTid: string;
  starterLabel: string | null;
}

export interface KalenderData {
  ukeLabel: string;
  /** Notion-toolbar-tittel, f.eks. «20.–26. juli 2026». */
  periode: string;
  ukeNr: number;
  dager: KalDag[];
  idagIndex: number | null;
  serieOkterAntall: number;
  antallOkter: number;
  serieMeny: SerieMenyData | null;
  innsikt: string | null;
  nav: { forrige: string; neste: string; idag: string; erInnevaerende: boolean };
  /** Multi-coach-filter: coacher med booking denne uka. */
  coacher: { id: string; navn: string }[];
  /** Fasilitets-filter: fasiliteter med booking denne uka. */
  fasiliteter: { id: string; navn: string }[];
  /** ADMIN ser alle coacher som default; COACH ser sine egne først. */
  viewerErAdmin: boolean;
  viewerCoachId: string | null;
  /**
   * Nevneren i beleggsbrøken, per dag og per coach. Komponenten regner selve
   * belegget, fordi coach- og fasilitetsfilteret er klient-side — serveren vet
   * ikke hvilket utvalg brukeren ser på.
   */
  tilgjengelighet: Tilgjengelighet;
}

const DAG_KORT = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const DAG_GJENTAS = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];
const MND_NB = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
];
const MND_KORT = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

/** Akse-klassifisering fra tjenestenavn (samme heuristikk som /admin/kalender). */
function akseFra(serviceLabel: string): AkseKort {
  const t = serviceLabel.toLowerCase();
  if (/(fys|speed|styrke|screening|mobilitet)/.test(t)) return "FYS";
  if (/(turnering)/.test(t)) return "TURN";
  if (/(trackman|driver|innspill|wedge|jern|slag)/.test(t)) return "SLAG";
  if (/(spill|bane|hull|runde|tee)/.test(t)) return "SPILL";
  return "TEK";
}

function mandagFor(d: Date): Date {
  const m = new Date(d);
  m.setHours(0, 0, 0, 0);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
}

function hhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function ukedagIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

/**
 * Sluttid i minutter siden midnatt, klemt til DEN dagen økta starter.
 *
 * En hendelse som går over midnatt (ferieuke, flere døgn) ville ellers gitt et
 * negativt eller absurd lite spenn, og dratt beleggstallet med seg. Klemmes til
 * 24:00 så dagsregnskapet aldri låner tid fra neste dag.
 */
function sluttMinFor(start: Date, slutt: Date): number {
  const sammeDag =
    start.getFullYear() === slutt.getFullYear() &&
    start.getMonth() === slutt.getMonth() &&
    start.getDate() === slutt.getDate();
  if (!sammeDag) return 24 * 60;
  return slutt.getHours() * 60 + slutt.getMinutes();
}

/**
 * «YYYY-MM-DDTHH:mm» for <input type="datetime-local">.
 * Leser med lokale getters fordi speilede tider er naiv veggklokke — se
 * google-calendar-tid.ts.
 */
function lokalInput(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` +
    `T${p(d.getHours())}:${p(d.getMinutes())}`
  );
}

export async function hentAgencyKalenderData(
  ukeParam?: string,
  userId?: string,
  viewerRolle?: string,
): Promise<KalenderData> {
  // 1 · Booking-basert uke-grid (gjenbruk eksisterende, verifisert loader).
  const uke = await loadWeekCalendar(ukeParam);

  const now = new Date();
  const ukeStart = mandagFor(
    ukeParam && !Number.isNaN(new Date(ukeParam).getTime()) ? new Date(ukeParam) : now,
  );

  // 7 dag-bøtter fra booking-data.
  const dager: KalDag[] = uke.days.map((d, i) => {
    const dato = new Date(ukeStart);
    dato.setDate(dato.getDate() + i);
    const okter: KalOkt[] = uke.events
      .filter((e) => e.dayIndex === i)
      .map((e) => ({
        id: e.id,
        kl: e.timeLabel,
        startMin: e.startMin,
        sluttMin: e.endMin,
        slag: "coaching",
        navn: e.title,
        akse: akseFra(e.serviceLabel),
        sted: e.location,
        gruppe: null, // deltakerantall pr. booking er ikke tilgjengelig — ikke gjettet
        serie: null,
        href: e.href,
        naa: e.kind === "live",
        bookingId: e.id,
        coachId: e.coachId ?? null,
        coachName: e.coachName ?? null,
        facilityId: e.facilityId ?? null,
        facilityName: e.facilityName ?? null,
      }));
    const pad = (n: number) => String(n).padStart(2, "0");
    return {
      dag: DAG_KORT[i],
      dato: `${d.date}.`,
      datoISO: `${dato.getFullYear()}-${pad(dato.getMonth() + 1)}-${pad(dato.getDate())}`,
      idag: d.isToday,
      okter,
    };
  });

  // 2 · Gjentakende serier (GroupSchedule WEEKLY) — projiser inn i uka.
  const serier = await prisma.groupSchedule.findMany({
    where: { recurring: "WEEKLY" },
    include: {
      group: { select: { id: true, name: true, _count: { select: { members: true } } } },
    },
    orderBy: { startAt: "asc" },
  });

  let serieOkterAntall = 0;
  for (const s of serier) {
    const dayIndex = ukedagIndex(s.startAt);
    const forekomst = new Date(ukeStart);
    forekomst.setDate(forekomst.getDate() + dayIndex);
    // Ærlig: bare projiser fra og med seriens startdato (ingen forekomster før serien begynner).
    const anker = new Date(s.startAt);
    anker.setHours(0, 0, 0, 0);
    if (forekomst < anker) continue;

    const startMin = s.startAt.getHours() * 60 + s.startAt.getMinutes();
    dager[dayIndex].okter.push({
      id: `serie-${s.id}`,
      kl: hhmm(s.startAt),
      startMin,
      sluttMin: sluttMinFor(s.startAt, s.endAt),
      // En gruppeøkt er ÉN avtale med flere deltakere, ikke flere avtaler
      // (fasitens kollisjonsregel). GroupSchedule har ingen coach-kolonne, så
      // eieren forblir ukjent og serien holdes utenfor kollisjonsregningen.
      slag: "coaching",
      navn: s.group.name,
      akse: undefined, // akse for gruppe-serie er ikke registrert — nøytral prikk, ikke gjettet
      sted: s.location,
      gruppe: s.group._count.members || null,
      serie: `Gjentas hver ${DAG_GJENTAS[dayIndex]}.`,
      href: `/admin/grupper/${s.group.id}`,
      naa: false,
    });
    serieOkterAntall += 1;
  }

  // 3 · Kalenderhendelser (I3) — vises for alle coacher (delt visning, som
  // bookinger/serier), plassert på startdagen. Klikk åpner detalj/slett.
  const ukeSluttForHendelser = new Date(ukeStart);
  ukeSluttForHendelser.setDate(ukeSluttForHendelser.getDate() + 7);
  const hendelser = await prisma.calendarEvent.findMany({
    where: { startAt: { lt: ukeSluttForHendelser }, endAt: { gt: ukeStart } },
    select: { id: true, title: true, startAt: true, endAt: true, coachId: true },
    orderBy: { startAt: "asc" },
  });
  for (const h of hendelser) {
    const dayIndex = ukedagIndex(h.startAt);
    if (dayIndex < 0 || dayIndex > 6) continue;
    dager[dayIndex].okter.push({
      id: `hendelse-${h.id}`,
      kl: hhmm(h.startAt),
      startMin: h.startAt.getHours() * 60 + h.startAt.getMinutes(),
      sluttMin: sluttMinFor(h.startAt, h.endAt),
      // Ferie, møte, stengt anlegg: ikke bookbar tid. Fasitens «sperret» —
      // krymper nevneren i beleggsbrøken, teller ikke som booket.
      slag: "sperret",
      navn: h.title,
      akse: undefined,
      sted: null,
      gruppe: null,
      serie: null,
      href: `/admin/kalender/hendelse/${h.id}`,
      naa: false,
      erHendelse: true,
      coachId: h.coachId,
    });
  }

  // 4 · Oppgavefrister (Kommando-oppgaver, B8 2026-07-16) — kun for innlogget
  // bruker (personlig oppgaveliste, samme som /admin/agent-team). Vises som
  // egne "Oppgave-frist"-blokker, plasseres sist i dagen (startMin 1440) og
  // er bevisst IKKE dra-og-slipp-bare (se erOppgave-guarden i OktBlokk).
  if (userId) {
    const frister = await prisma.kommandoTask.findMany({
      where: {
        userId,
        status: "open",
        dueAt: { gte: ukeStart, lt: ukeSluttForHendelser },
      },
      orderBy: { dueAt: "asc" },
    });
    for (const t of frister) {
      if (!t.dueAt) continue;
      const dayIndex = ukedagIndex(t.dueAt);
      if (dayIndex < 0 || dayIndex > 6) continue;
      dager[dayIndex].okter.push({
        id: `oppgave-${t.id}`,
        kl: "Frist",
        startMin: 1440,
        // En frist er et tidspunkt, ikke et spenn — den opptar ingen coachtid og
        // holdes derfor utenfor både teller og nevner.
        slag: "ingen",
        navn: t.title,
        akse: t.priority === "haster" ? "TURN" : undefined,
        sted: null,
        gruppe: null,
        serie: null,
        href: "/admin/agent-team",
        naa: false,
        erOppgave: true,
      });
    }
  }

  // 5 · Treningsøkter (TrainingSessionV2) — Bølge 5 drill-lesevisning.
  // Vises som egne blokker med treningsSessionId (klikk → drilliste i BunnArk).
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);
  const treningsOkter = await prisma.trainingSessionV2.findMany({
    where: {
      startTime: { gte: ukeStart, lt: ukeSlutt },
      ...(userId
        ? {
            OR: [
              { coachId: userId },
              { hostId: userId },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      status: true,
      coachId: true,
      drills: { select: { pyramide: true }, take: 1 },
    },
    take: 200,
  });
  for (const s of treningsOkter) {
    const dayIndex = ukedagIndex(s.startTime);
    if (dayIndex < 0 || dayIndex > 6) continue;
    const startMin = s.startTime.getHours() * 60 + s.startTime.getMinutes();
    const forsteAkse = s.drills[0]?.pyramide as AkseKort | undefined;
    dager[dayIndex].okter.push({
      id: `tren-${s.id}`,
      kl: hhmm(s.startTime),
      startMin,
      sluttMin: sluttMinFor(s.startTime, s.endTime),
      slag: "coaching",
      navn: s.title,
      akse: forsteAkse,
      sted: null,
      gruppe: null,
      serie: null,
      href: `/admin/spillere`,
      naa: s.status === "IN_PROGRESS",
      treningsSessionId: s.id,
      // Loaderen henter kun økter der viewer er coach eller vert, så eieren er
      // kjent selv når coachId er tom.
      coachId: s.coachId ?? userId ?? null,
    });
  }

  // 6 · Speilede Google-hendelser (steg 1, 2026-07-27) — kun for innlogget
  // coach: Google-tilkoblingen er personlig, og private avtaler skal ikke
  // lekke til andre coacher. Hendelser som speiler en app-booking utelates
  // av loaderen (de tegnes allerede fra Booking-kilden over).
  if (userId) {
    const googleHendelser = await hentSpeiledeHendelser(
      userId,
      ukeStart,
      ukeSluttForHendelser,
    );
    for (const g of googleHendelser) {
      const dayIndex = ukedagIndex(g.startAt);
      if (dayIndex < 0 || dayIndex > 6) continue;
      dager[dayIndex].okter.push({
        id: `gcal-${g.id}`,
        // Heldagshendelser sorteres først i dagen (startMin -1) og vises
        // uten klokkeslett — samme uttrykk som i Google/Apple Calendar.
        kl: g.allDay ? "Hele dagen" : hhmm(g.startAt),
        startMin: g.allDay ? -1 : g.startAt.getHours() * 60 + g.startAt.getMinutes(),
        sluttMin: g.allDay ? undefined : sluttMinFor(g.startAt, g.endAt),
        // Coachens private avtaler blokkerer bookbar tid — samme regel som
        // availability-engine bruker (`getCalendarBusy`). Heldagsrader er
        // informasjon («Ferieuke»), ikke et opptatt klokkeslett: de ville spist
        // hele nevneren om de talte som sperret.
        slag: g.allDay ? "ingen" : "sperret",
        navn: g.summary,
        akse: undefined,
        sted: g.location,
        gruppe: null,
        serie: null,
        href: undefined,
        naa: false,
        erGoogle: true,
        kalenderNavn: g.kalenderNavn,
        kalenderFarge: g.kalenderFarge,
        heldag: g.allDay,
        googleLenke: g.htmlLink,
        googleMirrorId: g.id,
        startLokal: lokalInput(g.startAt),
        sluttLokal: lokalInput(g.endAt),
        notat: g.description,
        // Google-speilet er personlig: hendelsene tilhører den innloggede coachen.
        coachId: userId,
      });
    }
  }

  // 7 · Tilgjengelig coachtid per dag — nevneren i beleggsbrøken. Hentes for
  // alle coacher; komponenten velger riktig nevner når coach-filteret er satt.
  const tilgjengelighet = await hentTilgjengelighet(ukeStart, null);

  // Sorter hver dag på starttid.
  for (const d of dager) d.okter.sort((a, b) => a.startMin - b.startMin);

  const antallOkter = dager.reduce((sum, d) => sum + d.okter.length, 0);

  // 3 · SerieMeny — bind til EN ekte gjentakende serie.
  const serieMeny = byggSerieMeny(serier, ukeStart);

  // 4 · Innsikt (ærlig, avledet fra reelle tall).
  const innsikt = byggInnsikt(serieOkterAntall, serieMeny);

  const ukeLabel = `Uke ${uke.weekNumber} · ${ukeRange(ukeStart)} · alle spillere`;
  // Notion-toolbar-tittel (Bølge 12, fasit familie-calendar.html .cal-toolbar .title):
  // datospenn + år, uten uke-nr og uten «alle spillere».
  const periode = `${ukeRange(ukeStart)} ${ukeStart.getFullYear()}`;

  return {
    ukeLabel,
    periode,
    ukeNr: uke.weekNumber,
    dager,
    idagIndex: uke.nowDayIndex,
    serieOkterAntall,
    antallOkter,
    serieMeny,
    innsikt,
    nav: {
      forrige: `/admin/kalender?uke=${uke.prevWeekParam}`,
      neste: `/admin/kalender?uke=${uke.nextWeekParam}`,
      idag: `/admin/kalender?uke=${uke.todayParam}`,
      erInnevaerende: uke.isCurrentWeek,
    },
    // Filtervalg utledes av ukas faktiske bookinger — ingen ekstra spørring,
    // og tomme lister skjuler filteret helt (se AgencyKalenderV2.teamFilter).
    coacher: unikeValg(
      uke.events.map((e) => (e.coachId ? { id: e.coachId, navn: e.coachName ?? "Coach" } : null)),
    ),
    fasiliteter: unikeValg(
      uke.events.map((e) =>
        e.facilityId ? { id: e.facilityId, navn: e.facilityName ?? "Anlegg" } : null,
      ),
    ),
    viewerErAdmin: viewerRolle === "ADMIN",
    viewerCoachId: userId ?? null,
    tilgjengelighet,
  };
}

/** Unike {id, navn}-valg i innkommende rekkefølge, null-verdier droppet. */
function unikeValg(rader: ({ id: string; navn: string } | null)[]): { id: string; navn: string }[] {
  const sett = new Map<string, string>();
  for (const r of rader) if (r && !sett.has(r.id)) sett.set(r.id, r.navn);
  return [...sett].map(([id, navn]) => ({ id, navn }));
}

type SerieRad = Awaited<ReturnType<typeof prisma.groupSchedule.findMany>>[number] & {
  group: { id: string; name: string; _count: { members: number } };
};

/** Velg serien som forekommer i uka, ellers nærmeste kommende serie. */
function byggSerieMeny(serier: SerieRad[], ukeStart: Date): SerieMenyData | null {
  if (serier.length === 0) return null;
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);

  const iUka = serier.find((s) => {
    const dayIndex = ukedagIndex(s.startAt);
    const forekomst = new Date(ukeStart);
    forekomst.setDate(forekomst.getDate() + dayIndex);
    const anker = new Date(s.startAt);
    anker.setHours(0, 0, 0, 0);
    return forekomst >= anker;
  });

  const valgt = iUka ?? serier[0];
  const dayIndex = ukedagIndex(valgt.startAt);
  const dagTid = `Gjentas hver ${DAG_GJENTAS[dayIndex]}. ${hhmm(valgt.startAt)}`;

  const anker = new Date(valgt.startAt);
  anker.setHours(0, 0, 0, 0);
  const forekomst = new Date(ukeStart);
  forekomst.setDate(forekomst.getDate() + dayIndex);
  const starterLabel =
    forekomst < anker
      ? `Starter ${valgt.startAt.getDate()}. ${MND_KORT[valgt.startAt.getMonth()]}`
      : null;

  return { navn: valgt.group.name, dagTid, starterLabel };
}

function byggInnsikt(serieOkterAntall: number, serieMeny: SerieMenyData | null): string | null {
  if (serieOkterAntall > 0) {
    return `${serieOkterAntall} gjentakende ${serieOkterAntall === 1 ? "serie-økt" : "serie-økter"} i uka. Endrer du en, velger du om det gjelder bare denne økta eller hele serien.`;
  }
  if (serieMeny?.starterLabel) {
    return `Ingen gjentakende serier denne uka — de faste gruppene starter opp igjen ${serieMeny.starterLabel.replace("Starter ", "")}.`;
  }
  return null;
}

function ukeRange(ukeStart: Date): string {
  const slutt = new Date(ukeStart);
  slutt.setDate(slutt.getDate() + 6);
  const sammeMnd = ukeStart.getMonth() === slutt.getMonth();
  if (sammeMnd) {
    return `${ukeStart.getDate()}.–${slutt.getDate()}. ${MND_NB[slutt.getMonth()]}`;
  }
  return `${ukeStart.getDate()}. ${MND_NB[ukeStart.getMonth()]}–${slutt.getDate()}. ${MND_NB[slutt.getMonth()]}`;
}
