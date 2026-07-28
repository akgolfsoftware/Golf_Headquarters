/**
 * Speiling av Google-hendelser inn i AgencyOS (steg 1, 2026-07-27).
 *
 * Fram til nå blokkerte Google-hendelser booking via freebusy, men ble aldri
 * lagret — så de kunne ikke VISES i kalenderen. Denne modulen holder en lokal
 * kopi (GoogleCalendarEvent) slik at kalenderflatene rendrer alt fra én kilde.
 *
 * Google eier innholdet. Vi skriver aldri tilbake herfra — push går fortsatt
 * gjennom google-calendar.ts.
 *
 * Inkrementell sync via Googles syncToken:
 *   - Første gang (ingen token): full henting i vinduet [-6 mnd, +18 mnd].
 *   - Deretter: kun det som er endret siden sist, uten hull.
 *   - 410 GONE (token for gammelt) → nullstill og full re-sync.
 *
 * Dette erstatter updatedMin-vinduene i webhook + cron, som kunne miste
 * endringer ved mange samtidige oppdateringer (ingen paginering, hardt
 * maxResults-kutt).
 */
import type { calendar_v3 } from "googleapis";
import { prisma } from "@/lib/prisma";
import { getCalendarApi } from "@/lib/google-calendar";
import { parseGoogleTidspunkt } from "@/lib/google-calendar-tid";
import type { GoogleCalendarConnection } from "@/generated/prisma/client";

/** Hvor langt bakover vi speiler ved full sync. */
const VINDU_MND_BAK = 6;
/** Hvor langt framover vi speiler ved full sync (dekker neste sesong). */
const VINDU_MND_FRAM = 18;
/** Googles maks per side. */
const SIDE_STORRELSE = 250;
/** Vern mot uendelig paginering ved uventet API-oppførsel. */
const MAKS_SIDER = 40;

/**
 * En hendelse som faktisk endret seg i denne synkroniseringen. Brukes av
 * calendar-sync til å speile endringen videre til Booking — uten et eget
 * API-kall og uten updatedMin-vinduer som kan miste endringer.
 */
export interface HendelsesEndring {
  googleEventId: string;
  type: "slettet" | "endret";
  startAt?: Date;
  endAt?: Date;
}

export interface MirrorResultat {
  subscriptionId: string;
  kalender: string;
  lagret: number;
  slettet: number;
  hoppetOver: number;
  fullSync: boolean;
  /** Kun hendelser som endret seg — tom ved uendret sync. */
  endringer: HendelsesEndring[];
  feil?: string;
}

/** Tittel-fallback: Google tillater hendelser uten summary. */
function tittelFor(event: calendar_v3.Schema$Event): string {
  const s = event.summary?.trim();
  return s && s.length > 0 ? s : "(uten tittel)";
}

/**
 * Speil én kalender. Returnerer hva som ble gjort — kallere logger/aggregerer.
 *
 * `tvingFull` brukes ved 410 GONE og ved manuell «hent alt på nytt».
 */
