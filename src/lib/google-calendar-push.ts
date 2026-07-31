/**
 * Push fra AgencyOS ut til Google Calendar (steg 3, 2026-07-27).
 *
 * Før: kun Booking ble pushet, og bare én event-id ble lagret uansett hvor
 * mange push-kalendere coachen hadde. Nå kan fire kildetyper pushes —
 * bookinger, kalenderhendelser (ferie/stengt/møte), gruppetimer og
 * treningsøkter — og hver (kalender, kilde) får sin egen rad i
 * PushedCalendarEvent, så alt kan oppdateres og ryddes bort igjen.
 *
 * TID (kritisk): interne tider er «naiv veggklokke» (se google-calendar-tid.ts).
 * Google får dem som lokal tid uten offset + timeZone: "Europe/Oslo".
 * Tidligere ble `toISOString()` sendt — med Z — som fikk Google til å tolke
 * tiden som UTC og vise avtalen to timer feil om sommeren.
 */
import type { calendar_v3 } from "googleapis";
import { prisma } from "@/lib/prisma";
import { getCalendarApi } from "@/lib/google-calendar";
import type { GoogleCalendarConnection } from "@/generated/prisma/client";
import { fraNaivVeggklokke, tilHeldagsDato } from "@/lib/google-calendar-tid";

export type PushKildeType =
  | "BOOKING"
  | "CALENDAR_EVENT"
  | "GROUP_SCHEDULE"
  | "TRAINING_SESSION";

export interface PushKilde {
  type: PushKildeType;
  id: string;
  summary: string;
  description?: string | null;
  location?: string | null;
  /** Naiv veggklokke — samme konvensjon som resten av kodebasen. */
  startAt: Date;
  endAt: Date;
  /** Heldagshendelse (ferie o.l.) — sendes som date, ikke dateTime. */
  heldag?: boolean;
  attendee?: { email: string; navn?: string | null } | null;
}

export interface PushResultat {
  /** Antall kalendere hendelsen ble skrevet til. */
  skrevet: number;
  /** Antall kalendere som feilet (logget, ikke kastet). */
  feilet: number;
  /** Ingen aktive push-kalendere / ingen tilkobling. */
  hoppetOver: boolean;
}

const TOM: PushResultat = { skrevet: 0, feilet: 0, hoppetOver: true };

async function hentAktivTilkobling(
  coachUserId: string,
): Promise<GoogleCalendarConnection | null> {
  const conn = await prisma.googleCalendarConnection.findUnique({
    where: { userId: coachUserId },
  });
  if (!conn || conn.status !== "ACTIVE") return null;
  return conn;
}

/** Bygg Google-eventet. Heldag bruker date, ellers dateTime + timeZone. */
function byggEvent(kilde: PushKilde): calendar_v3.Schema$Event {
  const tid: Pick<calendar_v3.Schema$Event, "start" | "end"> = kilde.heldag
    ? {
        start: { date: tilHeldagsDato(kilde.startAt) },
        end: { date: tilHeldagsDato(kilde.endAt) },
      }
    : {
        start: {
          dateTime: fraNaivVeggklokke(kilde.startAt),
          timeZone: "Europe/Oslo",
        },
        end: {
          dateTime: fraNaivVeggklokke(kilde.endAt),
          timeZone: "Europe/Oslo",
        },
      };

  return {
    summary: kilde.summary,
    description: kilde.description ?? undefined,
    location: kilde.location ?? undefined,
    ...tid,
    attendees: kilde.attendee
      ? [
          {
            email: kilde.attendee.email,
            displayName: kilde.attendee.navn ?? undefined,
          },
        ]
      : undefined,
    // Kilde-merking gjør det mulig å kjenne igjen egne hendelser i Google
    // uavhengig av vår egen database.
    extendedProperties: {
      private: {
        akgolfKildeType: kilde.type,
        akgolfKildeId: kilde.id,
      },
    },
  };
}

/**
 * Push én kilde til alle coachens aktive push-kalendere.
 * Oppretter der den mangler, oppdaterer der den finnes.
 */
