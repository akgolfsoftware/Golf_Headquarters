/**
 * Gavekort (bookingplanen steg 7): koden, dekningen, atomisk innløsning og tilbakeføring.
 * Databasen er en minnemodell som svarer som Postgres på de tre operasjonene som betyr noe:
 * `updateMany` med where på saldo er atomisk, og unik tilbakeføring per booking.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  GavekortFeil,
  formaterGavekode,
  gavekortDekning,
  hashGavekode,
  lagGavekode,
  losInnGavekort,
  knyttGavekortTilBooking,
  normaliserGavekode,
  tilbakeforGavekort,
} from "./gavekort";

type Kort = { id: string; codeHash: string; balanceOre: number; expiresAt: Date };
type Tx = { id: string; giftCardId: string; bookingId: string | null; kind: string; amountOre: number };

function lagDb(kort: Kort[]) {
  const transaksjoner: Tx[] = [];
  let teller = 0;
  const yieldTick = () => new Promise<void>((r) => setImmediate(r));
  const db = {
    giftCard: {
      findUnique: async ({ where }: { where: { codeHash: string } }) => {
        await yieldTick(); // la en annen innløsning slippe til mellom lesing og bytte
        const k = kort.find((x) => x.codeHash === where.codeHash);
        return k ? { id: k.id, balanceOre: k.balanceOre, expiresAt: k.expiresAt } : null;
      },
      updateMany: async ({ where, data }: { where: { id: string; balanceOre: number }; data: { balanceOre: number } }) => {
        const k = kort.find((x) => x.id === where.id);
        if (!k || k.balanceOre !== where.balanceOre) return { count: 0 };
        k.balanceOre = data.balanceOre;
        return { count: 1 };
      },
      update: async ({ where, data }: { where: { id: string }; data: { balanceOre: { increment: number } } }) => {
        const k = kort.find((x) => x.id === where.id)!;
        k.balanceOre += data.balanceOre.increment;
        return k;
      },
    },
    giftCardTransaction: {
      create: async ({ data }: { data: Omit<Tx, "id" | "bookingId"> & { bookingId?: string } }) => {
        const rad: Tx = { id: `t${++teller}`, bookingId: data.bookingId ?? null, giftCardId: data.giftCardId, kind: data.kind, amountOre: data.amountOre };
        transaksjoner.push(rad);
        return { id: rad.id };
      },
      update: async ({ where, data }: { where: { id: string }; data: { bookingId: string } }) => {
        transaksjoner.find((t) => t.id === where.id)!.bookingId = data.bookingId;
      },
      findMany: async ({ where }: { where: { bookingId: string; kind: string } }) =>
        transaksjoner.filter((t) => t.bookingId === where.bookingId && t.kind === where.kind),
      createMany: async ({ data }: { data: Array<Omit<Tx, "id">> }) => {
        let count = 0;
        for (const d of data) {
          if (transaksjoner.some((t) => t.giftCardId === d.giftCardId && t.bookingId === d.bookingId && t.kind === d.kind)) continue;
          transaksjoner.push({ ...d, id: `t${++teller}` });
          count++;
        }
        return { count };
      },
    },
  };
  return { db: db as never, transaksjoner };
}

const KODE = "ABCD-EFGH-JKMN-PQRS";
const norm = normaliserGavekode(KODE)!;
const nyttKort = (saldo: number): Kort => ({ id: "k1", codeHash: hashGavekode(norm), balanceOre: saldo, expiresAt: new Date(Date.now() + 86_400_000) });

test("koden er 16 tegn, avledes stabilt av økt-id og gjettes ikke fra en annen økt", () => {
  const nokkel = Buffer.from("test-nokkel-som-er-lang-nok-1234");
  const a = lagGavekode("cs_test_1", nokkel);
  assert.match(a, /^[0-9A-HJKMNP-TV-Z]{16}$/);
  assert.equal(lagGavekode("cs_test_1", nokkel), a);
  assert.notEqual(lagGavekode("cs_test_2", nokkel), a);
  assert.notEqual(lagGavekode("cs_test_1", Buffer.from("en-helt-annen-nokkel-1234567890")), a);
  assert.equal(normaliserGavekode(formaterGavekode(a)), a);
});

test("normalisering retter forveksling og avviser feil lengde og tegn", () => {
  assert.equal(normaliserGavekode("abcd efgh jkmn pqrs"), "ABCDEFGHJKMNPQRS");
  assert.equal(normaliserGavekode("0000-0000-0000-000O"), "0000000000000000");
  assert.equal(normaliserGavekode("ABCD"), null);
  assert.equal(normaliserGavekode("ABCD-EFGH-JKMN-PQRU"), null); // U finnes ikke i alfabetet
});

test("dekning: kortet dekker hele prisen, delen det rekker, og aldri en rest under Stripe-minimum", () => {
  assert.deepEqual(gavekortDekning(80_000, 200_000), { dekketOre: 80_000, restOre: 0 });
  assert.deepEqual(gavekortDekning(80_000, 30_000), { dekketOre: 30_000, restOre: 50_000 });
  assert.deepEqual(gavekortDekning(80_000, 79_900), { dekketOre: 79_700, restOre: 300 });
  assert.deepEqual(gavekortDekning(80_000, 0), { dekketOre: 0, restOre: 80_000 });
});

test("delvis innløsning gir riktig rest, og resten av prisen står igjen å betale", async () => {
  const kort = nyttKort(100_000);
  const { db, transaksjoner } = lagDb([kort]);
  const r = await losInnGavekort(db, KODE, 70_000);
  assert.equal(r.dekketOre, 70_000);
  assert.equal(kort.balanceOre, 30_000);
  const r2 = await losInnGavekort(db, KODE, 70_000);
  assert.equal(r2.dekketOre, 30_000, "bare det som er igjen");
  assert.equal(kort.balanceOre, 0);
  assert.equal(transaksjoner.filter((t) => t.kind === "REDEEM").length, 2);
  await assert.rejects(() => losInnGavekort(db, KODE, 10_000), GavekortFeil);
});

test("to samtidige innløsninger kan ikke bruke samme krone", async () => {
  for (const [pris, forventet] of [[100_000, 100_000], [70_000, 100_000]] as const) {
    const kort = nyttKort(100_000);
    const { db } = lagDb([kort]);
    const svar = await Promise.allSettled([losInnGavekort(db, KODE, pris), losInnGavekort(db, KODE, pris)]);
    const brukt = svar.reduce((s, x) => s + (x.status === "fulfilled" ? x.value.dekketOre : 0), 0);
    assert.equal(brukt, forventet, "samlet bruk er aldri mer enn saldoen");
    assert.equal(kort.balanceOre, 100_000 - brukt);
    assert.ok(kort.balanceOre >= 0);
  }
});

test("utløpt, ukjent og tomt kort avvises", async () => {
  const utlopt = { ...nyttKort(1000), expiresAt: new Date(Date.now() - 1000) };
  await assert.rejects(() => losInnGavekort(lagDb([utlopt]).db, KODE, 500), /utløpt/);
  await assert.rejects(() => losInnGavekort(lagDb([]).db, KODE, 500), /finnes ikke/);
  await assert.rejects(() => losInnGavekort(lagDb([nyttKort(0)]).db, KODE, 500), /brukt opp/);
  await assert.rejects(() => losInnGavekort(lagDb([nyttKort(5000)]).db, "feil", 500), /finnes ikke/);
});

test("avbestilling fører beløpet tilbake til kortet, og bare én gang", async () => {
  const kort = nyttKort(100_000);
  const { db } = lagDb([kort]);
  const r = await losInnGavekort(db, KODE, 70_000);
  await knyttGavekortTilBooking(db, r.transaksjonId, "b1");
  assert.equal(kort.balanceOre, 30_000);
  assert.equal(await tilbakeforGavekort(db, "b1"), 70_000);
  assert.equal(kort.balanceOre, 100_000);
  assert.equal(await tilbakeforGavekort(db, "b1"), 0, "andre gang gir ingenting");
  assert.equal(kort.balanceOre, 100_000);
  assert.equal(await tilbakeforGavekort(db, "ukjent"), 0);
});