export async function syncSubscriptionEvents(
  subscriptionId: string,
  tvingFull = false,
): Promise<MirrorResultat> {
  const sub = await prisma.googleCalendarSubscription.findUnique({
    where: { id: subscriptionId },
    include: { connection: true },
  });
  if (!sub) {
    return {
      subscriptionId,
      kalender: "(ukjent)",
      lagret: 0,
      slettet: 0,
      hoppetOver: 0,
      fullSync: false,
      endringer: [],
      feil: "Subscription ikke funnet",
    };
  }

  const grunnlag: MirrorResultat = {
    subscriptionId,
    kalender: sub.calendarName,
    lagret: 0,
    slettet: 0,
    hoppetOver: 0,
    fullSync: false,
    endringer: [],
  };

  // Speiling styres av visIKalender (ikke syncPull — den styrer om kalenderen
  // BLOKKERER booking). Slås visning av, ryddes gamle rader bort så de ikke
  // blir liggende igjen i kalenderen.
  if (!sub.active || !sub.visIKalender) {
    const { count } = await prisma.googleCalendarEvent.deleteMany({
      where: { subscriptionId },
    });
    return { ...grunnlag, slettet: count };
  }

  if (sub.connection.status === "PAUSED") {
    return { ...grunnlag, feil: "Tilkobling er pauset" };
  }

  const brukToken = !tvingFull && sub.syncToken !== null;
  const vindu = beregnVindu();

  try {
    const resultat = await hentOgLagre(
      sub.connection,
      subscriptionId,
      sub.googleCalendarId,
      brukToken ? sub.syncToken : null,
      vindu,
    );

    await prisma.googleCalendarSubscription.update({
      where: { id: subscriptionId },
      data: {
        syncToken: resultat.nesteSyncToken,
        lastSyncAt: new Date(),
        lastError: null,
        ...(brukToken ? {} : { mirrorFrom: vindu.fra, mirrorTo: vindu.til }),
      },
    });

    return {
      ...grunnlag,
      lagret: resultat.lagret,
      slettet: resultat.slettet,
      hoppetOver: resultat.hoppetOver,
      fullSync: !brukToken,
      endringer: resultat.endringer,
    };
  } catch (err) {
    const melding = err instanceof Error ? err.message : String(err);

    // 410 GONE: syncToken er for gammelt (Google beholder dem ~7 dager).
    // Nullstill og kjør full sync én gang — ikke rekursivt i det uendelige.
    const erUtgaattToken =
      /410|fullSyncRequired|Sync token is no longer valid/i.test(melding);
    if (erUtgaattToken && brukToken) {
      console.warn(
        `[gcal-mirror] syncToken utgått for ${sub.calendarName} — full re-sync`,
      );
      await prisma.googleCalendarSubscription.update({
        where: { id: subscriptionId },
        data: { syncToken: null },
      });
      return syncSubscriptionEvents(subscriptionId, true);
    }

    console.error(`[gcal-mirror] sync feilet for ${sub.calendarName}`, melding);
    await prisma.googleCalendarSubscription.update({
      where: { id: subscriptionId },
      data: { lastError: melding.slice(0, 500) },
    });
    return { ...grunnlag, feil: melding };
  }
}

function beregnVindu(): { fra: Date; til: Date } {
  const naa = new Date();
  const fra = new Date(naa);
  fra.setMonth(fra.getMonth() - VINDU_MND_BAK);
  const til = new Date(naa);
  til.setMonth(til.getMonth() + VINDU_MND_FRAM);
  return { fra, til };
}

async function hentOgLagre(
  connection: GoogleCalendarConnection,
  subscriptionId: string,
  googleCalendarId: string,
  syncToken: string | null,
  vindu: { fra: Date; til: Date },
): Promise<{
  lagret: number;
  slettet: number;
  hoppetOver: number;
  nesteSyncToken: string | null;
  endringer: HendelsesEndring[];
}> {
  const calendar = getCalendarApi(connection);

  let lagret = 0;
  let slettet = 0;
  let hoppetOver = 0;
  let pageToken: string | undefined;
  let nesteSyncToken: string | null = null;
  let sider = 0;
  const endringer: HendelsesEndring[] = [];

  do {
    sider++;
    if (sider > MAKS_SIDER) {
      console.warn(
        `[gcal-mirror] stoppet ved ${MAKS_SIDER} sider for ${googleCalendarId} — ufullstendig sync`,
      );
      break;
    }

    // syncToken kan IKKE kombineres med timeMin/timeMax — Google avviser det.
    // Ved token-basert sync filtrerer vi i stedet på vinduet ved lagring.
    const params: calendar_v3.Params$Resource$Events$List = syncToken
      ? {
          calendarId: googleCalendarId,
          syncToken,
          singleEvents: true,
          showDeleted: true,
          maxResults: SIDE_STORRELSE,
          pageToken,
        }
      : {
          calendarId: googleCalendarId,
          timeMin: vindu.fra.toISOString(),
          timeMax: vindu.til.toISOString(),
          singleEvents: true,
          showDeleted: false,
          maxResults: SIDE_STORRELSE,
          pageToken,
        };

    const res = await calendar.events.list(params);
    const items = res.data.items ?? [];

    for (const event of items) {
      const { utfall, endring } = await lagreEnHendelse(
        subscriptionId,
        event,
        vindu,
      );
      if (utfall === "lagret") lagret++;
      else if (utfall === "slettet") slettet++;
      else hoppetOver++;
      if (endring) endringer.push(endring);
    }

    pageToken = res.data.nextPageToken ?? undefined;
    if (res.data.nextSyncToken) nesteSyncToken = res.data.nextSyncToken;
  } while (pageToken);

  return { lagret, slettet, hoppetOver, nesteSyncToken, endringer };
}

