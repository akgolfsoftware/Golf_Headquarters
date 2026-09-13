import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let viewer = { id: "spiller", role: "PLAYER", tier: "FULL", name: "Syn spiller" };
let enrolledCoachId: string | null = "coach-a";
let mottakerRolle: string | null = "COACH";
let writes = 0;
let createdCoachId: string | null = null;

mock.module("@/lib/auth/requirePortalUser", {
  namedExports: { requirePortalUser: async () => viewer },
});
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("next/navigation", {
  namedExports: {
    redirect: (href: string) => {
      throw new Error(`redirect:${href}`);
    },
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      playerEnrollment: {
        findFirst: async () =>
          enrolledCoachId ? { coachId: enrolledCoachId } : null,
      },
      user: {
        findUnique: async () => (mottakerRolle ? { role: mottakerRolle } : null),
      },
      coachingSession: {
        create: async ({ data }: { data: { coachId: string } }) => {
          writes += 1;
          createdCoachId = data.coachId;
          return { id: "melding-1" };
        },
      },
    },
  },
});

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
});

test("spiller sender bare til tildelt coach", async () => {
  await assert.rejects(
    () => sendMeldingNyV2({ coachId: "coach-a", body: "Kan vi bytte tid?" }),
    /redirect:\/portal\/coach\/melding\/melding-1/,
  );
  assert.equal(writes, 1);
  assert.equal(createdCoachId, "coach-a");
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
