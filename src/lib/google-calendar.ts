/**
 * Google Calendar 2-way sync for coach-bookinger — multi-kalender.
 *
 * En coach kan ha flere kalendere koblet til Google-kontoen. Hver kalender
 * (GoogleCalendarSubscription) har egen push/pull-toggle:
 *
 *   - syncPush=true: nye bookinger pushes hit som event
 *   - syncPull=true: events herfra blokkerer ledige slots
 *
 * For pull-kalendere setter vi opp Google Push Notifications (watch) slik at
 * vi får webhook ved endring — som lar oss reflektere endringer/sletting
 * tilbake i Booking-tabellen (two-way sync).
 *
 * Refresh-token er kryptert (AES-256-GCM) med GOOGLE_TOKEN_ENCRYPTION_KEY.
 */
import { google, type calendar_v3 } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  randomUUID,
} from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { GoogleCalendarConnection } from "@/generated/prisma/client";

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_OAUTH_REDIRECT_URI;
const ENCRYPTION_KEY_HEX = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;

export const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
  "openid",
  "email",
];

// Utvidede scopes for Meg-assistenten (kun Anders re-godkjenner disse).
// Coach-booking-flyten bruker fortsatt SCOPES — ikke endre den.
export const MEG_GOOGLE_SCOPES = [
  ...SCOPES,
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.file",
];

export function getEncryptionKey(): Buffer {
  if (!ENCRYPTION_KEY_HEX || ENCRYPTION_KEY_HEX.length !== 64) {
    throw new Error("GOOGLE_TOKEN_ENCRYPTION_KEY må være 64 hex-tegn (32 byte)");
  }
  return Buffer.from(ENCRYPTION_KEY_HEX, "hex");
}

export function encryptToken(plain: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), ciphertext.toString("base64"), tag.toString("base64")].join(".");
}

export function decryptToken(cipherStr: string): string {
  const key = getEncryptionKey();
  const [ivB64, ctB64, tagB64] = cipherStr.split(".");
  if (!ivB64 || !ctB64 || !tagB64) throw new Error("Ugyldig kryptert token-format");
  const iv = Buffer.from(ivB64, "base64");
  const ciphertext = Buffer.from(ctB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plain.toString("utf8");
}

export function getOAuth2Client(): OAuth2Client {
  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    throw new Error("Google OAuth env-vars mangler");
  }
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

/**
 * Hent autorisasjons-URL for å starte OAuth-flyt.
 */
export function getAuthUrl(state: string, scopes: string[] = SCOPES): string {
  const oauth = getOAuth2Client();
  return oauth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
    state,
  });
}

/**
 * Bytt authorization code for access + refresh token.
 */
export async function exchangeCode(code: string) {
  const oauth = getOAuth2Client();
  const { tokens } = await oauth.getToken(code);
  return tokens;
}

/**
 * HMAC-signering brukt til webhook-token (X-Goog-Channel-Token).
 */
export function signWebhookToken(channelId: string): string {
  const secret = process.env.GOOGLE_WEBHOOK_TOKEN_SECRET;
  if (!secret) throw new Error("GOOGLE_WEBHOOK_TOKEN_SECRET mangler");
  return createHmac("sha256", secret).update(channelId).digest("hex");
}

/**
 * Lag autentisert Calendar API-klient for en tilkobling.
 * Tar inn connection direkte for å unngå dobbeltlookup.
 */
export function getCalendarApi(connection: GoogleCalendarConnection): calendar_v3.Calendar {
  const refreshToken = decryptToken(connection.refreshTokenCipher);
  const oauth = getOAuth2Client();
  oauth.setCredentials({ refresh_token: refreshToken });
  return google.calendar({ version: "v3", auth: oauth });
}

/**
 * Hent connection for en bruker hvis aktiv, ellers null.
 */
async function getActiveConnection(userId: string): Promise<GoogleCalendarConnection | null> {
  const conn = await prisma.googleCalendarConnection.findUnique({
    where: { userId },
  });
  if (!conn || conn.status !== "ACTIVE") return null;
  return conn;
}

