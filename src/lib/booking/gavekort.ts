/**
 * Gavekort (bookingplanen steg 7, Anders 15.10.2026): verdi i kroner, gjelder alle tjenester
 * og alle coacher.
 *
 * - Koden er 16 tegn (80 bit) og avledes av Stripe-økt-id og en hemmelig nøkkel, så den kan
 *   sendes på nytt uten å lagres i klartekst. I basen ligger bare SHA-256 av koden.
 * - Restverdien trekkes atomisk: `losInnGavekort` bytter saldoen bare hvis den ikke er endret
 *   siden den ble lest (compare-and-swap). To samtidige innløsninger kan derfor aldri bruke
 *   samme krone.
 * - Avbestilling fører beløpet tilbake, og bare én gang (`tilbakeforGavekort`).
 */
import { createHash, createHmac } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";

const ALFABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford base32: uten I, L, O, U
const KODE_LENGDE = 16;
const MERKE = "ak-golf-gavekort-v1";
export const GAVEKORT_GYLDIG_AAR = 3;
export const GAVEKORT_MIN_ORE = 50_000;
export const GAVEKORT_MAKS_ORE = 1_000_000;
/** Stripe NOK-minimum er 3 kr. Resten på kortet skal aldri bli lavere enn dette (eller 0). */
export const STRIPE_MIN_ORE = 300;

/** Nøkkelen koden avledes av. Egen variabel om den finnes, ellers avledet av CRON_SECRET (som gjest-lenkene). */
export function gavekortNokkel(env: Record<string, string | undefined> = process.env): Buffer | null {
  const egen = env.GIFTCARD_SECRET;
  if (egen && Buffer.byteLength(egen, "utf8") >= 16) return Buffer.from(egen, "utf8");
  const cron = env.CRON_SECRET;
  if (cron && Buffer.byteLength(cron, "utf8") >= 16) return createHmac("sha256", cron).update(MERKE).digest();
  return null;
}

function base32(bytes: Buffer, lengde: number): string {
  let ut = "";
  let buffer = 0;
  let bits = 0;
  for (const b of bytes) {
    buffer = (buffer << 8) | b;
    bits += 8;
    while (bits >= 5 && ut.length < lengde) {
      ut += ALFABET[(buffer >>> (bits - 5)) & 31];
      bits -= 5;
    }
    buffer &= (1 << bits) - 1;
  }
  return ut;
}

/** Normalisert kode (16 tegn) for en Stripe-økt. Samme økt gir alltid samme kode. */
export function lagGavekode(stripeSessionId: string, nokkel: Buffer): string {
  const mac = createHmac("sha256", nokkel).update(`${MERKE}:${stripeSessionId}`).digest();
  return base32(mac, KODE_LENGDE);
}

/** «AB12-CD34-EF56-GH78» til visning og e-post. */
export function formaterGavekode(norm: string): string {
  return norm.match(/.{1,4}/g)?.join("-") ?? norm;
}

/** Rydder det kunden skriver: store bokstaver, uten skilletegn, forveksling O/0 og I/L/1 rettes. Null = ugyldig. */
export function normaliserGavekode(input: string): string | null {
  const s = input
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, "")
    .replace(/O/g, "0")
    .replace(/[IL]/g, "1");
  if (s.length !== KODE_LENGDE) return null;
  for (const ch of s) if (!ALFABET.includes(ch)) return null;
  return s;
}

export function hashGavekode(norm: string): string {
  return createHash("sha256").update(`${MERKE}:${norm}`).digest("hex");
}

/**
 * Hvor mye av prisen gavekortet dekker, og hva som blir igjen på kortet.
 * Stripe tar ikke betalinger under 3 kr: blir resten mellom 1 og 299 øre, dekker kortet litt
 * mindre, så resten blir akkurat 3 kr. Saldo under det som trengs for dette gir full dekning
 * bare når saldoen rekker hele prisen.
 */
