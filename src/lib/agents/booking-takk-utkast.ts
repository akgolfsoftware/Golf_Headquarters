/**
 * EP-05 og EP-06 som utkast i coachens Innboks (beslutninger.md §BOOKING BEKREFTES
 * AUTOMATISK, punkt 4 og 6). Ingenting sendes herfra: utkastet ligger i Innboks i
 * AgencyOS med status UTKAST_KLART, og coachen sender det selv med ett trykk.
 *
 * - EP-05 «Takk for timen»: til gjest uten konto, klart innen 24 timer etter timen.
 *   Kjøres daglig (lead-oppfolging-cronen kl. 06 UTC) for timer som sluttet siste 48 timer,
 *   så ingen time faller mellom to kjøringer.
 * - EP-06 «To uker siden timen»: én gang, 14 dager etter timen, bare hvis gjesten
 *   verken har booket ny time eller har konto i PlayerHQ. Deretter ingenting mer.
 * Ett utkast per booking og type: sjekkes på `bookingId` + emne.
 */
import { prisma } from "@/lib/prisma";

export const EMNE_TAKK = "Takk for timen";
export const EMNE_OPPFOLGING = "To uker siden timen";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://akgolf.no";
const DAG = 86_400_000;
const datoKort = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", timeZone: "UTC" });

type Kandidat = {
  id: string;
  guestEmail: string | null;
  guestName: string | null;
  startAt: Date;
  endAt: Date;
  coach: { name: string | null } | null;
};

function fornavn(navn: string | null): string | null {
  return navn?.trim().split(/\s+/)[0] || null;
}

/** Ren tekst til utkastet. Coachen fyller inn det timen handlet om før sending. */
export function takkTekst(k: Pick<Kandidat, "guestName" | "coach">, appUrl = APP_URL): string {
  const navn = fornavn(k.guestName);
  return [
    `Hei${navn ? ` ${navn}` : ""},`,
    "Takk for timen i dag. Vi jobbet med [skriv kort hva dere jobbet med].",
    "Til neste gang: [én konkret ting å trene på].",
    `Planen og tallene fra timen kan ligge klare i PlayerHQ. Der kan du følge øvelsene, registrere runder og booke neste time. Opprett konto her: ${appUrl}/auth/signup`,
    `Hilsen ${fornavn(k.coach?.name ?? null) ?? "AK Golf"}`,
  ].join("\n\n");
}

export function oppfolgingTekst(k: Pick<Kandidat, "guestName" | "coach" | "startAt">, appUrl = APP_URL): string {
  const navn = fornavn(k.guestName);
  return [
    `Hei${navn ? ` ${navn}` : ""},`,
    `Det er to uker siden timen ${datoKort.format(k.startAt)}. Har du fått trent på det vi jobbet med?`,
    `Vil du fortsette, kan du booke en ny time her: ${appUrl}/booking`,
    `Eller start gratis i PlayerHQ og følg planen der: ${appUrl}/auth/signup`,
    "Dette er den eneste oppfølgingen du får fra oss om timen.",
    `Hilsen ${fornavn(k.coach?.name ?? null) ?? "AK Golf"}`,
  ].join("\n\n");
}

async function harUtkast(bookingId: string, emne: string): Promise<boolean> {
  const finnes = await prisma.innboksEpost.findFirst({ where: { bookingId, emne }, select: { id: true } });
  return Boolean(finnes);
}

async function lagUtkast(k: Kandidat, emne: string, tekst: string, forklaring: string): Promise<void> {
  await prisma.innboksEpost.create({
    data: {
      fraEpost: k.guestEmail as string,
      fraNavn: k.guestName,
      emne,
      brodtekst: forklaring,
      status: "UTKAST_KLART",
      utkastSvar: tekst,
      utkastGenerertAt: new Date(),
      bookingId: k.id,
    },
  });
}

const velg = { id: true, guestEmail: true, guestName: true, startAt: true, endAt: true, coach: { select: { name: true } } } as const;

/**
 * Tider i basen er Oslo-veggklokke i UTC-feltene. Vinduene her er døgn brede, så
 * en til to timers forskyvning endrer ikke hvilke timer som plukkes.
 */
export async function lagTakkOgOppfolgingUtkast(naa: Date = new Date()): Promise<{ takk: number; oppfolging: number; hoppet: number }> {
  let takk = 0;
  let oppfolging = 0;
  let hoppet = 0;

  const ferdige = await prisma.booking.findMany({
    where: { userId: null, guestEmail: { not: null }, status: { in: ["CONFIRMED", "COMPLETED"] }, endAt: { gte: new Date(naa.getTime() - 2 * DAG), lte: naa } },
    select: velg,
    take: 100,
  });
  for (const k of ferdige) {
    if (await harUtkast(k.id, EMNE_TAKK)) { hoppet++; continue; }
    await lagUtkast(k, EMNE_TAKK, takkTekst(k), `EP-05: takk etter coachingtimen ${datoKort.format(k.startAt)}. Fyll inn det i hakeparentes før du sender. Sendes ikke før du trykker Send.`);
    takk++;
  }

  const toUker = await prisma.booking.findMany({
    where: { userId: null, guestEmail: { not: null }, status: { in: ["CONFIRMED", "COMPLETED"] }, startAt: { gte: new Date(naa.getTime() - 15 * DAG), lt: new Date(naa.getTime() - 14 * DAG) } },
    select: velg,
    take: 100,
  });
  for (const k of toUker) {
    const epost = k.guestEmail as string;
    const [utkast, nyBooking, konto] = await Promise.all([
      harUtkast(k.id, EMNE_OPPFOLGING),
      prisma.booking.findFirst({ where: { id: { not: k.id }, guestEmail: { equals: epost, mode: "insensitive" }, createdAt: { gt: k.startAt }, status: { not: "CANCELLED" } }, select: { id: true } }),
      prisma.user.findFirst({ where: { email: { equals: epost, mode: "insensitive" }, deletedAt: null }, select: { id: true } }),
    ]);
    if (utkast || nyBooking || konto) { hoppet++; continue; }
    await lagUtkast(k, EMNE_OPPFOLGING, oppfolgingTekst(k), `EP-06: én oppfølging 14 dager etter timen ${datoKort.format(k.startAt)}. Gjesten har ikke booket igjen og har ikke konto. Sendes ikke før du trykker Send.`);
    oppfolging++;
  }

  return { takk, oppfolging, hoppet };
}