/**
 * Hent travle tidsperioder fra alle PULL-kalendere coachen har aktivert.
 * Returnerer kombinert liste — duplikater er OK (filtreres ikke).
 */
export async function getCalendarBusy(
  userId: string,
  from: Date,
  to: Date,
): Promise<{ start: Date; end: Date }[]> {
  const conn = await getActiveConnection(userId);
  if (!conn) return [];

  const subs = await prisma.googleCalendarSubscription.findMany({
    where: { connectionId: conn.id, syncPull: true, active: true },
  });
  if (subs.length === 0) return [];

  const calendar = getCalendarApi(conn);
  const all: { start: Date; end: Date }[] = [];
  let nokenSuksess = false;

  for (const sub of subs) {
    try {
      const res = await calendar.freebusy.query({
        requestBody: {
          timeMin: from.toISOString(),
          timeMax: to.toISOString(),
          items: [{ id: sub.googleCalendarId }],
        },
      });
      const busy = res.data.calendars?.[sub.googleCalendarId]?.busy ?? [];
      for (const b of busy) {
        if (b.start && b.end) {
          all.push({ start: new Date(b.start), end: new Date(b.end) });
        }
      }
      nokenSuksess = true;
      await prisma.googleCalendarSubscription.update({
        where: { id: sub.id },
        data: { lastSyncAt: new Date(), lastError: null },
      });
    } catch (err) {
      const melding = err instanceof Error ? err.message : "unknown";
      console.error(`[google-calendar] freebusy failed for ${sub.googleCalendarId}`, melding);
      await prisma.googleCalendarSubscription.update({
        where: { id: sub.id },
        data: { lastError: melding.slice(0, 500) },
      });
    }
  }

  if (nokenSuksess) {
    await prisma.googleCalendarConnection.update({
      where: { id: conn.id },
      data: { lastSyncAt: new Date(), lastError: null, status: "ACTIVE" },
    });
  }

  return all;
}

/**
 * Push booking til ALLE coachens PUSH-kalendere. Oppretter event per kalender,
 * eller oppdaterer hvis Booking.googleEventId allerede er satt.
 *
 * Implementasjonsmerknad: I dag lagrer vi kun ÉN event-ID på Booking. Hvis
 * coach har flere PUSH-kalendere skriver vi event-ID fra den FØRSTE som ble
 * opprettet. Endringer/sletting fra app pusher kun til den. Dette er
 * pragmatisk — multi-event-ID per booking krever egen relasjons-tabell, og
 * de fleste coacher har bare én PUSH-kalender (sin egen jobb-kalender).
 *
 * Returnerer event-ID hvis minst én push lyktes, ellers null.
 */
export async function pushBookingToCalendar(bookingId: string): Promise<string | null> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: { select: { name: true, email: true } },
      serviceType: {
        select: { name: true, coachUserId: true, durationMin: true },
      },
      location: { select: { name: true, address: true } },
    },
  });
  if (!booking) return null;
  if (!booking.serviceType.coachUserId) return null;

  const conn = await getActiveConnection(booking.serviceType.coachUserId);
  if (!conn) return null;

  const pushSubs = await prisma.googleCalendarSubscription.findMany({
    where: { connectionId: conn.id, syncPush: true, active: true },
  });
  if (pushSubs.length === 0) return null;

  const calendar = getCalendarApi(conn);

  const userName = booking.user?.name ?? "Gjest";
  const userEmail = booking.user?.email ?? null;
  const summary = `${booking.serviceType.name} — ${userName}`;
  const description = [
    userEmail ? `Spiller: ${userName} (${userEmail})` : `Spiller: ${userName}`,
    booking.notes ? `Notater: ${booking.notes}` : null,
    `Booket via AK Golf Platform`,
  ]
    .filter(Boolean)
    .join("\n");

  const event: calendar_v3.Schema$Event = {
    summary,
    description,
    location: `${booking.location.name}, ${booking.location.address}`,
    start: { dateTime: booking.startAt.toISOString(), timeZone: "Europe/Oslo" },
    end: { dateTime: booking.endAt.toISOString(), timeZone: "Europe/Oslo" },
    attendees: userEmail ? [{ email: userEmail, displayName: userName }] : [],
  };

  let primaryEventId: string | null = booking.googleEventId;

  for (const sub of pushSubs) {
    try {
      if (primaryEventId && sub === pushSubs[0]) {
        // Oppdater eksisterende event i primær push-kalender
        await calendar.events.update({
          calendarId: sub.googleCalendarId,
          eventId: primaryEventId,
          requestBody: event,
        });
      } else {
        const res = await calendar.events.insert({
          calendarId: sub.googleCalendarId,
          requestBody: event,
        });
        const id = res.data.id ?? null;
        // Lagre første event-ID på Booking
        if (id && !primaryEventId) {
          primaryEventId = id;
          await prisma.booking.update({
            where: { id: booking.id },
            data: { googleEventId: id },
          });
        }
      }
    } catch (err) {
      console.error(
        `[google-calendar] push failed for ${sub.googleCalendarId}`,
        err instanceof Error ? err.message : err,
      );
      // Fortsett med neste sub — én feilet sub skal ikke blokkere de andre.
    }
  }

  return primaryEventId;
}

