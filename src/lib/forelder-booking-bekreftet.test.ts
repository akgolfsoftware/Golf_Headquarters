import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import * as React from "react";

let status = "CONFIRMED";
let barnId = "child";
mock.module("next/navigation", { namedExports: { notFound: () => { throw new Error("NOT_FOUND"); }, redirect: (path: string) => { throw new Error(path); } } });
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => ({ id: "parent", role: "PARENT" }) } });
mock.module("@/lib/forelder", { namedExports: { hentBarnForForelder: async () => [{ child: { id: "child" } }] } });
mock.module("@/components/precision/ForelderSkall", { namedExports: { ForelderSkall: "parent-shell" } });
mock.module("@/components/portal/v2/BookingBekreftetV2", { namedExports: { BookingBekreftetV2: "booking-receipt" } });
mock.module("@/lib/prisma", { namedExports: { prisma: { booking: { findUnique: async () => ({ id: "booking", userId: barnId, status,
  startAt: new Date("2026-11-12T16:30:00Z"), endAt: new Date("2026-11-12T17:00:00Z"), serviceType: { name: "Syntetisk tjeneste", durationMin: 50, coachUserId: null }, location: { name: "Syntetisk sted" } }) } } } });
let page: typeof import("@/app/forelder/bookinger/bekreftet/page").default;
before(async () => { page = (await import("@/app/forelder/bookinger/bekreftet/page")).default; });
beforeEach(() => { status = "CONFIRMED"; barnId = "child"; });
function nodes(tree: React.ReactNode): React.ReactElement<Record<string, unknown>>[] {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!React.isValidElement<Record<string, unknown>>(tree)) return [];
  return [tree, ...nodes(tree.props.children as React.ReactNode)];
}
test("foreldrekvitteringen viser faktisk barn, bestilt tid og lagret varighet", async () => {
  const tree = await page({ searchParams: Promise.resolve({ bookingId: "booking" }) });
  assert.equal(tree.props.barnId, "child");
  const receipt = nodes(tree).find(node => node.type === "booking-receipt");
  const data = receipt?.props.data as { linje: string; mineBookingerHref: string; kalenderUrl: string; varighetMin: number };
  assert.match(data.linje, /16:30/); assert.equal(data.varighetMin, 30);
  assert.equal(data.mineBookingerHref, "/forelder/bookinger?barn=child");
  assert.equal(new URL(data.kalenderUrl).searchParams.get("ctz"), "Europe/Oslo");
});
test("ventende og avlyst time kvitteres aldri som bekreftet", async () => {
  for (const value of ["PENDING", "CANCELLED", "COMPLETED"]) {
    status = value;
    await assert.rejects(page({ searchParams: Promise.resolve({ bookingId: "booking" }) }), /\/forelder\/bookinger\/booking\?barn=child/);
  }
});
test("annet barns booking når ikke foreldrekvitteringen", async () => {
  barnId = "other-child";
  await assert.rejects(page({ searchParams: Promise.resolve({ bookingId: "booking" }) }), /NOT_FOUND/);
});