export async function pushKildeTilGoogle(
  coachUserId: string,
  kilde: PushKilde,
): Promise<PushResultat> {
  const conn = await hentAktivTilkobling(coachUserId);
  if (!conn) return TOM;

  const pushSubs = await prisma.googleCalendarSubscription.findMany({
    where: { connectionId: conn.id, syncPush: true, active: true },
    select: { id: true, googleCalendarId: true },
  });
  if (pushSubs.length === 0) return TOM;

  const calendar = getCalendarApi(conn);
  const event = byggEvent(kilde);
  const eksisterende = await prisma.pushedCalendarEvent.findMany({
    where: { kildeType: kilde.type, kildeId: kilde.id },
    select: { subscriptionId: true, googleEventId: true },
  });
  const perSub = new Map(
    eksisterende.map((e) => [e.subscriptionId, e.googleEventId]),
  );

  let skrevet = 0;
  let feilet = 0;

  for (const sub of pushSubs) {
    const kjentEventId = perSub.get(sub.id);
    try {
      const googleEventId = kjentEventId
        ? await oppdaterEllerGjenopprett(
            calendar,
            sub.googleCalendarId,
            kjentEventId,
            event,
          )
        : ((
            await calendar.events.insert({
              calendarId: sub.googleCalendarId,
              requestBody: event,
            })
          ).data.id ?? null);

      if (!googleEventId) {
        feilet++;
        continue;
      }

      await prisma.pushedCalendarEvent.upsert({
        where: {
          subscriptionId_kildeType_kildeId: {
            subscriptionId: sub.id,
            kildeType: kilde.type,
            kildeId: kilde.id,
          },
        },
        create: {
          subscriptionId: sub.id,
          googleEventId,
          kildeType: kilde.type,
          kildeId: kilde.id,
          startAt: kilde.startAt,
          endAt: kilde.endAt,
        },
        update: {
          googleEventId,
          startAt: kilde.startAt,
          endAt: kilde.endAt,
          sistPushetAt: new Date(),
        },
      });
      skrevet++;
    } catch (err) {
      feilet++;
      console.error(
        `[gcal-push] ${kilde.type}:${kilde.id} → ${sub.googleCalendarId} feilet`,
        err instanceof Error ? err.message : err,
      );
      // Fortsett til neste kalender — én feilende kalender skal ikke
      // blokkere de andre.
    }
  }

  return { skrevet, feilet, hoppetOver: false };
}

/**
 * Oppdater et kjent event. Er det slettet manuelt i Google (404/410),
 * opprett det på nytt i stedet for å feile.
 */
async function oppdaterEllerGjenopprett(
  calendar: calendar_v3.Calendar,
  calendarId: string,
  eventId: string,
  event: calendar_v3.Schema$Event,
): Promise<string | null> {
  try {
    const res = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: event,
    });
    return res.data.id ?? eventId;
  } catch (err) {
    const melding = err instanceof Error ? err.message : String(err);
    if (/404|410|Not Found|deleted/i.test(melding)) {
      const res = await calendar.events.insert({
        calendarId,
        requestBody: event,
      });
      return res.data.id ?? null;
    }
    throw err;
  }
}

/**
 * Fjern en kilde fra alle Google-kalendere den er pushet til.
 * Kalles når en økt/hendelse slettes eller avlyses i AgencyOS.
 */
export async function fjernKildeFraGoogle(
  coachUserId: string,
  type: PushKildeType,
  kildeId: string,
): Promise<number> {
  const conn = await hentAktivTilkobling(coachUserId);
  if (!conn) return 0;

  const rader = await prisma.pushedCalendarEvent.findMany({
    where: { kildeType: type, kildeId },
    select: {
      id: true,
      googleEventId: true,
      subscription: { select: { googleCalendarId: true, connectionId: true } },
    },
  });
  if (rader.length === 0) return 0;

  const calendar = getCalendarApi(conn);
  let slettet = 0;

  for (const rad of rader) {
    // Rør kun kalendere som tilhører denne coachens tilkobling.
    if (rad.subscription.connectionId !== conn.id) continue;
    try {
      await calendar.events.delete({
        calendarId: rad.subscription.googleCalendarId,
        eventId: rad.googleEventId,
      });
      slettet++;
    } catch (err) {
      const melding = err instanceof Error ? err.message : String(err);
      // Allerede borte i Google er et greit utfall — vi skal uansett fjerne
      // koblingen lokalt.
      if (!/404|410|Not Found|deleted/i.test(melding)) {
        console.error(
          `[gcal-push] sletting feilet for ${type}:${kildeId}`,
          melding,
        );
      }
    }
    await prisma.pushedCalendarEvent.delete({ where: { id: rad.id } });
  }

  return slettet;
}
