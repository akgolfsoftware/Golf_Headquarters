/**
 * Signert lenke for deltaker 2 i en duo-time: melde seg av fra e-posten.
 *
 * Egen signatur (eget merke), slik at en gjestelenke aldri kan brukes som
 * deltaker 2-lenke og omvendt. Lenken gir bare rett til å melde seg av selv;
 * den kan ikke avbestille, flytte eller refundere betalerens time.
 * Starttiden er med i signaturen, og lenken utløper ved start.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { naivOsloTilTidspunkt } from "@/lib/google-calendar-tid";
import { gjestLenkeNokkel } from "@/lib/booking/gjest-lenke";

const MERKE = "booking-deltaker2-lenke-v1";

const innhold = z.object({ v: z.literal(1), r: z.literal("d2"), b: z.string().min(1), s: z.string().datetime(), e: z.number() }).strict();
export type Deltaker2LenkeData = { bookingId: string; startAt: Date };

function signatur(nokkel: Buffer, payload: string): Buffer {
  return createHmac("sha256", nokkel).update(`${MERKE}:${payload}`).digest();
}

export function signerDeltaker2Lenke(bookingId: string, startAt: Date, nokkel: Buffer | null = gjestLenkeNokkel()): string | null {
  if (!nokkel) return null;
  const data = innhold.parse({ v: 1, r: "d2", b: bookingId, s: startAt.toISOString(), e: naivOsloTilTidspunkt(startAt, "utc").getTime() });
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${payload}.${signatur(nokkel, payload).toString("base64url")}`;
}

export function lesDeltaker2Lenke(token: string, naa: Date = new Date(), nokkel: Buffer | null = gjestLenkeNokkel()): Deltaker2LenkeData | null {
  try {
    if (!nokkel || token.length > 1000) return null;
    const deler = token.split(".");
    if (deler.length !== 2) return null;
    const forventet = signatur(nokkel, deler[0]);
    const faktisk = Buffer.from(deler[1], "base64url");
    if (faktisk.length !== forventet.length || !timingSafeEqual(faktisk, forventet)) return null;
    const parsed = innhold.safeParse(JSON.parse(Buffer.from(deler[0], "base64url").toString()));
    if (!parsed.success || parsed.data.e <= naa.getTime()) return null;
    return { bookingId: parsed.data.b, startAt: new Date(parsed.data.s) };
  } catch {
    return null;
  }
}

export function deltaker2Url(appUrl: string, bookingId: string, startAt: Date): string | null {
  const token = signerDeltaker2Lenke(bookingId, startAt);
  return token ? `${appUrl}/booking/deltaker/${token}` : null;
}
