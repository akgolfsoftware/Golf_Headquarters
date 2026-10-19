/**
 * Signert lenke for gjest uten konto: endre eller avbestille fra e-posten
 * (bookingplanen 15.10 steg 5).
 *
 * Lenken bærer bare booking-id, starttid og utløp, aldri e-posten. Den er
 * signert med HMAC, så den kan ikke gjettes eller endres. Starttiden er med i
 * signaturen: flyttes timen, slutter den gamle lenken å virke, og den nye
 * e-posten har ny lenke. Utløp er starttiden (etterpå er det ingenting å endre).
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { naivOsloTilTidspunkt } from "@/lib/google-calendar-tid";

const MERKE = "booking-gjestelenke-v1";

const innhold = z.object({ v: z.literal(1), b: z.string().min(1), s: z.string().datetime(), e: z.number() }).strict();
export type GjestLenkeData = { bookingId: string; startAt: Date; utloper: Date };

/**
 * Egen nøkkel `BOOKING_LINK_SECRET` når den er satt. Ellers avledes en nøkkel fra
 * `CRON_SECRET` med eget merke, så lenkene virker uten ny hemmelighet i Vercel.
 * Mangler begge, lages ingen lenke (e-posten faller tilbake til post@akgolf.no).
 */
export function gjestLenkeNokkel(env: Record<string, string | undefined> = process.env): Buffer | null {
  const egen = env.BOOKING_LINK_SECRET;
  if (egen && Buffer.byteLength(egen, "utf8") >= 32) return Buffer.from(egen, "utf8");
  const cron = env.CRON_SECRET;
  if (cron && Buffer.byteLength(cron, "utf8") >= 16) return createHmac("sha256", cron).update(MERKE).digest();
  return null;
}

function signatur(nokkel: Buffer, payload: string): Buffer {
  return createHmac("sha256", nokkel).update(`${MERKE}:${payload}`).digest();
}

/** Lager lenke-token for en booking. `startAt` er verdien slik den står i basen. */
export function signerGjestLenke(bookingId: string, startAt: Date, nokkel: Buffer | null = gjestLenkeNokkel()): string | null {
  if (!nokkel) return null;
  const data = innhold.parse({
    v: 1,
    b: bookingId,
    s: startAt.toISOString(),
    e: naivOsloTilTidspunkt(startAt, "utc").getTime(),
  });
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${payload}.${signatur(nokkel, payload).toString("base64url")}`;
}

/** Leser og kontrollerer token. Null ved feil signatur, ugyldig innhold eller utløpt lenke. */
export function lesGjestLenke(token: string, naa: Date = new Date(), nokkel: Buffer | null = gjestLenkeNokkel()): GjestLenkeData | null {
  try {
    if (!nokkel || token.length > 1000) return null;
    const deler = token.split(".");
    if (deler.length !== 2) return null;
    const forventet = signatur(nokkel, deler[0]);
    const faktisk = Buffer.from(deler[1], "base64url");
    if (faktisk.length !== forventet.length || !timingSafeEqual(faktisk, forventet)) return null;
    const parsed = innhold.safeParse(JSON.parse(Buffer.from(deler[0], "base64url").toString()));
    if (!parsed.success || parsed.data.e <= naa.getTime()) return null;
    return { bookingId: parsed.data.b, startAt: new Date(parsed.data.s), utloper: new Date(parsed.data.e) };
  } catch {
    return null;
  }
}

/** Full adresse til siden der gjesten endrer eller avbestiller. Null uten nøkkel. */
export function gjestEndreUrl(appUrl: string, bookingId: string, startAt: Date): string | null {
  const token = signerGjestLenke(bookingId, startAt);
  return token ? `${appUrl}/booking/endre/${token}` : null;
}
