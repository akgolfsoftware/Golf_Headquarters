/**
 * Rediger Google-hendelser fra AgencyOS (steg 4, 2026-07-27).
 *
 * Steg 1–3 ga lesing (speiling) og skriving av APPENS egne økter. Her lukkes
 * sirkelen: en hendelse som ligger i Google kan endres, flyttes eller slettes
 * direkte fra AgencyOS-kalenderen — og du kan opprette en ny hendelse i hvilken
 * som helst av kalenderne dine uten å bytte app.
 *
 * Speilet oppdateres med en gang skrivingen til Google lykkes, så kalenderen
 * viser endringen umiddelbart i stedet for å vente på neste synk.
 *
 * Eierskap valideres i hver funksjon: du kan bare røre kalendere som henger
 * under din egen Google-tilkobling.
 */
import { prisma } from "@/lib/prisma";
import { getCalendarApi } from "@/lib/google-calendar";
import {
  fraNaivVeggklokke,
  tilHeldagsDato,
  parseGoogleTidspunkt,
} from "@/lib/google-calendar-tid";
import type { calendar_v3 } from "googleapis";

export interface HendelseFelter {
  tittel: string;
  /** Naiv veggklokke — samme konvensjon som resten av kodebasen. */
  startAt: Date;
  endAt: Date;
  sted?: string | null;
  notat?: string | null;
  heldag?: boolean;
}

export type RedigerResultat =
  | { ok: true; mirrorId: string }
  | { ok: false; feil: string };

/** Bygg start/end slik Google forventer det (uten offset + timeZone). */
function tidsfelter(
  felter: HendelseFelter,
): Pick<calendar_v3.Schema$Event, "start" | "end"> {
  if (felter.heldag) {
    return {
      start: { date: tilHeldagsDato(felter.startAt) },
      end: { date: tilHeldagsDato(felter.endAt) },
    };
  }
  return {
    start: {
      dateTime: fraNaivVeggklokke(felter.startAt),
      timeZone: "Europe/Oslo",
    },
    end: {
      dateTime: fraNaivVeggklokke(felter.endAt),
      timeZone: "Europe/Oslo",
    },
  };
}

/** Speil et Google-svar inn i den lokale tabellen. */
async function lagreSpeil(
  subscriptionId: string,
  event: calendar_v3.Schema$Event,
): Promise<string | null> {
  if (!event.id) return null;
  const start = parseGoogleTidspunkt(event.start ?? undefined);
  const slutt = parseGoogleTidspunkt(event.end ?? undefined);
  if (!start || !slutt) return null;

  const data = {
    iCalUid: event.iCalUID ?? null,
    summary: event.summary?.trim() || "(uten tittel)",
    description: event.description ?? null,
    location: event.location ?? null,
    startAt: start.tid,
    endAt: slutt.tid,
    allDay: start.heldag,
    status: event.status ?? "confirmed",
    transparency: event.transparency ?? "opaque",
    recurringEventId: event.recurringEventId ?? null,
    htmlLink: event.htmlLink ?? null,
    googleUpdatedAt: event.updated ? new Date(event.updated) : null,
  };

  const rad = await prisma.googleCalendarEvent.upsert({
    where: {
      subscriptionId_googleEventId: {
        subscriptionId,
        googleEventId: event.id,
      },
    },
    create: { subscriptionId, googleEventId: event.id, ...data },
    update: data,
  });
  return rad.id;
}

/** Hent en speilrad og bekreft at den tilhører brukerens tilkobling. */
async function hentEget(userId: string, mirrorId: string) {
  const rad = await prisma.googleCalendarEvent.findUnique({
    where: { id: mirrorId },
    include: {
      subscription: {
        include: { connection: true },
      },
    },
  });
  if (!rad) return null;
  if (rad.subscription.connection.userId !== userId) return null;
  if (rad.subscription.connection.status !== "ACTIVE") return null;
  return rad;
}

/**
 * Opprett en hendelse i en valgfri av brukerens Google-kalendere.
 * Dette er «legg til direkte i kalenderen»-veien — uten å bytte app.
 */
