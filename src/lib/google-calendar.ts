/**
 * Google Calendar 2-way sync for coach-bookinger.
 *
 * Funksjoner:
 * - getOauthClient(): OAuth2-klient med refresh-token (per coach)
 * - getCalendarBusy(userId, from, to): hent eksterne events fra coachens kalender
 *   så vi kan ekskludere disse fra ledige slots
 * - pushBookingToCalendar(booking): opprett/oppdater event i coachens kalender
 * - removeFromCalendar(userId, eventId): slett event ved avbestilling
 *
 * Refresh-token er kryptert (AES-256-GCM) med GOOGLE_TOKEN_ENCRYPTION_KEY.
 */
import { google } from "googleapis";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

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

export function getOAuth2Client() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    throw new Error("Google OAuth env-vars mangler");
  }
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

/**
 * Hent autorisasjons-URL for å starte OAuth-flyt.
 */
export function getAuthUrl(state: string): string {
  const oauth = getOAuth2Client();
  return oauth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
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
 * Lag en autentisert Calendar API-klient for en gitt coach.
 * Henter refresh-token fra DB, dekrypterer, og bytter til access-token.
 */
async function getCalendarClient(userId: string) {
  const conn = await prisma.googleCalendarConnection.findUnique({
    where: { userId },
  });
  if (!conn || conn.status !== "ACTIVE") {
    return null;
  }
  const refreshToken = decryptToken(conn.refreshTokenCipher);
  const oauth = getOAuth2Client();
  oauth.setCredentials({ refresh_token: refreshToken });
  const calendar = google.calendar({ version: "v3", auth: oauth });
  return { calendar, connection: conn };
}

/**
 * Hent travle tidsperioder fra coachens Google Calendar i et tidsvindu.
 * Returnerer liste over { start, end }-intervaller.
 */
export async function getCalendarBusy(
  userId: string,
  from: Date,
  to: Date,
): Promise<{ start: Date; end: Date }[]> {
  const client = await getCalendarClient(userId);
  if (!client) return [];

  try {
    const res = await client.calendar.freebusy.query({
      requestBody: {
        timeMin: from.toISOString(),
        timeMax: to.toISOString(),
        items: [{ id: client.connection.calendarId }],
      },
    });
    const busy = res.data.calendars?.[client.connection.calendarId]?.busy ?? [];
    await prisma.googleCalendarConnection.update({
      where: { userId },
      data: { lastSyncAt: new Date(), lastError: null, status: "ACTIVE" },
    });
    return busy
      .filter((b): b is { start: string; end: string } => !!b.start && !!b.end)
      .map((b) => ({ start: new Date(b.start), end: new Date(b.end) }));
  } catch (err) {
    const melding = err instanceof Error ? err.message : "unknown";
    console.error("[google-calendar] getBusy failed", melding);
    await prisma.googleCalendarConnection.update({
      where: { userId },
      data: { lastError: melding.slice(0, 500), status: "ERROR" },
    });
    return [];
  }
}

/**
 * Push booking til coachens Google Calendar. Oppretter nytt event eller
 * oppdaterer eksisterende basert på Booking.googleEventId.
 * Returnerer event-ID hvis vellykket, ellers null.
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

  const client = await getCalendarClient(booking.serviceType.coachUserId);
  if (!client) return null;

  const summary = `${booking.serviceType.name} — ${booking.user.name}`;
  const description = [
    `Spiller: ${booking.user.name} (${booking.user.email})`,
    booking.notes ? `Notater: ${booking.notes}` : null,
    `Booket via AK Golf Platform`,
  ]
    .filter(Boolean)
    .join("\n");

  const event = {
    summary,
    description,
    location: `${booking.location.name}, ${booking.location.address}`,
    start: { dateTime: booking.startAt.toISOString(), timeZone: "Europe/Oslo" },
    end: { dateTime: booking.endAt.toISOString(), timeZone: "Europe/Oslo" },
    attendees: [{ email: booking.user.email, displayName: booking.user.name }],
  };

  try {
    let eventId = booking.googleEventId;
    if (eventId) {
      await client.calendar.events.update({
        calendarId: client.connection.calendarId,
        eventId,
        requestBody: event,
      });
    } else {
      const res = await client.calendar.events.insert({
        calendarId: client.connection.calendarId,
        requestBody: event,
      });
      eventId = res.data.id ?? null;
      if (eventId) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { googleEventId: eventId },
        });
      }
    }
    return eventId;
  } catch (err) {
    console.error("[google-calendar] push failed", err);
    return null;
  }
}

/**
 * Slett event fra Calendar når booking avbestilles.
 */
export async function removeFromCalendar(
  coachUserId: string,
  googleEventId: string,
): Promise<boolean> {
  const client = await getCalendarClient(coachUserId);
  if (!client) return false;
  try {
    await client.calendar.events.delete({
      calendarId: client.connection.calendarId,
      eventId: googleEventId,
    });
    return true;
  } catch (err) {
    console.error("[google-calendar] delete failed", err);
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