export function gavekortDekning(prisOre: number, saldoOre: number): { dekketOre: number; restOre: number } {
  if (prisOre <= 0 || saldoOre <= 0) return { dekketOre: 0, restOre: Math.max(prisOre, 0) };
  let dekket = Math.min(prisOre, saldoOre);
  const rest = prisOre - dekket;
  if (rest > 0 && rest < STRIPE_MIN_ORE) dekket = Math.max(prisOre - STRIPE_MIN_ORE, 0);
  return { dekketOre: dekket, restOre: prisOre - dekket };
}

export class GavekortFeil extends Error {}

type Db = Pick<Prisma.TransactionClient, "giftCard" | "giftCardTransaction">;

/** Slår opp et gavekort uten å endre noe. Gir samme svar for ukjent, utløpt og tomt kort. */
export async function slaaOppGavekort(
  db: Pick<Prisma.TransactionClient, "giftCard">,
  kode: string,
  naa: Date = new Date(),
): Promise<{ id: string; saldoOre: number }> {
  const norm = normaliserGavekode(kode);
  const kort = norm ? await db.giftCard.findUnique({ where: { codeHash: hashGavekode(norm) }, select: { id: true, balanceOre: true, expiresAt: true } }) : null;
  if (!kort) throw new GavekortFeil("Gavekortet finnes ikke. Sjekk koden.");
  if (kort.expiresAt <= naa) throw new GavekortFeil("Gavekortet er utløpt.");
  if (kort.balanceOre <= 0) throw new GavekortFeil("Gavekortet er brukt opp.");
  return { id: kort.id, saldoOre: kort.balanceOre };
}

/**
 * Trekker gavekortet for en booking, i samme transaksjon som bookingen lages. Returnerer
 * hvor mye som ble dekket. `bookingId` settes på transaksjonsraden etterpå (`knyttTilBooking`),
 * fordi prisen på bookingen avhenger av dekningen.
 */
export async function losInnGavekort(
  db: Db,
  kode: string,
  prisOre: number,
  naa: Date = new Date(),
): Promise<{ transaksjonId: string; giftCardId: string; dekketOre: number }> {
  for (let forsok = 0; forsok < 6; forsok++) {
    const kort = await slaaOppGavekort(db, kode, naa);
    const { dekketOre } = gavekortDekning(prisOre, kort.saldoOre);
    if (dekketOre <= 0) throw new GavekortFeil("Gavekortet kan ikke brukes på dette beløpet.");
    // Compare-and-swap: bare hvis saldoen fortsatt er den vi leste.
    const bytte = await db.giftCard.updateMany({
      where: { id: kort.id, balanceOre: kort.saldoOre },
      data: { balanceOre: kort.saldoOre - dekketOre },
    });
    if (bytte.count === 1) {
      const rad = await db.giftCardTransaction.create({
        data: { giftCardId: kort.id, kind: "REDEEM", amountOre: dekketOre },
        select: { id: true },
      });
      return { transaksjonId: rad.id, giftCardId: kort.id, dekketOre };
    }
  }
  throw new GavekortFeil("Gavekortet er i bruk akkurat nå. Prøv igjen om et øyeblikk.");
}

export async function knyttGavekortTilBooking(
  db: Pick<Prisma.TransactionClient, "giftCardTransaction">,
  transaksjonId: string,
  bookingId: string,
): Promise<void> {
  await db.giftCardTransaction.update({ where: { id: transaksjonId }, data: { bookingId } });
}

/**
 * Fører gavekortbeløpet for en booking tilbake til kortet. Trygt å kalle flere ganger:
 * tilbakeføringen er unik per booking, så beløpet kommer bare én gang. Returnerer øre ført tilbake.
 */
export async function tilbakeforGavekort(db: Db, bookingId: string): Promise<number> {
  const trekk = await db.giftCardTransaction.findMany({
    where: { bookingId, kind: "REDEEM" },
    select: { giftCardId: true, amountOre: true },
  });
  let sum = 0;
  for (const t of trekk) {
    const ny = await db.giftCardTransaction.createMany({
      data: [{ giftCardId: t.giftCardId, bookingId, kind: "RETURN", amountOre: t.amountOre }],
      skipDuplicates: true,
    });
    if (ny.count === 1) {
      await db.giftCard.update({ where: { id: t.giftCardId }, data: { balanceOre: { increment: t.amountOre } } });
      sum += t.amountOre;
    }
  }
  return sum;
}
