/**
 * hentBarnOkonomiSummer — mot mocket prisma (STEG 19.3-fiks).
 *
 * Reproduserer bugen som ble rettet: den gamle koden hentet betalinger med
 * `findMany({ take: 30 })` PÅ TVERS av alle barn, filtrerte «betalt i år» i
 * appen etterpå — så snart familien hadde over 30 betalinger totalt (uansett
 * år), falt eldre rader stille ut av summen. Denne testen sikrer at
 * aggregeringen skjer i basen (`groupBy`, ingen `take`) og derfor aldri kan
 * kuttes av antall rader — kun av de faktiske `where`-betingelsene.
 *
 * VIKTIG: modulen importeres kun ÉN gang, etter t.mock.module() (samme
 * fallgruve som bane-bro.test.ts — Node re-evaluerer ikke en allerede lastet
 * ES-modul).
 *
 * Kjør med: npm test
 */

import { test } from "node:test";
import assert from "node:assert/strict";

test("hentBarnOkonomiSummer — ingen take-cap, korrekt Oslo-årsgrense, per barn", async (t) => {
  const groupByKall: Record<string, unknown>[] = [];

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        payment: {
          groupBy: async (args: Record<string, unknown>) => {
            groupByKall.push(args);
            const where = args.where as {
              status?: string | { in: string[] };
            };
            // Første kall (STEG 19.3): status "SUCCEEDED" = "betalt i år".
            if (where.status === "SUCCEEDED") {
              return [
                { userId: "barn-a", _sum: { amountOre: 15000 } },
                { userId: "barn-b", _sum: { amountOre: 0 } },
              ];
            }
            // Andre kall: status i UBETALT = "utestående".
            return [{ userId: "barn-a", _sum: { amountOre: 29900 } }];
          },
        },
      },
    },
  });

  const { hentBarnOkonomiSummer } = await import("./forelder-okonomi");
  const { startOfYear, endOfYear } = await import("./uke-helpers");

  // Ingen barn — ingen spørring i det hele tatt.
  const tomt = await hentBarnOkonomiSummer([]);
  assert.equal(tomt.size, 0);
  assert.equal(groupByKall.length, 0);

  const naa = new Date("2026-09-04T10:00:00Z");
  const resultat = await hentBarnOkonomiSummer(["barn-a", "barn-b", "barn-c"], naa);

  // To groupBy-kall totalt — ingen av dem har `take` (det var selve bugen).
  assert.equal(groupByKall.length, 2);
  for (const kall of groupByKall) {
    assert.equal("take" in kall, false, "groupBy skal aldri ha en rad-cap");
  }

  // Årsgrensen for "betalt i år" er Oslo-korrekt, ikke rå getFullYear().
  const betaltIAarKall = groupByKall[0] as {
    where: { createdAt: { gte: Date; lt: Date } };
  };
  assert.deepEqual(betaltIAarKall.where.createdAt.gte, startOfYear(naa));
  assert.deepEqual(betaltIAarKall.where.createdAt.lt, endOfYear(naa));

  // Summene er koblet riktig per barn — inkludert barnet uten treff (default 0).
  assert.deepEqual(resultat.get("barn-a"), { betaltIAarOre: 15000, utestaaendeOre: 29900 });
  assert.deepEqual(resultat.get("barn-b"), { betaltIAarOre: 0, utestaaendeOre: 0 });
  assert.deepEqual(resultat.get("barn-c"), { betaltIAarOre: 0, utestaaendeOre: 0 });
});
