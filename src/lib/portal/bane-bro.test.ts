/**
 * sikreBaneBro — server-siden av bane-broen (AP0.4), mot mocket prisma.
 *
 * VIKTIG: modulen importeres kun ÉN gang, etter t.mock.module() (samme
 * fallgruve som spiller-sg-hent.test.ts / sg-analyse-ekspert.test.ts — Node
 * re-evaluerer ikke en allerede lastet ES-modul).
 *
 * Kjør med: npm test
 */

import { test } from "node:test";
import assert from "node:assert/strict";

test("sikreBaneBro — kort vei, entydig treff, flertydig, ukjent bane, feil", async (t) => {
  let course: { baneId: string | null; name: string } | null = null;
  let baner: { id: string; navn: string; kortNavn: string | null; klubb: string }[] = [];
  let feil = false;
  const kall: { updateManyArgs?: Record<string, unknown>; updateManyKalt: number } = {
    updateManyKalt: 0,
  };

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        courseDefinition: {
          findUnique: async () => {
            if (feil) throw new Error("DB nede");
            return course;
          },
          updateMany: async (args: Record<string, unknown>) => {
            kall.updateManyKalt++;
            kall.updateManyArgs = args;
            return { count: 1 };
          },
        },
        bane: {
          findMany: async () => baner,
        },
      },
    },
  });

  const { sikreBaneBro } = await import("./bane-bro");

  // 1) Kort vei: broen finnes allerede — ingen bane-spørring, ingen skriving.
  course = { baneId: "b-eksisterende", name: "Gamle Fredrikstad Golfklubb" };
  assert.equal(await sikreBaneBro("c1"), "b-eksisterende");
  assert.equal(kall.updateManyKalt, 0);

  // 2) Mangler bro, entydig navnetreff → skriver og returnerer ny baneId.
  course = { baneId: null, name: "Onsøy Golfklubb" };
  baner = [{ id: "b-onsoy", navn: "Onsøy Golfklubb", kortNavn: null, klubb: "Onsøy GK" }];
  assert.equal(await sikreBaneBro("c2"), "b-onsoy");
  assert.equal(kall.updateManyKalt, 1);
  assert.deepEqual(kall.updateManyArgs?.where, { id: "c2", baneId: null });
  assert.deepEqual(kall.updateManyArgs?.data, { baneId: "b-onsoy" });

  // 3) Flertydig navn → ingen skriving, null tilbake.
  kall.updateManyKalt = 0;
  course = { baneId: null, name: "Skjeberg" };
  baner = [
    { id: "s1", navn: "Skjeberg Golfklubb", kortNavn: null, klubb: "" },
    { id: "s2", navn: "Skjeberg GK", kortNavn: null, klubb: "" },
  ];
  assert.equal(await sikreBaneBro("c3"), null);
  assert.equal(kall.updateManyKalt, 0);

  // 4) Ukjent navn → null, ingen skriving.
  course = { baneId: null, name: "En bane som ikke finnes" };
  baner = [{ id: "b-onsoy", navn: "Onsøy Golfklubb", kortNavn: null, klubb: "" }];
  assert.equal(await sikreBaneBro("c4"), null);
  assert.equal(kall.updateManyKalt, 0);

  // 5) CourseDefinition finnes ikke → null, ingen kasting.
  course = null;
  assert.equal(await sikreBaneBro("c-ukjent"), null);

  // 6) Prisma kaster → null, aldri en ukastet exception (bivirkning, ikke
  //    forutsetning — en feilet bro skal aldri kunne velte en rundelagring).
  feil = true;
  assert.equal(await sikreBaneBro("c-feil"), null);
});