type Utfall = "lagret" | "slettet" | "hoppetOver";

interface LagreUtfall {
  utfall: Utfall;
  /** Satt kun når hendelsen faktisk ble endret — driver booking-refleksjon. */
  endring?: HendelsesEndring;
}

async function lagreEnHendelse(
  subscriptionId: string,
  event: calendar_v3.Schema$Event,
  vindu: { fra: Date; til: Date },
): Promise<LagreUtfall> {
  const googleEventId = event.id;
  if (!googleEventId) return { utfall: "hoppetOver" };

  // Google melder slettede hendelser som status=cancelled (kun ved showDeleted).
  // Endringen rapporteres uansett om vi hadde raden lokalt: bookingen kan
  // eksistere selv om speilingen ikke rakk å fange hendelsen først.
  if (event.status === "cancelled") {
    const { count } = await prisma.googleCalendarEvent.deleteMany({
      where: { subscriptionId, googleEventId },
    });
    return {
      utfall: count > 0 ? "slettet" : "hoppetOver",
      endring: { googleEventId, type: "slettet" },
    };
  }

  const start = parseGoogleTidspunkt(event.start ?? undefined);
  const slutt = parseGoogleTidspunkt(event.end ?? undefined);
  if (!start || !slutt) return { utfall: "hoppetOver" };

  // Utenfor speilingsvinduet: ikke lagre, og fjern hvis den lå der fra før
  // (typisk når en avtale flyttes langt fram/tilbake i tid).
  if (slutt.tid < vindu.fra || start.tid > vindu.til) {
    const { count } = await prisma.googleCalendarEvent.deleteMany({
      where: { subscriptionId, googleEventId },
    });
    // Flyttet ut av vinduet er en ekte endring for en eventuell booking —
    // rapporter tidene så refleksjonen kan følge med.
    return {
      utfall: count > 0 ? "slettet" : "hoppetOver",
      endring: {
        googleEventId,
        type: "endret",
        startAt: start.tid,
        endAt: slutt.tid,
      },
    };
  }

  const googleUpdatedAt = event.updated ? new Date(event.updated) : null;

  // Loop-vern: hvis vi allerede har en versjon som er like ny eller nyere,
  // ikke skriv. Hindrer at vår egen push → webhook → speiling lager støy.
  const eksisterende = await prisma.googleCalendarEvent.findUnique({
    where: { subscriptionId_googleEventId: { subscriptionId, googleEventId } },
    select: { id: true, googleUpdatedAt: true },
  });
  if (
    eksisterende &&
    googleUpdatedAt &&
    eksisterende.googleUpdatedAt &&
    eksisterende.googleUpdatedAt >= googleUpdatedAt
  ) {
    return { utfall: "hoppetOver" };
  }

  // Er dette en booking vi selv har pushet? Da merkes speilraden, slik at
  // kalenderen kan vise booking-raden (med lenke til /admin/bookinger) i
  // stedet for å tegne samme avtale to ganger.
  const booking = await prisma.booking.findFirst({
    where: { googleEventId },
    select: { id: true },
  });

  const data = {
    iCalUid: event.iCalUID ?? null,
    summary: tittelFor(event),
    description: event.description ?? null,
    location: event.location ?? null,
    startAt: start.tid,
    endAt: slutt.tid,
    allDay: start.heldag,
    status: event.status ?? "confirmed",
    transparency: event.transparency ?? "opaque",
    recurringEventId: event.recurringEventId ?? null,
    htmlLink: event.htmlLink ?? null,
    googleUpdatedAt,
    bookingId: booking?.id ?? null,
  };

  await prisma.googleCalendarEvent.upsert({
    where: { subscriptionId_googleEventId: { subscriptionId, googleEventId } },
    create: { subscriptionId, googleEventId, ...data },
    update: data,
  });

  return {
    utfall: "lagret",
    endring: {
      googleEventId,
      type: "endret",
      startAt: start.tid,
      endAt: slutt.tid,
    },
  };
}

