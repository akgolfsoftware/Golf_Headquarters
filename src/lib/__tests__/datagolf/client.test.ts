// Tester for DataGolf-klienten. Mocker global fetch (node:test sitt
// t.mock.method) — ingen ekte nettkall.
//
// Bakgrunn (24.08.2026): getSchedule() sendte tidligere ingen `season`-
// parameter. DataGolf svarer da med en default/stale sesong der so godt som
// alt er "completed" — fremtidige turneringer i /portal/tren/turneringer
// forsvant stille. Verifisert manuelt mot ekte API: samme spørring med
// season=<inneværende år> inkluderer "upcoming"-events resten av året.
import { test } from "node:test";
import assert from "node:assert/strict";
import { getSchedule } from "@/lib/datagolf/client";

test("getSchedule", async (t) => {
  const originalKey = process.env.DATAGOLF_API_KEY;
  process.env.DATAGOLF_API_KEY = "test-key";
  t.after(() => {
    if (originalKey === undefined) delete process.env.DATAGOLF_API_KEY;
    else process.env.DATAGOLF_API_KEY = originalKey;
  });

  await t.test("sender med season=inneværende år som default", async (t) => {
    let calledUrl = "";
    t.mock.method(globalThis, "fetch", async (url: string) => {
      calledUrl = url;
      return new Response(JSON.stringify({ schedule: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    await getSchedule("pga");
    const expectedYear = new Date().getFullYear();
    assert.match(calledUrl, new RegExp(`season=${expectedYear}(&|$)`));
  });

  await t.test("respekterer eksplisitt season-argument", async (t) => {
    let calledUrl = "";
    t.mock.method(globalThis, "fetch", async (url: string) => {
      calledUrl = url;
      return new Response(JSON.stringify({ schedule: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    await getSchedule("euro", 2027);
    assert.match(calledUrl, /season=2027(&|$)/);
  });
});
