import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Bruker = { id: string; role: "PLAYER" | "COACH" | "ADMIN" };
let bruker: Bruker | null = null;
// coachId -> spillere coachen eier
const eier: Record<string, string[]> = { "coach-a": ["spiller-a"], "coach-b": ["spiller-b"] };
let fjernFeil: { message: string } | null = null;
let fjernet: string[][] = [];
let slettetRader: string[] = [];
let opprettetRader = 0;

const harTilgang = async (v: { id: string; role: string }, playerId: string) =>
  v.role === "ADMIN" || (eier[v.id] ?? []).includes(playerId);

mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });
mock.module("@/lib/auth/getCurrentUser", { namedExports: { getCurrentUser: async () => bruker } });
mock.module("@/lib/auth/coached", {
  namedExports: {
    harCoachTilgangTilSpiller: harTilgang,
    assertCoachTilgangTilSpiller: async (v: { id: string; role: string }, playerId: string) => {
      if (!(await harTilgang(v, playerId))) throw new Error("Du har ikke tilgang til denne spilleren.");
    },
  },
});
mock.module("@/lib/notifications", { namedExports: { notify: async () => {} } });
mock.module("@/lib/supabase/admin", {
  namedExports: {
    supabaseAdmin: () => ({
      storage: {
        from: () => ({
          upload: async () => ({ error: null }),
          createSignedUrl: async () => ({ data: { signedUrl: "https://signed.invalid/x" }, error: null }),
          remove: async (paths: string[]) => {
            fjernet.push(paths);
            return { error: fjernFeil };
          },
        }),
      },
    }),
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: { findUnique: async ({ where }: { where: { id: string } }) => ({ id: where.id, name: "x" }) },
      sessionVideo: {
        findUnique: async () => ({ id: "v1", videoUrl: "videos/v1.mp4", playerId: "spiller-b" }),
        create: async () => {
          opprettetRader += 1;
          return { id: "v-ny" };
        },
        update: async () => ({}),
        delete: async ({ where }: { where: { id: string } }) => {
          slettetRader.push(where.id);
          return {};
        },
      },
    },
  },
});

function reset() {
  bruker = null;
  fjernFeil = null;
  fjernet = [];
  slettetRader = [];
  opprettetRader = 0;
}
async function video() {
  return import("./video");
}
function skjema(playerId: string) {
  const f = new FormData();
  f.set("file", new File([new Uint8Array([1, 2, 3])], "a.mp4", { type: "video/mp4" }));
  f.set("title", "Swing");
  f.set("playerId", playerId);
  return f;
}

test("coach kan ikke laste opp video til annen coachs spiller", async () => {
  reset();
  bruker = { id: "coach-a", role: "COACH" };
  const { uploadVideo } = await video();
  await assert.rejects(uploadVideo(skjema("spiller-b")), /ikke tilgang/);
  assert.equal(opprettetRader, 0);
  assert.deepEqual(await uploadVideo(skjema("spiller-a")), { ok: true, videoId: "v-ny" });
});

test("signert URL gis bare til spilleren selv og coach/admin med tilgang", async () => {
  reset();
  bruker = { id: "coach-a", role: "COACH" };
  const { getSignedVideoUrl } = await video();
  await assert.rejects(getSignedVideoUrl("v1"), /forbidden/);
  bruker = { id: "coach-b", role: "COACH" };
  assert.match(await getSignedVideoUrl("v1"), /signed/);
  bruker = { id: "spiller-b", role: "PLAYER" };
  assert.match(await getSignedVideoUrl("v1"), /signed/);
  bruker = { id: "spiller-a", role: "PLAYER" };
  await assert.rejects(getSignedVideoUrl("v1"), /forbidden/);
  bruker = { id: "admin-1", role: "ADMIN" };
  assert.match(await getSignedVideoUrl("v1"), /signed/);
});

test("coach kan ikke slette annen coachs spillers video", async () => {
  reset();
  bruker = { id: "coach-a", role: "COACH" };
  const { deleteVideo } = await video();
  await assert.rejects(deleteVideo("v1"), /ikke tilgang/);
  assert.equal(fjernet.length, 0);
  assert.equal(slettetRader.length, 0);
  bruker = { id: "coach-b", role: "COACH" };
  assert.deepEqual(await deleteVideo("v1"), { ok: true });
  assert.deepEqual(slettetRader, ["v1"]);
});

test("feil ved fjerning av filen beholder databaseraden (RF-13)", async () => {
  reset();
  bruker = { id: "coach-b", role: "COACH" };
  fjernFeil = { message: "lagring nede" };
  const { deleteVideo } = await video();
  await assert.rejects(deleteVideo("v1"), /lagring nede/);
  assert.equal(slettetRader.length, 0);
});
