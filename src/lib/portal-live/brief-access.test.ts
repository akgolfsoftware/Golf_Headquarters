import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
let viewer = { id: "player", role: "PLAYER", tier: "PRO" };
let access = true;
let row = fixture();
function fixture() { return { id: "wb", playerId: "player", title: "Syntetisk økt", status: "PUBLISHED", pyramid: "TEK", durationMinutes: 50, date: new Date("2026-09-14T00:00Z"), startMinute: 540, location: null, notes: null, publishedAt: null, createdAt: new Date(0), drills: [], hiddenByPlayer: false, needsPlayerApproval: false, approvalStatus: "ACCEPTED" }; }
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => viewer } });
mock.module("@/lib/auth/own-or-coached", { namedExports: { canAccessPlayer: async () => access } });
mock.module("@/lib/prisma", { namedExports: { prisma: { trainingSessionV2: { findUnique: async () => null }, trainingPlanSession: { findUnique: async () => null }, workbenchSession: { findUnique: async () => row } } } });
mock.module("@/lib/portal-live/data", { namedExports: { loadLiveSession: async () => { throw new Error("Uventet planoppslag"); } } });
mock.module("@/app/portal/(fullscreen)/live/[sessionId]/actions", { namedExports: { loadLiveSession: async () => { throw new Error("Uventet V2-oppslag"); } } });
mock.module("@/components/portal/live", { namedExports: { PlanSessionBrief: () => null, LiveBrief: () => null } });
mock.module("next/navigation", { namedExports: { notFound: () => { throw new Error("notfound"); }, redirect: (href: string) => { throw new Error(`redirect:${href}`); } } });
let page: typeof import("@/app/portal/(fullscreen)/live/[sessionId]/brief/page").default;
before(async () => { page = (await import("@/app/portal/(fullscreen)/live/[sessionId]/brief/page")).default; });
beforeEach(() => { viewer = { id: "player", role: "PLAYER", tier: "PRO" }; row = fixture(); access = true; });
const open = () => page({ params: Promise.resolve({ sessionId: "wb" }) });
test("skjult Workbench-økt og utkast er heller ikke synlig via direkte brief", async () => {
  row.hiddenByPlayer = true; await assert.rejects(open, /notfound/);
  row.hiddenByPlayer = false; row.status = "DRAFT"; await assert.rejects(open, /notfound/);
});
test("godkjenning og rolle gjelder før startknappen tilbys", async () => {
  assert.equal((await open()).props.canStart, true);
  row.needsPlayerApproval = true;
  assert.equal((await open()).props.canStart, false);
  assert.equal((await open()).props.blockReason, "approval");
  row.needsPlayerApproval = false; viewer = { id: "coach", role: "COACH", tier: "PRO" };
  assert.equal((await open()).props.blockReason, "coach");
  viewer.id = "player";
  assert.equal((await open()).props.canStart, false);
  assert.equal((await open()).props.blockReason, "coach");
  access = false; await assert.rejects(open, /redirect:\/portal\/planlegge\/workbench/);
});
test("startet eller fullført Workbench-økt følger eksisterende rute", async () => {
  row.status = "IN_PROGRESS"; await assert.rejects(open, /redirect:\/portal\/live\/wb\/tapper/);
  row.status = "COMPLETED"; await assert.rejects(open, /redirect:\/portal\/live\/wb\/summary/);
});
