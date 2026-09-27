/**
 * Route-nivå-test for `/api/team-norway/dokumenter` (POST).
 * `lagreTnDokument` (innhold/signatur/størrelse, unik sti, opprydding) er
 * allerede testet uten server i `tn-dokument-lagring.test.ts`. Denne testen
 * dekker det selve ruten skal garantere FØR den kaller domenelaget:
 * origin, autentisering, gruppetilgang og filgrense — i den rekkefølgen,
 * uten å konsumere requestbody når en tidligere port stenger. Ingen ekte
 * Storage brukes.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let bruker: { id: string; role: "COACH" | "ADMIN" | "PLAYER" } | null = { id: "coach-1", role: "COACH" };
let gruppetilgang = true;
let lagreKall: { groupId: string; forfatterId: string; fileSize: number }[] = [];
const MAKS_BYTES_TEST = 200; // liten grense i testen — selve 50 MB-verdien er dekket av tn-dokument-lagring.test.ts

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/action-guards", {
  namedExports: {
    requireCoachActionUser: async () => {
      if (!bruker) throw new Error("unauthenticated");
      return bruker;
    },
  },
});
mock.module("@/lib/domain/tn-post", {
  namedExports: {
    krevDokumentOpplastingstilgang: async (groupId: string, forfatterId: string) => {
      void groupId; void forfatterId;
      if (!gruppetilgang) throw new Error("avvist");
    },
  },
});
mock.module("@/lib/domain/tn-dokument-lagring", {
  namedExports: {
    MAKS_TN_DOKUMENT_BYTES: MAKS_BYTES_TEST,
    lagreTnDokument: async (groupId: string, forfatterId: string, fil: File) => {
      lagreKall.push({ groupId, forfatterId, fileSize: fil.size });
      return { ok: true };
    },
  },
});

function reset() {
  bruker = { id: "coach-1", role: "COACH" };
  gruppetilgang = true;
  lagreKall = [];
}
reset();

function multipartBody(filInnhold: string, filnavn = "plan.pdf") {
  const boundary = "----tngrense";
  const body =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${filnavn}"\r\n` +
    `Content-Type: application/pdf\r\n\r\n` +
    `${filInnhold}\r\n` +
    `--${boundary}--\r\n`;
  return { body, contentType: `multipart/form-data; boundary=${boundary}` };
}

async function post(opts: {
  origin?: string | null;
  groupId?: string | null;
  body?: string;
  contentType?: string;
  contentLength?: number;
} = {}) {
  const { POST } = await import("./route");
  const url = `http://localhost/api/team-norway/dokumenter${opts.groupId === undefined ? "?groupId=gruppe-tn" : opts.groupId === null ? "" : `?groupId=${encodeURIComponent(opts.groupId)}`}`;
  const headers: Record<string, string> = {};
  if (opts.origin !== null) headers.origin = opts.origin ?? "http://localhost";
  if (opts.contentType) headers["content-type"] = opts.contentType;
  if (opts.contentLength !== undefined) headers["content-length"] = String(opts.contentLength);
  return POST(new Request(url, { method: "POST", headers, body: opts.body }));
}

test("feil origin avvises før innlogging, gruppeport eller body leses", async () => {
  reset();
  const { body, contentType } = multipartBody("innhold");
  const res = await post({ origin: "https://ondsinnet.example", body, contentType });
  assert.equal(res.status, 403);
  assert.equal(lagreKall.length, 0);
});

test("manglende origin-header avvises på samme måte som feil origin", async () => {
  reset();
  const res = await post({ origin: null });
  assert.equal(res.status, 403);
});

test("ikke-trener avvises før gruppeporten sjekkes", async () => {
  reset();
  bruker = null;
  const { body, contentType } = multipartBody("innhold");
  const res = await post({ body, contentType });
  assert.equal(res.status, 403);
  assert.equal(lagreKall.length, 0);
});

test("ugyldig/manglende groupId avvises med 400", async () => {
  reset();
  const res = await post({ groupId: null });
  assert.equal(res.status, 400);
  assert.equal(lagreKall.length, 0);
});

test("ingen skrivetilgang til gruppen: 403 før body konsumeres eller lagres", async () => {
  reset();
  gruppetilgang = false;
  const { body, contentType } = multipartBody("innhold");
  const res = await post({ body, contentType });
  assert.equal(res.status, 403);
  assert.equal(lagreKall.length, 0);
});

test("content-length over grensen avvises med 413 uten å lese body", async () => {
  reset();
  const { body, contentType } = multipartBody("x".repeat(50));
  const res = await post({ body, contentType, contentLength: MAKS_BYTES_TEST + 64 * 1024 + 1 });
  assert.equal(res.status, 413);
  assert.equal(lagreKall.length, 0);
});

test("body strømmer over grensen selv om content-length lyver: avbrytes med 413", async () => {
  reset();
  // Ingen content-length-header (unngår den tidlige sjekken) — grensen håndheves under lesing.
  const { body, contentType } = multipartBody("x".repeat(MAKS_BYTES_TEST + 64 * 1024 + 500));
  const res = await post({ body, contentType });
  assert.equal(res.status, 413);
  assert.equal(lagreKall.length, 0);
});

test("gyldig opplasting under grensen når hele porten: kaller lagreTnDokument med riktig gruppe/bruker", async () => {
  reset();
  const { body, contentType } = multipartBody("kort innhold");
  const res = await post({ body, contentType });
  assert.equal(res.status, 200);
  assert.equal(lagreKall.length, 1);
  assert.equal(lagreKall[0]?.groupId, "gruppe-tn");
  assert.equal(lagreKall[0]?.forfatterId, "coach-1");
});

test("ingen fil i skjemaet gir en ærlig 400", async () => {
  reset();
  const boundary = "----tomt";
  const body = `--${boundary}--\r\n`;
  const res = await post({ body, contentType: `multipart/form-data; boundary=${boundary}` });
  assert.equal(res.status, 400);
  assert.equal(lagreKall.length, 0);
});
