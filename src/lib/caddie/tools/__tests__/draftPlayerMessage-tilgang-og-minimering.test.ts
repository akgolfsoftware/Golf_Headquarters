/**
 * R-A/R-B for write-tools: samme eierskaps- og minimeringskrav som read-tools.
 * `draftPlayerMessage` sitt `previewText` blir en del av tool-resultatet AI
 * SDK sender videre til modellen — det skal ALDRI inneholde ekte navn/e-post.
 */
import { test, mock } from "node:test";
import assert from "node:assert/strict";

const KARI = { id: "u-kari", name: "Kari Nordmann", email: "kari@example.no" };

mock.module("@/lib/auth/coached", {
  namedExports: {
    harCoachTilgangTilSpiller: async (viewer: { id: string }, playerId: string) =>
      viewer.id === "coach-a" && playerId === KARI.id,
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: {
        findUnique: async () => ({ id: KARI.id, name: KARI.name, email: KARI.email }),
      },
    },
  },
});

test("draftPlayerMessage: tillatt coach får forslag med pseudonymisert navn, ingen e-post i previewText", async () => {
  const { buildWriteTools } = await import("../write");
  const tools = buildWriteTools({ id: "coach-a", role: "COACH" });
  const svar = (await tools.draftPlayerMessage.execute!(
    { playerId: KARI.id, subject: "Test", body: "Hei" },
    { toolCallId: "t1", messages: [] },
  )) as { needsApproval?: boolean; previewText?: string; ok?: boolean };
  assert.equal(svar.needsApproval, true);
  assert.ok(!svar.previewText?.includes(KARI.email), "previewText skal aldri inneholde e-post");
  assert.ok(!svar.previewText?.includes(KARI.name), "previewText skal aldri inneholde ekte navn");
  assert.match(svar.previewText ?? "", /Spiller-[0-9a-f]{6}/);
});

test("draftPlayerMessage: uvedkommende coach avvises, forslaget bygges aldri", async () => {
  const { buildWriteTools } = await import("../write");
  const tools = buildWriteTools({ id: "coach-b", role: "COACH" });
  const svar = (await tools.draftPlayerMessage.execute!(
    { playerId: KARI.id, subject: "Test", body: "Hei" },
    { toolCallId: "t1", messages: [] },
  )) as { ok?: boolean; needsApproval?: boolean; userMessage?: string };
  assert.equal(svar.ok, false);
  assert.equal(svar.needsApproval, undefined);
  assert.equal(svar.userMessage, "Fant ingen spiller med denne IDen.");
});
