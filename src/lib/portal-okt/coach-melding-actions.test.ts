import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let viewer = {
  id: "spiller",
  role: "PLAYER",
  tier: "FULL",
  name: "Syn spiller",
};
let enrolledCoachId: string | null = "coach-a";
let mottakerRolle: string | null = "COACH";
let writes = 0;
let createdCoachId: string | null = null;
let eksisterendeTrad: { id: string; messages: unknown[] } | null = null;
let oppdatert: unknown[] | null = null;

mock.module("@/lib/auth/requirePortalUser", {
  namedExports: { requirePortalUser: async () => viewer },
});
mock.module("next/cache", {
  namedExports: { revalidatePath: () => undefined },
});
mock.module("next/navigation", {
  namedExports: {
    redirect: (href: string) => {
      throw new Error(`redirect:${href}`);
    },
  },
});
const mockPrisma: Record<string, unknown> = {
  playerEnrollment: {
    findFirst: async () =>
      enrolledCoachId ? { coachId: enrolledCoachId } : null,
  },
  user: {
    findUnique: async () => (mottakerRolle ? { role: mottakerRolle } : null),
  },
  $transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn(mockPrisma),
  coachingSession: {
    findFirst: async () => eksisterendeTrad,
    update: async ({ data }: { data: { messages: unknown[] } }) => {
      writes += 1;
      oppdatert = data.messages;
      return { id: "melding-1" };
    },
    create: async ({ data }: { data: { coachId: string } }) => {
      writes += 1;
      createdCoachId = data.coachId;
      return { id: "melding-1" };
    },
  },
};
mock.module("@/lib/prisma", { namedExports: { prisma: mockPrisma } });

let sendMeldingNyV2: typeof import("@/app/portal/coach/melding/ny/actions").sendMeldingNyV2;

before(async () => {
  ({ sendMeldingNyV2 } = await import("@/app/portal/coach/melding/ny/actions"));
});

beforeEach(() => {
  viewer = { id: "spiller", role: "PLAYER", tier: "FULL", name: "Syn spiller" };
  enrolledCoachId = "coach-a";
  mottakerRolle = "COACH";
  writes = 0;
  createdCoachId = null;
  eksisterendeTrad = null;
  oppdatert = null;
});

test("spiller sender bare til tildelt coach", async () => {
  await assert.rejects(
    () => sendMeldingNyV2({ coachId: "coach-a", body: "Kan vi bytte tid?" }),
    /redirect:\/portal\/coach$/,
  );
  assert.equal(writes, 1);
  assert.equal(createdCoachId, "coach-a");
});

test("melding legges til på eksisterende tråd i stedet for å lage ny", async () => {
  eksisterendeTrad = {
    id: "melding-1",
    messages: [{ role: "user", content: "Hei" }],
  };
  await assert.rejects(
    () => sendMeldingNyV2({ coachId: "coach-a", body: "Kan vi bytte tid?" }),
    /redirect:\/portal\/coach$/,
  );
  assert.equal(writes, 1);
  assert.equal(createdCoachId, null);
  assert.equal(oppdatert?.length, 2);
});

test("annen coach, manglende tildeling og gratis-nivå skriver ikke", async () => {
  await assert.rejects(
    () => sendMeldingNyV2({ coachId: "coach-b", body: "Kan vi bytte tid?" }),
    /forbidden/,
  );
  enrolledCoachId = null;
  await assert.rejects(
    () => sendMeldingNyV2({ coachId: "coach-a", body: "Kan vi bytte tid?" }),
    /forbidden/,
  );
  enrolledCoachId = "coach-a";
  viewer = { ...viewer, tier: "GRATIS" };
  await assert.rejects(
    () => sendMeldingNyV2({ coachId: "coach-a", body: "Kan vi bytte tid?" }),
    /upgrade-required/,
  );
  assert.equal(writes, 0);
});
