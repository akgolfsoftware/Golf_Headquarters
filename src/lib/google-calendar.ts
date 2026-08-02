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
import { notify } from "@/lib/notifications";
import { logError } from "@/lib/error-tracking";
import type { CalendarBusyResult, Interval } from "@/lib/booking/calendar-result";

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
 * Hent travle tidsperioder fra alle PULL-kalendere coachen har aktivert.
 *
 * Returnerer et CalendarBusyResult som skiller «sjekket OK» fra «klarte IKKE å
 * sjekke». Kallere (booking-tilgjengelighet) skal aldri anta coachen ledig på
 * grunnlag av en mislykket sjekk (fail-closed) — det ville dobbeltbooke mot
 * private avtaler.
 */
export async function getCalendarBusy(
  userId: string,
  from: Date,
  to: Date,
): Promise<CalendarBusyResult> {
  // Hent connection direkte (ikke via getActiveConnection): en connection i
  // status ERROR skal fortsatt forsøkes/rapporteres, ikke maskeres som «ingen
  // kalender» — det ville fail-open-et igjen ved neste kall.
  const conn = await prisma.googleCalendarConnection.findUnique({
    where: { userId },
  });
  // Ingen tilkobling, eller bevisst pauset = ingen kalender-beskyttelse (legitimt).
  if (!conn || conn.status === "PAUSED") return { ok: true, busy: [] };

  const subs = await prisma.googleCalendarSubscription.findMany({
    where: { connectionId: conn.id, syncPull: true, active: true },
  });
  if (subs.length === 0) return { ok: true, busy: [] };

  const calendar = getCalendarApi(conn);
  const all: Interval[] = [];
  let feiletAntall = 0;
  let sisteFeil = "unknown";

  try {
    // Én batched kall med alle kalender-IDer — reduserer N→1 API-kall per
    // tilgjengelighets-sjekk og unngår Google's "Queries per minute per user"-kvote.
    // freebusy-APIet støtter opptil 50 items per kall.
    const res = await calendar.freebusy.query({
      requestBody: {
        timeMin: from.toISOString(),
        timeMax: to.toISOString(),
        items: subs.map((sub) => ({ id: sub.googleCalendarId })),
      },
    });

    const now = new Date();
    for (const sub of subs) {
      const calResult = res.data.calendars?.[sub.googleCalendarId];
      const errors = calResult?.errors ?? [];
      if (errors.length > 0) {
        feiletAntall++;
        sisteFeil = errors.map((e) => e.reason ?? "unknown").join(", ");
        await logError({
          context: "google-calendar.freebusy",
          error: sisteFeil,
          meta: { googleCalendarId: sub.googleCalendarId },
          severity: "warn",
        });
        await prisma.googleCalendarSubscription.update({
          where: { id: sub.id },
          data: { lastError: sisteFeil.slice(0, 500) },
        });
        continue;
      }
      const busy = calResult?.busy ?? [];
      for (const b of busy) {
        if (b.start && b.end) {
          all.push({ start: new Date(b.start), end: new Date(b.end) });
        }
      }
      await prisma.googleCalendarSubscription.update({
        where: { id: sub.id },
        data: { lastSyncAt: now, lastError: null },
      });
    }
  } catch (error) {
    // Hele batch-kallet feilet (auth/nettverk) — alle subscriptions regnes som feilet.
    feiletAntall = subs.length;
    sisteFeil = error instanceof Error ? error.message : "unknown";
    await logError({
      context: "google-calendar.freebusyBatch",
      error,
      severity: "warn",
    });
    await prisma.googleCalendarSubscription.updateMany({
      where: { id: { in: subs.map((s) => s.id) } },
      data: { lastError: sisteFeil.slice(0, 500) },
    });

    // Permanent auth-feil (refresh-token trukket tilbake, utløpt, eller utstedt
    // under en gammel OAuth-klient) er IKKE forbigående. Da skal tilkoblingen
    // PAUSES — ikke holdes ACTIVE og fail-close-e all booking i det uendelige.
    // Coachen varsles om å koble til på nytt; booking fortsetter uten kalender-
    // beskyttelse til det er gjort (unik-constraintet hindrer fortsatt intern
    // dobbeltbooking — kun eksterne private avtaler sjekkes ikke).
    if (/invalid_grant|invalid_client|unauthorized_client|invalid_token|Token has been expired or revoked/i.test(sisteFeil)) {
      const overgang = await prisma.googleCalendarConnection.updateMany({
        where: { id: conn.id, status: { not: "PAUSED" } },
        data: {
          status: "PAUSED",
          lastError: `Token avvist (${sisteFeil.slice(0, 200)}). Koble til på nytt.`,
        },
      });
      if (overgang.count > 0) {
        await notify({
          userId,
          type: "system",
          title: "Google Calendar må kobles til på nytt",
          body: "Tilkoblingen til Google Calendar er utløpt. Koble til på nytt så bookinger igjen sjekkes mot kalenderen din. Booking fungerer som normalt i mellomtiden.",
          link: "/admin/settings/calendar",
        });
      }
      // Død tilkobling skal ikke stoppe booking: returner som «ingen kalender».
      return { ok: true, busy: [] };
    }
  }

  // Konservativt: minst én pull-kalender feilet ⇒ ufullstendig bilde ⇒ fail-closed.
  if (feiletAntall > 0) {
    // Atomisk overgang: kun kallet som faktisk flytter ACTIVE → ERROR varsler.
    // Hindrer duplikat-varsling når flere kall feiler samtidig (de øvrige får count 0).
    const overgang = await prisma.googleCalendarConnection.updateMany({
      where: { id: conn.id, status: "ACTIVE" },
      data: { status: "ERROR", lastError: sisteFeil.slice(0, 500) },
    });
    if (overgang.count === 0) {
      // Allerede i ERROR (eller satt av et samtidig kall) — oppdater kun feiltekst.
      await prisma.googleCalendarConnection.update({
        where: { id: conn.id },
        data: { lastError: sisteFeil.slice(0, 500) },
      });
    } else {
      await notify({
        userId,
        type: "system",
        title: "Kalender-beskyttelse er nede",
        body: "Vi kunne ikke sjekke Google Calendar. Koble til på nytt så bookinger ikke kolliderer med private avtaler.",
        link: "/admin/settings/calendar",
      });
      await logError({
        context: "booking.availability.calendar",
        error: sisteFeil,
        severity: "error",
        meta: { coachId: userId, feiletAntall },
        userId,
      });
    }
    return { ok: false, reason: sisteFeil, busy: all };
  }

  await prisma.googleCalendarConnection.update({
    where: { id: conn.id },
    data: { lastSyncAt: new Date(), lastError: null, status: "ACTIVE" },
  });
  return { ok: true, busy: all };
}