export async function opprettHendelseIGoogle(
  userId: string,
  subscriptionId: string,
  felter: HendelseFelter,
): Promise<RedigerResultat> {
  const sub = await prisma.googleCalendarSubscription.findUnique({
    where: { id: subscriptionId },
    include: { connection: true },
  });
  if (!sub || sub.connection.userId !== userId) {
    return { ok: false, feil: "Ukjent kalender" };
  }
  if (sub.connection.status !== "ACTIVE") {
    return { ok: false, feil: "Google-tilkoblingen er ikke aktiv" };
  }
  if (felter.endAt <= felter.startAt) {
    return { ok: false, feil: "Slutt må være etter start" };
  }

  try {
    const calendar = getCalendarApi(sub.connection);
    const res = await calendar.events.insert({
      calendarId: sub.googleCalendarId,
      requestBody: {
        summary: felter.tittel,
        location: felter.sted ?? undefined,
        description: felter.notat ?? undefined,
        ...tidsfelter(felter),
      },
    });
    const mirrorId = await lagreSpeil(subscriptionId, res.data);
    if (!mirrorId) {
      return { ok: false, feil: "Hendelsen ble opprettet, men kunne ikke speiles" };
    }
    return { ok: true, mirrorId };
  } catch (err) {
    const melding = err instanceof Error ? err.message : String(err);
    console.error("[gcal-rediger] opprett feilet", melding);
    return { ok: false, feil: "Kunne ikke opprette hendelsen i Google" };
  }
}

/**
 * Endre en eksisterende Google-hendelse (tittel, tid, sted, notat).
 *
 * Bruker patch, ikke update: da rører vi kun feltene vi faktisk sender, og
 * lar deltakere, varsler og gjentakelsesregler stå urørt.
 */
export async function oppdaterHendelseIGoogle(
  userId: string,
  mirrorId: string,
  felter: HendelseFelter,
): Promise<RedigerResultat> {
  const rad = await hentEget(userId, mirrorId);
  if (!rad) return { ok: false, feil: "Fant ikke hendelsen" };
  if (felter.endAt <= felter.startAt) {
    return { ok: false, feil: "Slutt må være etter start" };
  }

  try {
    const calendar = getCalendarApi(rad.subscription.connection);
    const res = await calendar.events.patch({
      calendarId: rad.subscription.googleCalendarId,
      eventId: rad.googleEventId,
      requestBody: {
        summary: felter.tittel,
        location: felter.sted ?? null,
        description: felter.notat ?? null,
        ...tidsfelter(felter),
      },
    });
    await lagreSpeil(rad.subscriptionId, res.data);
    return { ok: true, mirrorId };
  } catch (err) {
    const melding = err instanceof Error ? err.message : String(err);
    console.error("[gcal-rediger] oppdater feilet", melding);
    // Slettet i Google i mellomtiden — rydd speilet så kalenderen ikke lyver.
    if (/404|410|Not Found|deleted/i.test(melding)) {
      await prisma.googleCalendarEvent.delete({ where: { id: mirrorId } });
      return { ok: false, feil: "Hendelsen finnes ikke lenger i Google" };
    }
    return { ok: false, feil: "Kunne ikke lagre endringen i Google" };
  }
}

/** Slett en Google-hendelse fra AgencyOS. */
export async function slettHendelseIGoogle(
  userId: string,
  mirrorId: string,
): Promise<RedigerResultat> {
  const rad = await hentEget(userId, mirrorId);
  if (!rad) return { ok: false, feil: "Fant ikke hendelsen" };

  try {
    const calendar = getCalendarApi(rad.subscription.connection);
    await calendar.events.delete({
      calendarId: rad.subscription.googleCalendarId,
      eventId: rad.googleEventId,
    });
  } catch (err) {
    const melding = err instanceof Error ? err.message : String(err);
    // Allerede borte i Google er greit — vi skal uansett fjerne speilet.
    if (!/404|410|Not Found|deleted/i.test(melding)) {
      console.error("[gcal-rediger] slett feilet", melding);
      return { ok: false, feil: "Kunne ikke slette hendelsen i Google" };
    }
  }

  await prisma.googleCalendarEvent.deleteMany({ where: { id: mirrorId } });
  return { ok: true, mirrorId };
}

/** Kalendere brukeren kan opprette hendelser i (skrivetilgang forutsettes). */
export async function hentSkrivbareKalendere(
  userId: string,
): Promise<Array<{ id: string; navn: string; farge: string | null }>> {
  const conn = await prisma.googleCalendarConnection.findUnique({
    where: { userId },
    select: { id: true, status: true },
  });
  if (!conn || conn.status !== "ACTIVE") return [];

  const subs = await prisma.googleCalendarSubscription.findMany({
    where: { connectionId: conn.id, active: true },
    select: { id: true, calendarName: true, color: true },
    orderBy: { calendarName: "asc" },
  });
  return subs.map((s) => ({
    id: s.id,
    navn: s.calendarName.trim(),
    farge: s.color,
  }));
}