/**
 * Slett event fra alle coachens PUSH-kalendere når booking avbestilles.
 * Best-effort — feil per kalender stopper ikke loopen.
 */
export async function removeFromCalendar(
  coachUserId: string,
  googleEventId: string,
): Promise<boolean> {
  const conn = await getActiveConnection(coachUserId);
  if (!conn) return false;

  const pushSubs = await prisma.googleCalendarSubscription.findMany({
    where: { connectionId: conn.id, syncPush: true, active: true },
  });
  if (pushSubs.length === 0) return false;

  const calendar = getCalendarApi(conn);
  let suksess = false;

  for (const sub of pushSubs) {
    try {
      await calendar.events.delete({
        calendarId: sub.googleCalendarId,
        eventId: googleEventId,
      });
      suksess = true;
    } catch (err) {
      // Eventet eksisterer ofte ikke i alle kalendere — det er forventet.
      const melding = err instanceof Error ? err.message : String(err);
      if (!melding.includes("Resource has been deleted") && !melding.includes("Not Found")) {
        console.error(
          `[google-calendar] delete failed for ${sub.googleCalendarId}`,
          melding,
        );
      }
    }
  }
  return suksess;
}

/**
 * Hent kalender-liste fra Google og upsert subscriptions.
 *
 * Default-regler:
 *   - accessRole=owner → syncPush=true, syncPull=true (sin egen kalender)
 *   - accessRole=writer/reader → syncPush=false, syncPull=true (delte)
 *   - accessRole=freeBusyReader → hopp over (kun travelhet, lite verdi)
 *
 * For EKSISTERENDE subscriptions oppdaterer vi kun visningsdata (navn, farge,
 * beskrivelse) — bruker-toggler beholdes.
 */
export async function syncCalendarList(connectionId: string): Promise<{
  found: number;
  upserted: number;
  skipped: number;
}> {
  const connection = await prisma.googleCalendarConnection.findUnique({
    where: { id: connectionId },
  });
  if (!connection) throw new Error("Tilkobling ikke funnet");

  const calendar = getCalendarApi(connection);
  const res = await calendar.calendarList.list({ maxResults: 250 });
  const items = res.data.items ?? [];

  let upserted = 0;
  let skipped = 0;

  for (const item of items) {
    if (!item.id) continue;
    if (item.accessRole === "freeBusyReader") {
      skipped++;
      continue;
    }
    const isOwner = item.accessRole === "owner";
    await prisma.googleCalendarSubscription.upsert({
      where: {
        connectionId_googleCalendarId: {
          connectionId,
          googleCalendarId: item.id,
        },
      },
      create: {
        connectionId,
        googleCalendarId: item.id,
        calendarName: item.summary ?? item.id,
        description: item.description ?? null,
        color: item.backgroundColor ?? null,
        syncPush: isOwner,
        syncPull: true,
        active: true,
      },
      update: {
        // Behold bruker-toggler, oppdater kun visningsdata
        calendarName: item.summary ?? item.id,
        description: item.description ?? null,
        color: item.backgroundColor ?? null,
      },
    });
    upserted++;
  }

  return { found: items.length, upserted, skipped };
}

