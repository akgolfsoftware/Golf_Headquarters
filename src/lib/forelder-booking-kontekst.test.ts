import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
let returBarn: string | null = null;
let returLesinger = 0;
const bookingUtvalg: string[][] = [];
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => ({ id: "parent", name: "Syntetisk forelder", role: "PARENT" }) } });
mock.module("@/lib/forelder", { namedExports: { hentBarnForForelder: async () => [{ child: { id: "child-a", name: "Syntetisk A" } }, { child: { id: "child-b", name: "Syntetisk B" } }] } });
mock.module("@/lib/portal-booking/forelder-retur", { namedExports: { lesForelderBookingRetur: async (_retur: unknown, parentId: string, ids: readonly string[]) => {
  assert.equal(parentId, "parent"); assert.deepEqual(ids, ["child-a", "child-b"]); returLesinger++; return returBarn;
} } });
mock.module("@/components/precision/ForelderSkall", { namedExports: { ForelderSkall: "parent-shell" } });
mock.module("@/components/forelder/ForelderBarnValg", { namedExports: { ForelderBarnValg: "child-selector", ForelderBarnAvvist: "child-denied" } });
mock.module("@/components/portal/v2/ForelderBookingerV2", { namedExports: { ForelderBookingerV2: "booking-list" } });
mock.module("@/lib/prisma", { namedExports: { prisma: { booking: { findMany: async ({ where }: { where: { userId: { in: string[] } } }) => { bookingUtvalg.push(where.userId.in); return []; } } } } });
let page: typeof import("@/app/forelder/bookinger/page").default;
before(async () => { page = (await import("@/app/forelder/bookinger/page")).default; });
beforeEach(() => { returBarn = null; returLesinger = 0; bookingUtvalg.length = 0; });
test("validert betalingsretur velger samme barn i liste og videre navigasjon", async () => {
  returBarn = "child-b";
  const tree = await page({ searchParams: Promise.resolve({ retur: "syntetisk-retur" }) });
  assert.equal(tree.props.barnId, "child-b");
  assert.deepEqual(bookingUtvalg, [["child-b"], ["child-b"]]);
});
test("eksplisitt nytt barnevalg overstyrer tidligere retur og andres barn blir avvist", async () => {
  returBarn = "child-b";
  const tree = await page({ searchParams: Promise.resolve({ barn: "child-a", retur: "syntetisk-retur" }) });
  assert.equal(tree.props.barnId, "child-a"); assert.equal(returLesinger, 0);
  assert.deepEqual(bookingUtvalg, [["child-a"], ["child-a"]]);
  bookingUtvalg.length = 0;
  await page({ searchParams: Promise.resolve({ barn: "other-child" }) });
  assert.deepEqual(bookingUtvalg, []);
});
test("manglende retur gir oversikt uten å gjette betalingsstatus eller barn", async () => {
  const tree = await page({ searchParams: Promise.resolve({ retur: "syntetisk-ukjent" }) });
  assert.equal(tree.props.barnId, null);
  assert.deepEqual(bookingUtvalg, [["child-a", "child-b"], ["child-a", "child-b"]]);
});