/**
 * Speil alle aktive pull-kalendere for én coach. Brukes av cron og av
 * «hent alt på nytt»-knappen i innstillinger.
 */
export async function syncAlleKalendereForBruker(
  userId: string,
  tvingFull = false,
): Promise<MirrorResultat[]> {
  const conn = await prisma.googleCalendarConnection.findUnique({
    where: { userId },
    include: {
      subscriptions: {
        where: { active: true, visIKalender: true },
        select: { id: true },
      },
    },
  });
  if (!conn || conn.status === "PAUSED") return [];

  const resultater: MirrorResultat[] = [];
  for (const sub of conn.subscriptions) {
    resultater.push(await syncSubscriptionEvents(sub.id, tvingFull));
  }
  return resultater;
}

/**
 * Hent speilede hendelser i et tidsrom for én bruker.
 *
 * Dedupliserer på iCalUID: samme avtale kan ligge i flere av coachens
 * kalendere (Anders har f.eks. samme treningsplan i både «Personal» og
 * «Personal - Utvikling»). Første treff vinner — kalenderne er sortert
 * stabilt på navn så valget er forutsigbart.
 *
 * Hendelser som speiler en app-booking utelates: de tegnes allerede fra
 * Booking-tabellen med riktig lenke og status.
 */
export async function hentSpeiledeHendelser(
  userId: string,
  fra: Date,
  til: Date,
): Promise<
  Array<{
    id: string;
    summary: string;
    description: string | null;
    location: string | null;
    startAt: Date;
    endAt: Date;
    allDay: boolean;
    transparency: string;
    htmlLink: string | null;
    kalenderNavn: string;
    kalenderFarge: string | null;
  }>
> {
  const conn = await prisma.googleCalendarConnection.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!conn) return [];

  const rader = await prisma.googleCalendarEvent.findMany({
    where: {
      subscription: { connectionId: conn.id, active: true, visIKalender: true },
      startAt: { lt: til },
      endAt: { gt: fra },
      bookingId: null,
    },
    select: {
      id: true,
      iCalUid: true,
      summary: true,
      description: true,
      location: true,
      startAt: true,
      endAt: true,
      allDay: true,
      transparency: true,
      htmlLink: true,
      subscription: { select: { calendarName: true, color: true } },
    },
    orderBy: [{ startAt: "asc" }],
  });

  const sett = new Set<string>();
  const ut: Array<{
    id: string;
    summary: string;
    description: string | null;
    location: string | null;
    startAt: Date;
    endAt: Date;
    allDay: boolean;
    transparency: string;
    htmlLink: string | null;
    kalenderNavn: string;
    kalenderFarge: string | null;
  }> = [];

  for (const r of rader) {
    // Dedupe-nøkkel: iCalUID når den finnes, ellers tittel+tid (samme avtale
    // manuelt lagt i to kalendere har ulik iCalUID, men lik tittel og tid).
    const nokkel = r.iCalUid
      ? `uid:${r.iCalUid}`
      : `tid:${r.summary}|${r.startAt.toISOString()}|${r.endAt.toISOString()}`;
    if (sett.has(nokkel)) continue;
    sett.add(nokkel);

    ut.push({
      id: r.id,
      summary: r.summary,
      description: r.description,
      location: r.location,
      startAt: r.startAt,
      endAt: r.endAt,
      allDay: r.allDay,
      transparency: r.transparency,
      htmlLink: r.htmlLink,
      kalenderNavn: r.subscription.calendarName,
      kalenderFarge: r.subscription.color,
    });
  }

  return ut;
}