/**
 * Sett opp Google Push Notifications (watch) for en subscription.
 * Returnerer { channelId, resourceId, expiration } ved suksess.
 *
 * Google forplikter watch-channels å gå ut etter maks 7 dager — vi setter
 * eksplisitt 7 dager og forventer at cron fornyer dem.
 */
export async function setupWatchForSubscription(
  subscriptionId: string,
): Promise<{ channelId: string; resourceId: string; expiresAt: Date } | null> {
  const sub = await prisma.googleCalendarSubscription.findUnique({
    where: { id: subscriptionId },
    include: { connection: true },
  });
  if (!sub) return null;
  if (!sub.syncPull || !sub.active) return null;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    console.error("[google-calendar] NEXT_PUBLIC_APP_URL mangler — kan ikke registrere watch");
    return null;
  }
  // Google krever https for webhook-adresse
  if (!baseUrl.startsWith("https://")) {
    console.warn(`[google-calendar] hopper over watch — NEXT_PUBLIC_APP_URL er ikke https: ${baseUrl}`);
    return null;
  }

  const calendar = getCalendarApi(sub.connection);
  const channelId = randomUUID();
  const expirationMs = Date.now() + 7 * 24 * 60 * 60 * 1000;

  try {
    const res = await calendar.events.watch({
      calendarId: sub.googleCalendarId,
      requestBody: {
        id: channelId,
        type: "web_hook",
        address: `${baseUrl}/api/google-calendar/webhook`,
        expiration: String(expirationMs),
        token: signWebhookToken(channelId),
      },
    });

    const resourceId = res.data.resourceId ?? null;
    const expiration = res.data.expiration ? Number(res.data.expiration) : expirationMs;
    if (!resourceId) {
      console.error(`[google-calendar] watch returnerte ingen resourceId for ${sub.googleCalendarId}`);
      return null;
    }
    const expiresAt = new Date(expiration);

    await prisma.googleCalendarSubscription.update({
      where: { id: sub.id },
      data: {
        watchChannelId: channelId,
        watchResourceId: resourceId,
        watchExpiresAt: expiresAt,
      },
    });

    return { channelId, resourceId, expiresAt };
  } catch (err) {
    const melding = err instanceof Error ? err.message : "unknown";
    console.error(`[google-calendar] watch.insert failed for ${sub.googleCalendarId}`, melding);
    await prisma.googleCalendarSubscription.update({
      where: { id: sub.id },
      data: { lastError: melding.slice(0, 500) },
    });
    return null;
  }
}

/**
 * Stopp en eksisterende watch-kanal (kalles før fornyelse eller når
 * subscription deaktiveres).
 */
export async function stopWatchForSubscription(subscriptionId: string): Promise<boolean> {
  const sub = await prisma.googleCalendarSubscription.findUnique({
    where: { id: subscriptionId },
    include: { connection: true },
  });
  if (!sub || !sub.watchChannelId || !sub.watchResourceId) return false;

  const calendar = getCalendarApi(sub.connection);
  try {
    await calendar.channels.stop({
      requestBody: {
        id: sub.watchChannelId,
        resourceId: sub.watchResourceId,
      },
    });
    await prisma.googleCalendarSubscription.update({
      where: { id: sub.id },
      data: {
        watchChannelId: null,
        watchResourceId: null,
        watchExpiresAt: null,
      },
    });
    return true;
  } catch (err) {
    // Hvis kanalen allerede er utløpt får vi 404 — det er OK.
    console.warn(
      `[google-calendar] channels.stop feilet (ofte OK):`,
      err instanceof Error ? err.message : err,
    );
    await prisma.googleCalendarSubscription.update({
      where: { id: sub.id },
      data: { watchChannelId: null, watchResourceId: null, watchExpiresAt: null },
    });
    return false;
  }
}

/**
 * Generer en tilfeldig 32-byte hex-nøkkel — brukes hvis
 * GOOGLE_TOKEN_ENCRYPTION_KEY ikke er satt ennå.
 */
export function generateEncryptionKey(): string {
  return randomBytes(32).toString("hex");
}
