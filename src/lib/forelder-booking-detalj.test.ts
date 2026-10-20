import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
let allowed = true;
let detailReads = 0;
let payments: { status: string }[] = [];
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => ({ id: "parent", role: "PARENT" }) } });
mock.module("@/lib/forelder", { namedExports: { hentBarnHvisTilhoerer: async (parent: string, child: string) => allowed && parent === "parent" && child === "child" ? { id: "child", name: "Syntetisk Barn" } : null } });
mock.module("@/lib/prisma", { namedExports: { prisma: { booking: {
  findUnique: async () => ({ userId: "child" }),
  findFirst: async ({ where }: { where: { userId: string } }) => { detailReads++; assert.equal(where.userId, "child"); return { id: "booking", status: "CONFIRMED", startAt: new Date("2026-11-12T16:30:00Z"), endAt: new Date("2026-11-12T17:00:00Z"),
    priceOre: 95050, subscriptionId: null, serviceType: { name: "Syntetisk tjeneste" }, location: { name: "Syntetisk sted", address: null }, coach: null, payments }; },
} } } });
let load: typeof import("./forelder-booking-detalj").hentForelderBookingDetalj;
before(async () => { load = (await import("./forelder-booking-detalj")).hentForelderBookingDetalj; });
beforeEach(() => { allowed = true; detailReads = 0; payments = []; });
test("forelder uten godkjent relasjon får ingen booking- eller betalingsdata", async () => {
  allowed = false; assert.equal(await load("booking"), null); assert.equal(detailReads, 0);
});
test("bekreftet tid er ikke automatisk en bekreftet betaling", async () => {
  const data = await load("booking");
  assert.equal(data?.status, "Bekreftet"); assert.equal(data?.betaling, "Ingen betalingsbekreftelse registrert");
  assert.equal(data?.tid, "16:30–17:00"); assert.match(data?.pris ?? "", /950,50/);
  payments = [{ status: "SUCCEEDED" }]; assert.equal((await load("booking"))?.betaling, "Betaling bekreftet");
  payments = [{ status: "REFUNDED" }]; assert.equal((await load("booking"))?.betaling, "Refusjon registrert");
  payments = [{ status: "REFUNDED" }, { status: "SUCCEEDED" }]; assert.equal((await load("booking"))?.betaling, "Refusjon registrert");
});
