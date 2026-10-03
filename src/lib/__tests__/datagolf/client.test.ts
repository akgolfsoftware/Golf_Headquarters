import { test } from "node:test";
import assert from "node:assert/strict";
import { getSchedule, getSkillRatings } from "@/lib/datagolf/client";

test("HQ kan ikke gjøre direkte DataGolf-oppslag", async (t) => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    calls++;
    throw new Error("Nettkall skulle ikke skjedd");
  });
  await assert.rejects(() => getSchedule("pga"), /sperret/);
  await assert.rejects(() => getSchedule("euro", 2027), /sperret/);
  await assert.rejects(() => getSkillRatings("kft"), /sperret/);
  assert.equal(calls, 0);
});