/**
 * Push og sletting av bookinger er flyttet til google-calendar-kilder.ts
 * (steg 3, 2026-07-27). De gamle funksjonene her sendte tid som
 * toISOString() — altså med Z — sammen med timeZone Oslo, noe som fikk
 * Google til å tolke tiden som UTC og vise avtalen to timer feil om
 * sommeren. De lagret dessuten kun første kalenders event-id.
 *
 * Bruk pushBooking / fjernBooking fra google-calendar-kilder.ts.
 */

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
        // Nye kalendere starter alltid av — coach velger push/pull manuelt i
        // innstillingene. Hindrer at alle kalendere aktiveres automatisk ved
        // første tilkobling (roten til "8 hendelser per booking"-problemet).
        syncPush: false,
        syncPull: false,
        active: false,
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
  // Watch trengs både for booking-blokkering (syncPull) og for at speilede
  // hendelser skal oppdateres umiddelbart i kalenderen (visIKalender).
  if (!sub.active || (!sub.syncPull && !sub.visIKalender)) return null;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    await logError({
      context: "google-calendar.watch",
      error: "NEXT_PUBLIC_APP_URL mangler — kan ikke registrere watch",
      severity: "warn",
    });
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
      await logError({
        context: "google-calendar.watch",
        error: "watch returnerte ingen resourceId",
        meta: { googleCalendarId: sub.googleCalendarId },
        severity: "warn",
      });
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
  } catch (error) {
    const melding = error instanceof Error ? error.message : "unknown";
    await logError({
      context: "google-calendar.watchInsert",
      error,
      meta: { googleCalendarId: sub.googleCalendarId },
      severity: "warn",
    });
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
