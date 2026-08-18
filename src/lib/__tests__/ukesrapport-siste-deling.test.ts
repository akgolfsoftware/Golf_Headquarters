/**
 * Regresjonstest for MANDAGSHULLET (funnet 2026-08-18, live i prod).
 *
 * Coachen deler ukesdigesten søndag kveld — for uka som da avsluttes. Åpner
 * spilleren appen mandag morgen, står han i NESTE uke. Det gamle oppslaget
 * spurte blindt etter `isoUke(startOfWeek(now))`, altså den nye uka, fant
 * ingen rad og viste «Ingen digest ennå». Spilleren trodde coachen ikke delte,
 * og digesten var usynlig resten av uka.
 *
 * `hentSisteDeling` sjekker derfor inneværende uke OG forrige, og forteller
 * kalleren hvilken uke svaret gjelder (`ukeStart`) slik at resten av digesten
 * regnes for samme uke.
 *
 * Vi stopper bevisst ved forrige uke: en digest eldre enn det er ikke «uka di».
 *
 * Mock-mønster som resten av suiten (t.mock.module før dynamisk import).
 * Kjør med: npm test
 */

import { test } from "node:test";
import assert from "node:assert/strict";

type DelingRad = { deltAt: Date; coachId: string; ar: number; uke: number };
type FindFirstArgs = {
  where: { playerId: string; OR: { ar: number; uke: number }[] };
  orderBy: unknown;
  select: unknown;
};

test("hentSisteDeling — søndagsdeling er synlig mandag", async (t) => {
  // --- mutérbar mock-tilstand ---
  let rader: DelingRad[] = [];
  const kall: FindFirstArgs[] = [];

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        ukesrapportDeling: {
          findFirst: async (args: FindFirstArgs) => {
            kall.push(args);
            // Etterlikner Prisma: filtrer på OR-parene, nyeste uke først.
            const treff = rader
              .filter((r) => args.where.OR.some((o) => o.ar === r.ar && o.uke === r.uke))
              .sort((a, b) => b.ar - a.ar || b.uke - a.uke);
            return treff[0] ?? null;
          },
        },
      },
    },
  });

  const { hentSisteDeling, isoUke } = await import("@/lib/admin/ukesrapport-deling");
  const { startOfWeek } = await import("@/lib/uke-helpers");

  // Uke 33 i 2026: mandag 10.08 – søndag 16.08 (Oslo).
  const sondagKveld = new Date("2026-08-16T19:30:00+02:00");
  const mandagMorgen = new Date("2026-08-17T07:15:00+02:00");
  const uke33 = isoUke(startOfWeek(sondagKveld));

  await t.test("selve bugen: delt søndag, lest mandag → fortsatt synlig", async () => {
    rader = [{ deltAt: sondagKveld, coachId: "coach-1", ar: uke33.ar, uke: uke33.uke }];

    const res = await hentSisteDeling("spiller-1", mandagMorgen);

    assert.ok(res, "digesten skal finnes mandag — dette var mandagshullet");
    assert.equal(res.coachId, "coach-1");
    assert.deepEqual(
      res.ukeStart,
      startOfWeek(sondagKveld),
      "uka som returneres må være uka som ble delt (33), ikke uka spilleren står i (34)",
    );
  });

  await t.test("samme uke som delingen → uendret oppførsel", async () => {
    rader = [{ deltAt: sondagKveld, coachId: "coach-1", ar: uke33.ar, uke: uke33.uke }];

    const res = await hentSisteDeling("spiller-1", sondagKveld);

    assert.ok(res);
    assert.deepEqual(res.ukeStart, startOfWeek(sondagKveld));
  });

  await t.test("ingen deling → null, og flaten viser tom tilstand", async () => {
    rader = [];
    assert.equal(await hentSisteDeling("spiller-1", mandagMorgen), null);
  });

  await t.test("begge uker delt → inneværende vinner", async () => {
    const uke34 = isoUke(startOfWeek(mandagMorgen));
    rader = [
      { deltAt: sondagKveld, coachId: "coach-gammel", ar: uke33.ar, uke: uke33.uke },
      { deltAt: mandagMorgen, coachId: "coach-fersk", ar: uke34.ar, uke: uke34.uke },
    ];

    const res = await hentSisteDeling("spiller-1", mandagMorgen);

    assert.ok(res);
    assert.equal(res.coachId, "coach-fersk");
    assert.deepEqual(res.ukeStart, startOfWeek(mandagMorgen));
  });

  await t.test("to uker gammel deling teller ikke — det er ikke «uka di»", async () => {
    const toUkerSiden = isoUke(startOfWeek(new Date("2026-08-05T12:00:00+02:00")));
    rader = [
      { deltAt: new Date("2026-08-09T20:00:00+02:00"), coachId: "coach-1", ar: toUkerSiden.ar, uke: toUkerSiden.uke },
    ];

    assert.equal(await hentSisteDeling("spiller-1", mandagMorgen), null);
  });

  await t.test("spør alltid om nøyaktig to uker, nyeste først", async () => {
    rader = [];
    kall.length = 0;
    await hentSisteDeling("spiller-1", mandagMorgen);

    assert.equal(kall.length, 1, "ett oppslag, ikke to sekvensielle");
    assert.equal(kall[0].where.OR.length, 2);
    assert.equal(kall[0].where.playerId, "spiller-1");
  });

  await t.test("over nyttår: uke 1 finner uke 53 i fjor", async () => {
    // Mandag 4.1.2027 er uke 1/2027; uka før er uke 53/2026.
    const nyttarsmandag = new Date("2027-01-04T08:00:00+01:00");
    const uke53 = isoUke(startOfWeek(new Date("2026-12-28T12:00:00+01:00")));
    rader = [
      { deltAt: new Date("2027-01-03T20:00:00+01:00"), coachId: "coach-1", ar: uke53.ar, uke: uke53.uke },
    ];

    const res = await hentSisteDeling("spiller-1", nyttarsmandag);

    assert.ok(res, "årsskiftet skal ikke skjule digesten");
    assert.equal(res.ukeStart.getTime(), startOfWeek(new Date("2026-12-28T12:00:00+01:00")).getTime());
  });
});
