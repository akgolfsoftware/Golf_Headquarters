import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { videoHeaderMatches } from "./video-header";

type Bruker = { id: string; role: "PLAYER" | "COACH" | "ADMIN" };
let bruker: Bruker | null = null;
// coachId -> spillere coachen eier
const eier: Record<string, string[]> = { "coach-a": ["spiller-a"], "coach-b": ["spiller-b"] };
let fjernFeil: { message: string } | null = null;
let fjernet: string[][] = [];
let slettetRader: string[] = [];
let opprettetRader = 0;
type VideoRow = { id: string; videoUrl: string; playerId: string; coachId: string; bookingId: string | null;
  title: string; tag: string | null; notes: string | null; sizeBytes: number | null; status: string };
let rows = new Map<string, VideoRow>();
type StoredObject = { name: string; contentType: string; size: number; header: Uint8Array };
let objects = new Map<string, StoredObject>();
let ticketError: { message: string } | null = null;
let signedError: { message: string } | null = null;
let infoCalls: string[] = [];
let signedTickets: { path: string; options: { upsert: boolean } }[] = [];
let buckets: string[] = [];
let notificationCount = 0;
let booking: { userId: string; coachId: string } | null = null;
let revoked = false;

const harTilgang = async (v: { id: string; role: string }, playerId: string) =>
  !revoked && (v.role === "ADMIN" || (eier[v.id] ?? []).includes(playerId));

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
mock.module("@/lib/notifications", { namedExports: { notify: async () => { notificationCount += 1; } } });
mock.module("@/lib/storage/video-content", { namedExports: {
  storedVideoHeaderMatches: async (signedUrl: string, mimeType: string, size: number) => {
    const object = objects.get(signedUrl.replace("https://signed.invalid/", ""));
    return !!object && videoHeaderMatches(object.header, mimeType, size);
  },
} });
mock.module("@/lib/supabase/admin", {
  namedExports: {
    supabaseAdmin: () => ({
      storage: {
        from: (bucket: string) => { buckets.push(bucket); return {
          upload: async () => ({ error: null }),
          createSignedUploadUrl: async (path: string, options: { upsert: boolean }) => {
            signedTickets.push({ path, options });
            return { data: ticketError ? null : { token: "synthetic-token", path }, error: ticketError };
          },
          info: async (path: string) => {
            infoCalls.push(path);
            return { data: objects.get(path) ?? null, error: objects.has(path) ? null : { message: "not found" } };
          },
          createSignedUrl: async (path: string) => ({ data: signedError ? null : { signedUrl: `https://signed.invalid/${path}` }, error: signedError }),
          remove: async (paths: string[]) => {
            fjernet.push(paths);
            return { error: fjernFeil };
          },
        }; },
      },
    }),
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: { findUnique: async ({ where }: { where: { id: string } }) => ({ id: where.id, name: "x" }) },
      booking: { findUnique: async () => booking },
      sessionVideo: {
        findUnique: async ({ where }: { where: { id: string } }) => {
          const row = rows.get(where.id);
          return row ? { ...row } : null;
        },
        create: async ({ data }: { data: Omit<VideoRow, "id"> }) => {
          opprettetRader += 1;
          rows.set("v-ny", { id: "v-ny", ...data });
          return { id: "v-ny" };
        },
        update: async ({ where, data }: { where: { id: string }; data: Partial<VideoRow> }) => {
          const row = rows.get(where.id);
          if (row) Object.assign(row, data);
          return row;
        },
        updateMany: async ({ where, data }: { where: { id: string; coachId: string; status: string; videoUrl: string }; data: Partial<VideoRow> }) => {
          const row = rows.get(where.id);
          if (!row || row.coachId !== where.coachId || row.status !== where.status || row.videoUrl !== where.videoUrl) return { count: 0 };
          Object.assign(row, data);
          return { count: 1 };
        },
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
  rows = new Map([["v1", { id: "v1", videoUrl: "videos/v1.mp4", playerId: "spiller-b", coachId: "coach-b", bookingId: null,
    title: "Swing", tag: null, notes: null, sizeBytes: 24, status: "READY" }]]);
  objects = new Map();
  ticketError = null;
  signedError = null;
  infoCalls = [];
  signedTickets = [];
  buckets = [];
  notificationCount = 0;
  booking = null;
  revoked = false;
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

const metadata = { title: "Swing", playerId: "spiller-a", bookingId: "", tag: "TEK", notes: "syntetisk notat", sizeBytes: 24, mimeType: "video/mp4" as const };
const mp4Header = new Uint8Array([0, 0, 0, 24, 102, 116, 121, 112, 105, 115, 111, 109, 0, 0, 0, 0, 109, 112, 52, 49, 0, 0, 0, 0]);
function storeVideo(path = "videos/v-ny.mp4", changes: Partial<StoredObject> = {}) {
  objects.set(path, { name: path, contentType: "video/mp4", size: 24, header: mp4Header, ...changes });
}

test("opplastingstillatelse krever frisk coach/admin og tilgang til spilleren", async () => {
  reset();
  const { createVideoUploadTicket } = await video();
  await assert.rejects(createVideoUploadTicket(metadata), /unauthenticated/);
  bruker = { id: "spiller-a", role: "PLAYER" };
  await assert.rejects(createVideoUploadTicket(metadata), /forbidden/);
  bruker = { id: "coach-b", role: "COACH" };
  await assert.rejects(createVideoUploadTicket(metadata), /ikke tilgang/);
  assert.equal(opprettetRader, 0);
  assert.equal(signedTickets.length, 0);
  bruker = { id: "admin-1", role: "ADMIN" };
  await createVideoUploadTicket(metadata);
  assert.equal(rows.get("v-ny")?.coachId, "admin-1");
});

test("tillatelsen er låst til serverens objekt og oppretter en ekte, uferdig rad", async () => {
  reset(); bruker = { id: "coach-a", role: "COACH" };
  const { createVideoUploadTicket } = await video();
  assert.deepEqual(await createVideoUploadTicket(metadata), {
    videoId: "v-ny", path: "videos/v-ny.mp4", token: "synthetic-token", bucket: "coaching-videos",
  });
  assert.deepEqual(signedTickets, [{ path: "videos/v-ny.mp4", options: { upsert: false } }]);
  assert.equal(rows.get("v-ny")?.videoUrl, "");
  assert.equal(rows.get("v-ny")?.status, "PROCESSING");
  assert.equal(notificationCount, 0);
  assert.ok(buckets.every(bucket => bucket === "coaching-videos"));
});

test("metadata avviser tom fil, oversize, falsk MIME, manglende felt og klientvalgte stier", async () => {
  reset(); bruker = { id: "coach-a", role: "COACH" };
  const { createVideoUploadTicket } = await video();
  for (const invalid of [
    { ...metadata, sizeBytes: 0 }, { ...metadata, sizeBytes: 500 * 1024 * 1024 + 1 },
    { ...metadata, sizeBytes: 1.5 }, { ...metadata, mimeType: "text/html" },
    { ...metadata, title: " " }, { ...metadata, playerId: "" },
    { ...metadata, path: "videos/fremmed.mp4" }, { ...metadata, bucket: "public" },
  ]) {
    // Simuler ugyldig nettverksinput selv om vanlige TypeScript-kall er typet.
    await assert.rejects(createVideoUploadTicket(invalid as typeof metadata), /Kontroller/);
  }
  assert.equal(opprettetRader, 0);
  await createVideoUploadTicket({ ...metadata, sizeBytes: 500 * 1024 * 1024 });
  assert.equal(rows.get("v-ny")?.sizeBytes, 500 * 1024 * 1024);
});

test("booking må tilhøre både valgt spiller og denne coachen", async () => {
  reset(); bruker = { id: "coach-a", role: "COACH" };
  const { createVideoUploadTicket, confirmVideoUpload } = await video();
  for (const invalid of [null, { userId: "spiller-b", coachId: "coach-a" }, { userId: "spiller-a", coachId: "coach-b" }]) {
    booking = invalid;
    await assert.rejects(createVideoUploadTicket({ ...metadata, bookingId: "booking-1" }), /Bookingen/);
  }
  assert.equal(opprettetRader, 0);
  booking = { userId: "spiller-a", coachId: "coach-a" };
  await createVideoUploadTicket({ ...metadata, bookingId: "booking-1" });
  storeVideo();
  booking = { userId: "spiller-a", coachId: "coach-b" };
  await assert.rejects(confirmVideoUpload("v-ny"), /Bookingen/);
  assert.equal(rows.get("v-ny")?.status, "PROCESSING");
});

test("bekreftelse sjekker frisk rolle, opplaster-eierskap og fortsatt spillertilgang", async () => {
  reset(); bruker = { id: "coach-a", role: "COACH" };
  const { createVideoUploadTicket, confirmVideoUpload } = await video();
  await createVideoUploadTicket(metadata); storeVideo();
  bruker = null;
  await assert.rejects(confirmVideoUpload("v-ny"), /unauthenticated/);
  bruker = { id: "spiller-a", role: "PLAYER" };
  await assert.rejects(confirmVideoUpload("v-ny"), /forbidden/);
  bruker = { id: "coach-b", role: "COACH" };
  await assert.rejects(confirmVideoUpload("v-ny"), /forbidden/);
  bruker = { id: "admin-1", role: "ADMIN" };
  await assert.rejects(confirmVideoUpload("v-ny"), /forbidden/);
  bruker = { id: "coach-a", role: "COACH" }; revoked = true;
  await assert.rejects(confirmVideoUpload("v-ny"), /ikke tilgang/);
  assert.equal(infoCalls.length, 0);
  assert.equal(notificationCount, 0);
});

test("manglende fil og feil i navn, størrelse, MIME, filhode eller signering deler aldri videoen", async () => {
  const { createVideoUploadTicket, confirmVideoUpload } = await video();
  for (const changes of [null, { name: "videos/fremmed.mp4" }, { size: 23 }, { contentType: "video/webm" }, { header: new Uint8Array(24) }]) {
    reset(); bruker = { id: "coach-a", role: "COACH" };
    await createVideoUploadTicket(metadata);
    if (changes) storeVideo("videos/v-ny.mp4", changes);
    await assert.rejects(confirmVideoUpload("v-ny"));
    assert.equal(rows.get("v-ny")?.status, "PROCESSING");
    assert.equal(rows.get("v-ny")?.videoUrl, "");
    assert.equal(notificationCount, 0);
    assert.equal(slettetRader.length, 0);
  }
  reset(); bruker = { id: "coach-a", role: "COACH" };
  await createVideoUploadTicket(metadata); storeVideo();
  signedError = { message: "signering nede" };
  await assert.rejects(confirmVideoUpload("v-ny"), /videoinnholdet/);
  assert.equal(rows.get("v-ny")?.status, "PROCESSING");
});

test("uavklart tillatelse beholder raden, og bekreftelse kan prøves igjen etter filen kommer", async () => {
  reset(); bruker = { id: "coach-a", role: "COACH" };
  const { createVideoUploadTicket, confirmVideoUpload } = await video();
  ticketError = { message: "mistet svar" };
  await assert.rejects(createVideoUploadTicket(metadata), /klar for opplasting/);
  assert.equal(rows.get("v-ny")?.status, "PROCESSING");
  assert.equal(slettetRader.length, 0);
  await assert.rejects(confirmVideoUpload("v-ny"), /ikke bekreftet lagret/);
  storeVideo();
  assert.deepEqual(await confirmVideoUpload("v-ny"), { ok: true, videoId: "v-ny" });
  assert.equal(rows.get("v-ny")?.videoUrl, "videos/v-ny.mp4");
});

test("parallelle bekreftelser og senere gjenforsøk gir bare én READY-overgang og ett varsel", async () => {
  reset(); bruker = { id: "coach-a", role: "COACH" };
  const { createVideoUploadTicket, confirmVideoUpload } = await video();
  await createVideoUploadTicket(metadata); storeVideo();
  const results = await Promise.all([confirmVideoUpload("v-ny"), confirmVideoUpload("v-ny")]);
  assert.ok(results.every(result => result.ok && result.videoId === "v-ny"));
  assert.equal(rows.get("v-ny")?.status, "READY");
  assert.equal(notificationCount, 1);
  await confirmVideoUpload("v-ny");
  assert.equal(notificationCount, 1);
});

test("MOV og WEBM bekreftes kun fra egne serverkonstruerte stier med tilsvarende filhode", async () => {
  const { createVideoUploadTicket, confirmVideoUpload } = await video();
  for (const [mimeType, extension, header] of [
    ["video/quicktime", "mov", new Uint8Array([0, 0, 0, 16, 102, 116, 121, 112, 113, 116, 32, 32, 0, 0, 0, 0])],
    ["video/webm", "webm", new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 0, 119, 101, 98, 109])],
  ] as const) {
    reset(); bruker = { id: "coach-a", role: "COACH" };
    const ticket = await createVideoUploadTicket({ ...metadata, mimeType });
    assert.equal(ticket.path, `videos/v-ny.${extension}`);
    storeVideo(ticket.path, { contentType: mimeType, header });
    assert.deepEqual(await confirmVideoUpload(ticket.videoId), { ok: true, videoId: "v-ny" });
    assert.equal(rows.get("v-ny")?.videoUrl, ticket.path);
  }
});
